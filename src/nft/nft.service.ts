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
import * as jsonAbi1155 from "./abi.json";
const Web3 = require("web3");
const provider = "https://bsc-dataseed1.defibit.io";
const connection = new Web3(provider);
const contractAddress = "0xa2E10D8Bce2a4bB2454C4ad81aaF5EaDBb92C132";
const { methods } = new connection.eth.Contract(jsonAbi1155, contractAddress);
const { balanceOf, tokenOfOwnerByIndex } = methods;
@Injectable()
export class NftService {
  constructor(
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(NFTLog.name) private logModel: Model<NFTLogDocument>,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async getNfts({
    pageSize = 10,
    page = 1,
    tab = 1,
    ...getParams
  }): Promise<any> {
    if (getParams.landId) {
      const listnft = await this.nftModel.find({ landId: getParams.landId });
      let res: any = new Array(500).fill("");
      for (let index = 0; index < listnft.length; index++) {
        res[index] = listnft[index];
      }
      return res;
    }
    const match: Record<string, any> = {};
    if (getParams.tokenId) {
      match["tokenId"] = getParams.tokenId;
    }
    if (getParams.canAddNft) {
      match["landId"] = "";
    }
    if (getParams.landId) {
      match["landId"] = getParams.landId;
    }
    if (getParams.ownerAddress) {
      match["ownerAddress"] = getParams.ownerAddress.toLowerCase();
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

      let totalItem = pageInfo?.totalItem;
      const totalPages = Math.ceil(totalItem / pageSize);
      const length = result.items?.length;
      if (getParams.landId && length < 50) {
        result.items.push(
          Array(49 - length)
            .join(".")
            .split(".")
        );
        totalItem = 250;
      }
      return {
        items: result.items.flat(),
        pageCurrent: page,
        totalDocs: totalItem,
        hasPrevPage: page > 1 && totalItem > 0,
        hasNextPage: page < totalPages,
      };
    }
  }

  async findOne(id: number) {
    const nft = await this.nftModel.findOne({ tokenId: id });
    return nft;
  }

  async TranferNftFile(data) {
    const address = data.address.trim().toLowerCase();
    console.log(address);
    balanceOf(address)
      .call()
      .then(async (e) => {
        for (let index = 0; index < e; index++) {
          tokenOfOwnerByIndex(address, index)
            .call()
            .then(async (e) => {
              console.log(e);
              const nft = await this.nftModel.findOne({
                tokenId: Number(e),
              });
              if (nft) {
                await this.nftModel.updateOne(
                  { tokenId: Number(e) },
                  { ownerAddress: address }
                );
              } else {
                await this.nftModel.create({
                  ownerAddress: address,
                  image: `https://api.futurecity.me/images/nft${
                    (e % 10) + 1
                  }.png`,
                  tokenId: Number(e),
                });
              }
              return true;
            });
        }
      });
  }
  async TranferNft(data) {
    console.log(data)
    const nftLogs = await this.logModel.findOne({
      transactionHash: data.transactionHash,
    });
    if (nftLogs) return true;
    const nft = await this.nftModel.findOne({
      tokenId: Number(data.metadata.tokenId),
    });
    if (nft) {
      console.log(nft,186)
      await this.nftModel.updateOne(
        { tokenId: Number(data.metadata.tokenId) },
        { ownerAddress: data.metadata.to.toLowerCase() }
      );
      const nft1 = await this.nftModel.findOne({
        tokenId: Number(data.metadata.tokenId),
      });
      console.log(nft1,191)
    } else {
      await this.nftModel.create({
        ownerAddress: data.metadata.to.toLowerCase(),
        image: `https://api.futurecity.me/images/nft${
          (data.metadata.tokenId % 10) + 1
        }.png`,
        tokenId: Number(data.metadata.tokenId),
      });
    }
    const nft12 = await this.nftModel.findOne({
      tokenId: Number(data.metadata.tokenId),
    });
    console.log(12,nft12)
    await this.logModel.create({
      data: JSON.stringify(data),
      tokenId: data.metadata.tokenId,
      from: data.metadata.from,
      to: data.metadata.to.toLowerCase(),
      contractAddress: data.contractAddress,
      eventName: data.eventName,
      recordId: data.recordId,
      transactionHash: data.transactionHash,
    });
    return true;
  }

  async updateLock(data){
    const {owner, tokenIds}= data.metadata
    await this.nftModel.updateMany(
      { tokenId: { $in: tokenIds } },
      {
        depositAddress:owner
      }
    );
    await this.logModel.create({
      data: JSON.stringify(data),
      tokenId: data.metadata.tokenId,
      to: owner.toLowerCase(),
      contractAddress: data.contractAddress,
      eventName: data.eventName,
      recordId: data.recordId,
      transactionHash: data.transactionHash,
    });
  }
}
