import { PriceToken, PriceTokenSchema } from '~/schemas/price-token.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceTokenService } from './price-token.service';
import { PriceTokenController } from './price-token.controller';
import { CommonService } from '~/common-service/common.service';
import {
  FNFTPool,
  FNFTPoolSchema,
  RewardPool,
  RewardPoolSchema,
} from '~/schemas';
import { CommonModule } from '~/common-service/common.module';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PriceToken.name, schema: PriceTokenSchema },
      { name: FNFTPool.name, schema: FNFTPoolSchema },
      { name: RewardPool.name, schema: RewardPoolSchema },
    ]),
    CommonModule,
  ],
  controllers: [PriceTokenController],
  providers: [PriceTokenService, EventsGateway],
  exports: [PriceTokenService],
})
export class PriceTokenModule {}
