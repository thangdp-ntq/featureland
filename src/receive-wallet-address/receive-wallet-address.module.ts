import { Module } from '@nestjs/common';
import { ReceiveWalletAddressService } from './receive-wallet-address.service';
import { ReceiveWalletAddressController } from './receive-wallet-address.admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReceiveWalletAddress,
  ReceiveWalletAddressSchema,
} from '~/schemas/receive-wallet-address.schema';
import { CommonModule } from '~/common-service/common.module';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReceiveWalletAddress.name, schema: ReceiveWalletAddressSchema },
    ]),
    CommonModule,
  ],
  controllers: [ReceiveWalletAddressController],
  providers: [ReceiveWalletAddressService, EventsGateway],
})
export class ReceiveWalletAddressModule {}
