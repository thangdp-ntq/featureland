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
    const regions = await this.regionCollection.aggregate([
      { $addFields: { regionId: { $toString: "$_id" } } },
      {
        $lookup: {
          from: "Land",
          localField: "regionId",
          foreignField: "regionId",
          as: "land",
          pipeline: [
            {
              $match: {
                ownerAddress: { $ne: "" },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          description: 1,
          name: 1,
          image: 1,
          index: 1,
          activeLand: { $size: "$land" },
        },
      },
    ]);
    return regions;
  }

  async findOne({ id }) {
    const region = await this.regionCollection.findById(ObjectID(id));
    const lands = await this.landCollection.find({
      regionId: id,
      useAddNftAddress: { $ne: "" },
    });
    const nfts = await this.nftModel.find({ regionId: id });
    const totalOwner = new Set(lands.map((e) => e.useAddNftAddress)).size;
    return {
      ...region["_doc"],
      activeLand: lands.length,
      totalOwner: totalOwner,
      totalNft: nfts.length,
    };
  }

  topLand(id: string) {
    return this.landCollection.aggregate([
      { $match: { regionId: id } },
      { $sort: { updatedAt: -1 } },
      { $sort: { numberNfts: -1 } },
      { $skip: 0 },
      { $limit: 5 },
    ]);
  }
}
