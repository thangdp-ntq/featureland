import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Region, RegionDocument } from '~/schemas/region.schema';
import { Model } from 'mongoose';
import ObjectID from 'bson-objectid';
import { Land, LandDocument } from '~/schemas/land.schema';

@Injectable()
export class RegionService {
  constructor(
    @InjectModel(Region.name) private regionCollection: Model<RegionDocument>,
    @InjectModel(Land.name) private landCollection: Model<LandDocument>,
  ) {}
  findAll() {
    return this.regionCollection.find();
  }

  async findOne({id}) {
    const region = await this.regionCollection.findById(ObjectID(id.id))
    // const lands = await this.landCollection.find({_id:id})
    return {...region, avalible:2000, totalNft:0}
  }
}