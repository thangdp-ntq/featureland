import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Land, LandDocument } from "~/schemas/land.schema";
import { Model } from "mongoose";
import { NFT, NFTDocument } from "~/schemas";

@Injectable()
export class LandService {
  constructor(
    @InjectModel(Land.name) private landCollection: Model<LandDocument>,
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>
  ) {}

  findAll() {
    return this.landCollection.find();
  }

  findOne(id: string) {
    return this.landCollection.findOne({ id });
  }

  async addNft(id: string, tokens, address) {
    const land = await this.landCollection.findOne({id})
    if(land.ownerId){
      throw "Land has owner";
    }

    if(land.landOwnerAddress!==address){
      throw "Land has owner";
    }
    const nfts = await this.nftModel.find({ tokenId: { $in: tokens } });
    const isOwner = nfts.filter((nft) => nft.ownerId !== address);
    if (isOwner.length > 0) {
      throw "Not Permission";
    }

    return this.landCollection.findOne({});
  }
}
