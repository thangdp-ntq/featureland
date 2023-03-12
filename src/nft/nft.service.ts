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
    const match: Record<string, any> = {};
    if (getParams.tokenId) {
      match["tokenId"] = getParams.tokenId;
    }
    if (getParams.canAddNft) {
      match["landId"] = ''
    }
    if (getParams.landId) {
      match["landId"] = getParams.landId;
    }
    if (getParams.ownerAddress) {
      match["ownerAddress"] = getParams.ownerAddress;
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
    console.log(piline)
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
    return nft
  }

  async TranferNft(data) {
    const nftLogs = await this.logModel.findOne({
      transactionHash:data.transactionHash
    })
    if(nftLogs) return true
    const nft = await this.nftModel.findOne({
      tokenId: Number(data.metadata.tokenId),
    });
    if (nft) {
      await this.nftModel.updateOne(
        { id: nft.id },
        { ownerAddress: data.metadata.to }
      );
    } else {
      await this.nftModel.create({
        ownerAddress: data.metadata.to,
        tokenId: Number(data.metadata.tokenId),
      });
    }
    await this.logModel.create({
      data: JSON.stringify(data),
      tokenId: data.metadata.tokenId,
      from: data.metadata.from,
      to: data.metadata.to,
      contractAddress: data.contractAddress,
      eventName: data.eventName,
      recordId: data.recordId,
      transactionHash: data.transactionHash,
    });
    return true;
  }
}
