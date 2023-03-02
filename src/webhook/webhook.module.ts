import {
  SettingWallet,
  SettingWalletSchema,
} from '~/schemas/setting-wallet.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { NftService } from '../nft/nft.service';
import {
  BatchLabel,
  BatchLabelSchema,
  NFT,
  NFTSchema,
  User,
  UserSchema,
  FNFTPool,
  FNFTPoolSchema,
  Timeline,
  TimelineSchema,
  Serial,
  SerialSchema,
  Path,
  PathSchema,
  TieringStructure,
  TieringStructureSchema,
  HistoryStaking,
  HistoryStakingSchema,
  TieringPool,
  TieringPoolSchema,
  RewardPool,
  RewardPoolSchema,
  PurchaseFNFT,
  PurchaseFNFTSchema,
  Signer,
  SignerSchema,
} from '~/schemas';
import { EventsGateway } from '../socket/socket.gateway';
import { UploadService } from '../upload/upload.service';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { FNftPoolService } from '../f-nft-pool/f-nft-pool.service';
import { FNFTPoolValidator } from '../f-nft-pool/f-nft-pool.validator';
import { TieringStructureService } from '../tiering-structure/tiering-structure.service';
import { TieringPoolService } from '../tiering-pool/tiering-pool.service';
import { RewardPoolService } from '../reward-pool/reward-pool.service';
import { ValidateAddressWalletService } from '~/common/services/validate-wallet-address.service';
import { ClaimRewardService } from '../claim-reward/claim-reward.service';
import {
  ClaimRewardHistory,
  ClaimRewardHistorySchema,
} from '../schemas/claim-reward-history.schema';
import { SignerService } from '../signer/signer.service';
import {
  MetaDataFields,
  MetaDataFieldSchema,
} from '../schemas/metadata-fields.schema';
import { IdPool, IdPoolSchema } from '../schemas/idPool.schema';
import { CommonService } from '~/common-service/common.service';
import { Nonce, NonceSchema } from '~/schemas/nonce.schema';
import { PriceToken, PriceTokenSchema } from '~/schemas/price-token.schema';
import { CommonModule } from '~/common-service/common.module';
import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import { NFTLog, NFTLogSchema } from '~/schemas/nft-log.schema';
import { SystemWalletService } from '~/system-wallet/system-wallet.service';
import {
  SystemWallet,
  SystemWalletSchema,
} from '~/schemas/system-wallet.schema';
import { EmailModule } from '~/services/email/email.module';
import { GasLimit, GasLimitSchema } from '~/schemas/gas-limit.schema';

@Module({
  imports: [
    WinstonModule,
    MongooseModule.forFeature([
      { name: NFT.name, schema: NFTSchema },
      { name: BatchLabel.name, schema: BatchLabelSchema },
      { name: User.name, schema: UserSchema },
      { name: FNFTPool.name, schema: FNFTPoolSchema },
      { name: Timeline.name, schema: TimelineSchema },
      { name: Serial.name, schema: SerialSchema },
      { name: Path.name, schema: PathSchema },
      { name: TieringStructure.name, schema: TieringStructureSchema },
      { name: HistoryStaking.name, schema: HistoryStakingSchema },
      { name: RewardPool.name, schema: RewardPoolSchema },
      { name: TieringPool.name, schema: TieringPoolSchema },
      { name: RewardPool.name, schema: RewardPoolSchema },
      { name: PurchaseFNFT.name, schema: PurchaseFNFTSchema },
      { name: ClaimRewardHistory.name, schema: ClaimRewardHistorySchema },
      { name: Signer.name, schema: SignerSchema },
      { name: MetaDataFields.name, schema: MetaDataFieldSchema },
      { name: IdPool.name, schema: IdPoolSchema },
      { name: Nonce.name, schema: NonceSchema },
      { name: PriceToken.name, schema: PriceTokenSchema },
      { name: TimeSetting.name, schema: TimeSettingSchema },
      { name: NFTLog.name, schema: NFTLogSchema },
      { name: SystemWallet.name, schema: SystemWalletSchema },
      { name: SettingWallet.name, schema: SettingWalletSchema },
      { name: GasLimit.name, schema: GasLimitSchema },
    ]),
    CommonModule,
    EmailModule,
  ],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    UploadService,
    NftService,
    EventsGateway,
    FNftPoolService,
    FNFTPoolValidator,
    TieringStructureService,
    TieringPoolService,
    RewardPoolService,
    ValidateAddressWalletService,
    ClaimRewardService,
    SignerService,
    CommonService,
    SystemWalletService,
  ],
})
export class WebhookModule {}
