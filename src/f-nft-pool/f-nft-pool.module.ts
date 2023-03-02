import {
  SettingWallet,
  SettingWalletSchema,
} from '~/schemas/setting-wallet.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from '../upload/upload.service';
import { FNftPoolController } from './f-nft-pool.admin.controller';
import { FNftPoolService } from './f-nft-pool.service';
import { FNFTPoolValidator } from './f-nft-pool.validator';
import { NftService } from '../nft/nft.service';
import { TieringStructureService } from '../tiering-structure/tiering-structure.service';
import {
  HistoryStaking,
  HistoryStakingSchema,
} from '../schemas/staking-history.schema';
import {
  BatchLabel,
  BatchLabelSchema,
  FNFTPool,
  FNFTPoolSchema,
  NFT,
  NFTSchema,
  Path,
  PathSchema,
  Serial,
  SerialSchema,
  TieringStructure,
  TieringStructureSchema,
  Timeline,
  TimelineSchema,
  User,
  UserSchema,
  TieringPool,
  TieringPoolSchema,
  RewardPoolSchema,
  RewardPool,
  PurchaseFNFTSchema,
  PurchaseFNFT,
  Signer,
  SignerSchema,
} from '~/schemas';
import { FNFTPoolUserController } from './f-nft-pool.user.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy';
import {
  MetaDataFields,
  MetaDataFieldSchema,
} from '../schemas/metadata-fields.schema';
import { IdPool, IdPoolSchema } from '../schemas/idPool.schema';
import { CommonService } from '~/common-service/common.service';
import { ClaimRewardService } from '~/claim-reward/claim-reward.service';
import {
  ClaimRewardHistory,
  ClaimRewardHistorySchema,
} from '~/schemas/claim-reward-history.schema';
import { SignerService } from '~/signer/signer.service';
import { Nonce, NonceSchema } from '~/schemas/nonce.schema';
import { PriceToken, PriceTokenSchema } from '~/schemas/price-token.schema';
import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import { NFTLog, NFTLogSchema } from '~/schemas/nft-log.schema';
import { EventsGateway } from '~/socket/socket.gateway';
import { SystemWalletService } from '~/system-wallet/system-wallet.service';
import {
  SystemWallet,
  SystemWalletSchema,
} from '~/schemas/system-wallet.schema';
import { EmailModule } from '~/services/email/email.module';
import { GasLimit, GasLimitSchema } from '~/schemas/gas-limit.schema';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
    }),
    MongooseModule.forFeature([
      { name: FNFTPool.name, schema: FNFTPoolSchema },
      { name: NFT.name, schema: NFTSchema },
      { name: BatchLabel.name, schema: BatchLabelSchema },
      { name: User.name, schema: UserSchema },
      { name: Timeline.name, schema: TimelineSchema },
      { name: Serial.name, schema: SerialSchema },
      { name: Path.name, schema: PathSchema },
      { name: TieringStructure.name, schema: TieringStructureSchema },
      { name: HistoryStaking.name, schema: HistoryStakingSchema },
      { name: TieringPool.name, schema: TieringPoolSchema },
      { name: RewardPool.name, schema: RewardPoolSchema },
      { name: PurchaseFNFT.name, schema: PurchaseFNFTSchema },
      { name: MetaDataFields.name, schema: MetaDataFieldSchema },
      { name: IdPool.name, schema: IdPoolSchema },
      { name: ClaimRewardHistory.name, schema: ClaimRewardHistorySchema },
      { name: Signer.name, schema: SignerSchema },
      { name: Nonce.name, schema: NonceSchema },
      { name: PriceToken.name, schema: PriceTokenSchema },
      { name: TimeSetting.name, schema: TimeSettingSchema },
      { name: NFTLog.name, schema: NFTLogSchema },
      { name: SystemWallet.name, schema: SystemWalletSchema },
      { name: SettingWallet.name, schema: SettingWalletSchema },
      { name: GasLimit.name, schema: GasLimitSchema },
    ]),
    EmailModule,
  ],
  controllers: [FNftPoolController, FNFTPoolUserController],
  providers: [
    FNftPoolService,
    UploadService,
    FNFTPoolValidator,
    NftService,
    TieringStructureService,
    JwtStrategy,
    CommonService,
    ClaimRewardService,
    SignerService,
    EventsGateway,
    SystemWalletService,
  ],
  exports: [FNftPoolService],
})
export class FNftPoolModule {}
