import {
  RewardMultiplier,
  RewardMultiplierSchema,
} from './../schemas/reward-multiplier.schema';
import { Module } from '@nestjs/common';
import { RewardMultiplierService } from './reward-multiplier.service';
import { RewardMultiplierController } from './reward-multiplier.admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '~/common-service/common.module';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RewardMultiplier.name, schema: RewardMultiplierSchema },
    ]),
    CommonModule,
  ],
  controllers: [RewardMultiplierController],
  providers: [RewardMultiplierService, EventsGateway],
})
export class RewardMultiplierModule {}
