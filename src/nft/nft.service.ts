import { NFTLog, NFTLogDocument } from "./../schemas/nft-log.schema";
import { User, UserDocument } from "~/schemas";
import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { NFT, NFTDocument } from "../schemas/NFT.schema";
import { CreateNftDto } from "./dto/create-nft.dto";
import { FractionalizeNFT, UpdateNftDto } from "./dto/update-nft.dto";
import { Model, Connection } from "mongoose";
import {
  API_ERROR,
  API_SUCCESS,
  NFT_Status,
  NFT_RESPOND_MESSAGE,
  SORT_AGGREGATE,
  WEBHOOK_EXCEPTION,
  MIMEType,
  DECIMALS_DAD,
} from "../common/constants";

import { Utils } from "../common/utils";
import { UploadService } from "../upload/upload.service";
import BigNumber from "bignumber.js";
import { ErrorDetail } from "../common/responses/api-error";
import { PipelineStage } from "mongoose";
import { AwsUtils } from "~/common/aws.util";
import { HttpError } from "~/common/responses/api-errors";

@Injectable()
export class NftService {
  constructor(
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(NFTLog.name) private logModel: Model<NFTLogDocument>,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async getNfts({ pageSize = 10, page = 1, ...getParams }): Promise<any> {
    const match: Record<string, any> = {
      deleted: false,
      status: { $not: { $regex: Utils.escapeRegex("processing") } },
    };
    const sort: Record<string, any> = {};

    if (getParams.isDeleted) {
      match["deleted"] = true;
    }

    if (getParams.hasOwnProperty("status")) {
      Object.assign(match, {
        ...match,
        status: { $in: [getParams.status] },
      });
    }
    if (getParams.hasOwnProperty("textSearch")) {
      Object.assign(match, {
        ...match,
        $or: [
          {
            NFTname: {
              $regex: Utils.escapeRegex(getParams.textSearch.trim()),
              $options: "i",
            },
          },
          {
            tokenId: Number(getParams.textSearch.trim()),
          },
        ],
      });
    }

    if (getParams.sortField && getParams.sortType) {
      sort[getParams.sortField] =
        SORT_AGGREGATE[getParams.sortType.toUpperCase()];
    } else {
      if (getParams.isDeleted) {
        sort["deletedOn"] = SORT_AGGREGATE.DESC;
      } else {
        sort["createdAt"] = SORT_AGGREGATE.DESC;
      }
    }
    const piline: PipelineStage[] = [];
    // if(getParams.hasFNFTPool) {
    //   piline.push({
    //     $match: {status
    //       ...match,
    //       FNFTPool: { $ne: []},
    //     },
    //   })
    // }
    if (getParams.hasFNFTPool === undefined) {
      piline.push({
        $match: {
          ...match,
        },
      });
    }
    if (getParams.hasFNFTPool == false) {
      piline.push({
        $match: {
          ...match,
          FNFTPool: [],
        },
      });
    }
    piline.push({
      $lookup: {
        from: "User",
        let: { id: "$createdBy" },
        pipeline: [
          { $match: { $expr: { $eq: ["$address", "$$id"] } } },
          {
            $project: {
              username: 1,
              address: 1,
            },
          },
        ],
        as: "createdBy",
      },
    });
    piline.push({
      $lookup: {
        from: "User",
        let: { id: "$updatedBy" },
        pipeline: [
          { $match: { $expr: { $eq: ["$address", "$$id"] } } },
          {
            $project: {
              username: 1,
              address: 1,
            },
          },
        ],
        as: "updatedBy",
      },
    });
    piline.push({
      $lookup: {
        from: "User",
        let: { id: "$fractionalizeBy" },
        pipeline: [
          { $match: { $expr: { $eq: ["$address", "$$id"] } } },
          {
            $project: {
              username: 1,
              address: 1,
            },
          },
        ],
        as: "fractionalizeBy",
      },
    });
    piline.push({
      $lookup: {
        from: "User",
        let: { id: "$deletedBy" },
        pipeline: [
          { $match: { $expr: { $eq: ["$address", "$$id"] } } },
          {
            $project: {
              username: 1,
              address: 1,
            },
          },
        ],
        as: "deletedBy",
      },
    });
    piline.push(
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$updatedBy", preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: "$fractionalizeBy", preserveNullAndEmptyArrays: true },
      },
      { $unwind: { path: "$deletedBy", preserveNullAndEmptyArrays: true } }
    );

    piline.push({
      $project: {
        NFTname: 1,
        createdAt: 1,
        _id: 1,
        status: 1,
        imageURL: 1,
        tokenId: 1,
        nftTransactionHash: 1,
        fNFTTransactionHash: 1,
        metaDataFields: 1,
        createdBy: 1,
        updatedAt: 1,
        updatedBy: 1,
        deletedOn: 1,
        deletedBy: 1,
        fractionalizeBy: 1,
        fractionalizeOn: 1,
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
    const items = await this.nftModel
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

  async findOne(id: number) {
    const nft = await this.nftModel.findOne({ tokenId: id });
  }

  async TranferNft(data) {
    console.log(data)
    const nft = await this.nftModel.findOne({ tokenId: data.id });
    if (nft) {
     await this.nftModel.updateOne({ id: nft.id }, { ownerId: data.ownerId });
    } else {
      await this.nftModel.create({
        ownerId: "",
        tokenId: "",
      });
    }
    return true;
  }
}
