import { GasLimit, GasLimitSchema } from './../schemas/gas-limit.schema';
import {
  SettingWallet,
  SettingWalletSchema,
} from '~/schemas/setting-wallet.schema';
import {
  SystemWallet,
  SystemWalletSchema,
} from '~/schemas/system-wallet.schema';
import {
  PurchaseFNFT,
  PurchaseFNFTSchema,
} from './../schemas/purchase-f-nft.schema';
import {
  ClaimRewardHistory,
  ClaimRewardHistorySchema,
} from './../schemas/claim-reward-history.schema';
import { FNFTPool, FNFTPoolSchema, NFT, NFTSchema } from '~/schemas';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from 'src/common-service/common.module';
import { UpdateFNFTPoolTask } from './updateFNFTPool.task';
import { UpdateFNFTStepTask } from './updateStepFNFTPool.task';
import { ClaimRewardTask } from './claimRewardTask';
import { PurchaseFailedTask } from './purchaseFailed.task';
import { CheckBalanceTask } from './checkBalanceWalletTask';
import { SystemWalletService } from '~/system-wallet/system-wallet.service';
import { EmailModule } from '~/services/email/email.module';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FNFTPool.name, schema: FNFTPoolSchema },
      { name: NFT.name, schema: NFTSchema },
      { name: ClaimRewardHistory.name, schema: ClaimRewardHistorySchema },
      { name: PurchaseFNFT.name, schema: PurchaseFNFTSchema },
      { name: SystemWallet.name, schema: SystemWalletSchema },
      { name: SettingWallet.name, schema: SettingWalletSchema },
      { name: GasLimit.name, schema: GasLimitSchema },
    ]),
    CommonModule,
    EmailModule,
  ],
  providers: [
    UpdateFNFTPoolTask,
    UpdateFNFTStepTask,
    PurchaseFailedTask,
    ClaimRewardTask,
    CheckBalanceTask,
    SystemWalletService,
    EventsGateway,
  ],
})
export class TasksModule {}
