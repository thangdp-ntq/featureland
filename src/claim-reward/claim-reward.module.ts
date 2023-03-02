import { SystemWalletService } from '~/system-wallet/system-wallet.service';
import { CommonModule } from './../common-service/common.module';
import { Module } from '@nestjs/common';
import { ClaimRewardService } from './claim-reward.service';
import { ClaimRewardController } from './claim-reward.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FNFTPool,
  FNFTPoolSchema,
  RewardPool,
  Signer,
  SignerSchema,
} from '../schemas';
import { RewardPoolSchema } from '~/schemas';
import { SignerService } from '../signer/signer.service';
import {
  ClaimRewardHistory,
  ClaimRewardHistorySchema,
} from '../schemas/claim-reward-history.schema';
import { CommonService } from '~/common-service/common.service';
import { Nonce, NonceSchema } from '~/schemas/nonce.schema';
import { PriceToken, PriceTokenSchema } from '~/schemas/price-token.schema';
import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import {
  SystemWallet,
  SystemWalletSchema,
} from '~/schemas/system-wallet.schema';
import { EmailModule } from '~/services/email/email.module';
import { EventsGateway } from '~/socket/socket.gateway';
import {
  SettingWallet,
  SettingWalletSchema,
} from '~/schemas/setting-wallet.schema';
import { GasLimit, GasLimitSchema } from '~/schemas/gas-limit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FNFTPool.name, schema: FNFTPoolSchema },
      { name: Signer.name, schema: SignerSchema },
      { name: RewardPool.name, schema: RewardPoolSchema },
      { name: ClaimRewardHistory.name, schema: ClaimRewardHistorySchema },
      { name: Nonce.name, schema: NonceSchema },
      { name: PriceToken.name, schema: PriceTokenSchema },
      { name: TimeSetting.name, schema: TimeSettingSchema },
      { name: SystemWallet.name, schema: SystemWalletSchema },
      { name: SettingWallet.name, schema: SettingWalletSchema },
      { name: GasLimit.name, schema: GasLimitSchema },
    ]),
    CommonModule,
    EmailModule,
  ],
  controllers: [ClaimRewardController],
  providers: [
    ClaimRewardService,
    SignerService,
    CommonService,
    SystemWalletService,
    EventsGateway,
  ],
})
export class ClaimRewardModule {}
