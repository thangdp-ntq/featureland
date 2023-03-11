import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Region, RegionDocument } from "~/schemas/region.schema";
import { Model } from "mongoose";
import ObjectID from "bson-objectid";
import { Land, LandDocument } from "~/schemas/land.schema";
import { NFT, NFTDocument } from "~/schemas";

@Injectable()
export class RegionService {
  constructor(
    @InjectModel(Region.name) private regionCollection: Model<RegionDocument>,
    @InjectModel(Land.name) private landCollection: Model<LandDocument>,
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>
  ) {}
  async findAll() {
    const regions = await this.regionCollection.find();
    return regions;
  }

  async findOne({ id }) {
    const region = await this.regionCollection.findById(ObjectID(id.id));
    const lands = await this.landCollection.find({ regionId: id.id });
    const nfts = await this.nftModel.find({ regionId: id.id });
    const totalOwner = new Set(lands.map((e) => e.ownerAddress)).size;
    return { ...region["_doc"], totalOwner: totalOwner, totalNft: nfts.length };
  }
}
