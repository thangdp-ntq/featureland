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
import { ValidateAddressWalletService } from '~/common/services/validate-wallet-address.service';
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
import {
  SystemWallet,
  SystemWalletSchema,
} from '~/schemas/system-wallet.schema';
import { EmailModule } from '~/services/email/email.module';
import { GasLimit, GasLimitSchema } from '~/schemas/gas-limit.schema';

@Module({
  imports: [
    WinstonModule,
    MongooseModule.forFeature(),
    CommonModule,
    EmailModule,
  ],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    UploadService,
    NftService,
    EventsGateway,
    ValidateAddressWalletService,
    SignerService,
    CommonService,
  ],
})
export class WebhookModule {}
