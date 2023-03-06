import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { NftService } from '../nft/nft.service';
import { EventsGateway } from '../socket/socket.gateway';
import { UploadService } from '../upload/upload.service';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { ValidateAddressWalletService } from '~/common/services/validate-wallet-address.service';
import { SignerService } from '../signer/signer.service';
import { CommonService } from '~/common-service/common.service';
import { CommonModule } from '~/common-service/common.module';
import { EmailModule } from '~/services/email/email.module';
import { PriceToken, PriceTokenSchema } from '~/schemas/price-token.schema';
import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import { NFT, NFTSchema, User, UserSchema } from '~/schemas';
import { NFTLog, NFTLogSchema } from '~/schemas/nft-log.schema';

@Module({
  imports: [
    WinstonModule,
    MongooseModule.forFeature([
      { name: PriceToken.name, schema: PriceTokenSchema },
      { name: TimeSetting.name, schema: TimeSettingSchema },
      { name: NFT.name, schema: NFTSchema },
      { name: User.name, schema: UserSchema },
      { name: NFTLog.name, schema: NFTLogSchema },
    ]),
    CommonModule,
  ],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    EventsGateway,
    ValidateAddressWalletService,
    CommonService,
    NftService
  ],
})
export class WebhookModule {}
