import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FNFTPool,
  FNFTPoolSchema,
  RewardPool,
  RewardPoolSchema,
  User,
  UserSchema,
} from '~/schemas';
import { RewardPoolService } from './reward-pool.service';
import { AdminRewardPoolController } from './reward-pool.admin.controller';
import { ValidateAddressWalletService } from '~/common/services/validate-wallet-address.service';
import { IdPool, IdPoolSchema } from '../schemas/idPool.schema';
import { CommonService } from '~/common-service/common.service';
import { PriceToken, PriceTokenSchema } from '~/schemas/price-token.schema';
import { CommonModule } from '~/common-service/common.module';
import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RewardPool.name, schema: RewardPoolSchema },
      { name: FNFTPool.name, schema: FNFTPoolSchema },
      { name: IdPool.name, schema: IdPoolSchema },
      { name: PriceToken.name, schema: PriceTokenSchema },
      { name: TimeSetting.name, schema: TimeSettingSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CommonModule,
  ],
  controllers: [AdminRewardPoolController],
  providers: [
    RewardPoolService,
    ValidateAddressWalletService,
    CommonService,
    EventsGateway,
  ],
})
export class RewardPoolModule {}
