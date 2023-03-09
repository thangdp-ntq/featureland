import { Module } from '@nestjs/common';
import { RegionService } from './region.service';
import { RegionController } from './region.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Region, RegionSchema } from '~/schemas/region.schema';
import { Land, LandSchema } from '~/schemas/land.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Region.name, schema: RegionSchema },
      { name: Land.name, schema: LandSchema },
    ]),
  ],
  controllers: [RegionController],
  providers: [RegionService]
})
export class RegionModule {}
