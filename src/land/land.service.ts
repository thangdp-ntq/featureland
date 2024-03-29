import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Land, LandDocument } from "~/schemas/land.schema";
import { Model } from "mongoose";
import { NFT, NFTDocument } from "~/schemas";
import { PipelineStage } from "mongoose";
import {
  NUMBER_NFT_TO_ADD_NFT,
  NUMBER_NFT_TO_OWNER,
  SORT_AGGREGATE,
} from "~/common/constants";
import ObjectID from "bson-objectid";
import mongoose from "mongoose";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

@Injectable()
export class LandService {
  constructor(
    @InjectModel(Land.name) private landCollection: Model<LandDocument>,
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  async findAll({ pageSize = 10, page = 1, tab = 1, ...getParams }) {
    const match: Record<string, any> = {};
    if (getParams.regionId) {
      match["regionId"] = getParams.regionId;
    }
    if (getParams.ownerAddress) {
      match["ownerAddress"] = getParams.ownerAddress;
    }
    if (getParams.useAddNftAddress) {
      tab = undefined;
      match["useAddNftAddress"] = getParams.useAddNftAddress?.toLowerCase();
    }
    const sort: Record<string, any> = {
      version: 1,
    };

    if (getParams.sortField && getParams.sortType) {
      sort[getParams.sortField] =
        SORT_AGGREGATE[getParams.sortType.toUpperCase()];
    } else {
      sort["createdAt"] = SORT_AGGREGATE.DESC;
    }
    const piline: PipelineStage[] = [];
    if (tab) {
      match["version"] = { $gt: (tab - 1) * 500, $lte: tab * 500 };
    }
    piline.push({
      $match: {
        ...match,
      },
    });
    console.log(piline);
    const $facet: any = {
      pageInfo: [{ $count: "totalItem" }],
      items: [
        { $sort: sort },
        { $skip: page <= 1 ? 0 : (page - 1) * pageSize },
        { $limit: pageSize },
      ],
    };
    if (Object.values(sort).length) {
      piline.push({ $sort: sort });
      $facet.items.push({ $sort: sort });
      piline.push({ $facet });
    } else {
      piline.push({ $facet });
    }
    const items = await this.landCollection
      .aggregate(piline)
      .collation({ locale: "en_US", strength: 1 });
    if (!items.length) {
      return {
        items: [],
        pageCurrent: page,
        totalDocs: 0,
        hasPrevPage: false,
        hasNextPage: false,
      };
    } else {
      const [result] = items;
      const {
        pageInfo: [pageInfo],
      } = result;

      const totalItem = pageInfo?.totalItem;
      const totalPages = Math.ceil(totalItem / pageSize);
      return {
        items: result.items,
        pageCurrent: page,
        totalDocs: totalItem,
        hasPrevPage: page > 1 && totalItem > 0,
        hasNextPage: page < totalPages,
      };
    }
  }

  async dumpData() {
    const regionIds = [
      "64061c18e99d261694183c13",
      "64061c53e99d261694183c4a",
      "64061c5ae99d261694183c63",
      "64061c62e99d261694183c77",
      "64061c6ee99d261694183c8e",
    ];
    for (let index = 0; index < regionIds.length; index++) {
      const element = regionIds[index];
      for (let index1 = 0; index1 < 2000; index1++) {
        const element1 = index1;
        await this.landCollection.create({
          regionId: element,
          image: `http://139.177.189.219:5001/images/land${
            (index1 % 4) + 1
          }.png`,
          numberNfts: 0,
          version: element1 + 1,
          ownerAddress: "",
          useAddNftAddress: "",
          description: "",
        });
      }
    }
  }

  findOne(id: string) {
    return this.landCollection.aggregate([
      {
        $match: { _id: ObjectID(id) },
      },
      { $addFields: { userId: { $toObjectId: "$regionId" } } },
      {
        $lookup: {
          from: "Region",
          localField: "userId",
          foreignField: "_id",
          as: "Region",
        },
      },
      { $unwind: "$Region" },
    ]);
  }

  // topLand(id: string) {
  //   return this.landCollection.aggregate([
  //     {$match:{regionId:id}},
  //     { $sort: { numberNfts: -1 } },
  //     { $sort: { updatedAt: -1 } },
  //     { $skip: 0 },
  //     { $limit: 3 },
  //   ]);
  // }

  topOwner(id: string) {
    return this.nftModel.aggregate([
      {
        $match: { landId: id },
      },
      {
        $group: {
          _id: "$depositAddress",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
  }

  async addNft(id: string, tokens, address) {
    this.logger.debug(
      `addNft data receive, data=${JSON.stringify({ id, tokens, address })}`
    );
    const land = await this.landCollection.findOne({ _id: id });
    if (!land) {
      this.logger.debug(
        `addNft error, data=${JSON.stringify({
          id,
          tokens,
          address,
          error: "Land not found",
        })}`
      );
      throw "Land not found";
    }
    if (land.ownerAddress) {
      //đủ 500 nft
      this.logger.debug(
        `addNft error, data=${JSON.stringify({
          id,
          tokens,
          address,
          error: "Land has owne",
        })}`
      );
      throw "Land has owner";
    }
    //     if (
    //       land.useAddNftAddress &&
    //       land.useAddNftAddress !== address &&
    //       land.numberNfts >= NUMBER_NFT_TO_ADD_NFT
    //     ) {
    //       // 200 nft và ko phải address
    //       throw "you wallet cannot add nft";
    //     }
    // update nft

    try {
      const session = await this.connection.startSession();
      session.startTransaction();
      try {
        if (tokens.length < 1) {
          return;
        }
        await this.nftModel.updateMany(
          { tokenId: { $in: tokens }, landId: "" },
          {
            landId: id,
            regionId: land.regionId,
          }
        );
        if (!land.useAddNftAddress) {
          await this.landCollection.updateOne(
            { _id: ObjectID(id) },
            {
              useAddNftAddress: address,
            }
          );
        }
        //find nfts
        const nfts = await this.nftModel.find({
          landId: id,
        });
        if (nfts.length >= NUMBER_NFT_TO_OWNER) {
          await this.landCollection.updateOne(
            { _id: ObjectID(id) },
            {
              ownerAddress: land.useAddNftAddress,
            }
          );
        }
        await this.landCollection.updateOne(
          { _id: ObjectID(id) },
          {
            numberNfts: nfts.length,
          }
        );
        await session.commitTransaction();
      } catch (error) {
        this.logger.debug(
          `addNft error 253, data=${JSON.stringify({ id, tokens, address, error })}`
        );
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      this.logger.debug(
        `addNft error 262, data=${JSON.stringify({ id, tokens, address, error })}`
      );
      return error
    }

    return await this.landCollection.findOne({ _id: id });
  }
  async removeNft(id: string, tokens, address) {
    const land = await this.landCollection.findOne({ _id: id });
    if (!land) {
      throw "Land not found";
    }
    if (land.ownerAddress) {
      throw "Land has owner";
    }
    const update = await this.nftModel.updateMany(
      { tokenId: { $in: tokens }, landId: id, ownerAddress: address },
      {
        landId: "",
        regionId: "",
      }
    );
    const nftOfLand = await this.nftModel.find({
      landId: id,
    });

    const updateLand = await this.landCollection.updateOne(
      { _id: ObjectID(id) },
      {
        numberNfts: nftOfLand.length,
      }
    );
    return await this.landCollection.findOne({ _id: id });
  }
}
