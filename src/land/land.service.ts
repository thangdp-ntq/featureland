import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Land, LandDocument } from "~/schemas/land.schema";
import { Model } from "mongoose";

@Injectable()
export class LandService {
  constructor(
    @InjectModel(Land.name) private landCollection: Model<LandDocument>
  ) {}

  findAll() {
    return this.landCollection.find();
  }

  findOne(id: string) {
    return this.landCollection.findOne({id});
  }

  addNft(id: string) {
    return this.landCollection.findOne({id});
  }
}
