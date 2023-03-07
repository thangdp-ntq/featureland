import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Land, LandDocument } from "~/schemas/land.schema";
import { Model } from "mongoose";
import { NFT, NFTDocument } from "~/schemas";
import { PipelineStage } from "mongoose";
import { SORT_AGGREGATE } from "~/common/constants";

@Injectable()
export class LandService {
  constructor(
    @InjectModel(Land.name) private landCollection: Model<LandDocument>,
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>
  ) {}

  async findAll({ pageSize = 10, page = 1, ...getParams }) {
    const match: Record<string, any> = {};
    if (getParams.regionId) {
      match["regionId"] = getParams.regionId;
    }
    const sort: Record<string, any> = {};

    if (getParams.sortField && getParams.sortType) {
      sort[getParams.sortField] =
        SORT_AGGREGATE[getParams.sortType.toUpperCase()];
    } else {
      sort["createdAt"] = SORT_AGGREGATE.DESC;
    }
    const piline: PipelineStage[] = [];

    piline.push({
      $match: {
        ...match,
      },
    });

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

  


  findOne(id: string) {
    return this.landCollection.findOne({ id });
  }

  async addNft(id: string, tokens, address) {
    console.log(id);
    const land = await this.landCollection.findOne({ _id: id });
    console.log(land);
    if (!land) {
      throw "Land not found";
    }
    if (land.ownerAddress) {
      throw "Land has owner";
    }
    if (land.useAddNftAddress && land.useAddNftAddress !== address) {
      throw "you wallet cannot add nft0";
    }

    const update = await this.nftModel.updateMany(
      { tokenId: { $in: tokens }, landId: "", ownerAddress: address },
      {
        landId: id,
      }
    );
    console.log(update);
    const nfts = await this.nftModel.find({
      landId: id,
      ownerAddress: address,
    });
    if (nfts.length >= 200 && nfts.length < 500) {
      const updateLand = await this.landCollection.updateOne(
        { _id: id },
        {
          useAddNftAddress: address,
        }
      );
    }
    if (nfts.length === 500) {
      const updateLand = await this.landCollection.updateOne(
        { _id: id },
        {
          ownerAddress: address,
        }
      );
    }
    return await this.landCollection.findOne({ _id: id });
  }
}
