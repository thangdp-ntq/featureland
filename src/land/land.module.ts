import { Module } from '@nestjs/common';
import { LandService } from './land.service';
import { LandController } from './land.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Land, LandSchema } from '~/schemas/land.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Land.name, schema: LandSchema },
    ]),
  ],
  controllers: [LandController],
  providers: [LandService]
})
export class LandModule {}
