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
