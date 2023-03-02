import { Module } from '@nestjs/common';
import { LandService } from './land.service';
import { LandController } from './land.controller';

@Module({
  controllers: [LandController],
  providers: [LandService]
})
export class LandModule {}
