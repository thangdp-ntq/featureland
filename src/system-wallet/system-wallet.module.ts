import {
  SettingWallet,
  SettingWalletSchema,
} from '~/schemas/setting-wallet.schema';
import { Module } from '@nestjs/common';
import { SystemWalletService } from './system-wallet.service';
import { SystemWalletController } from './system-wallet.admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '~/common-service/common.module';
import {
  SystemWallet,
  SystemWalletSchema,
} from '~/schemas/system-wallet.schema';
import { EmailModule } from '~/services/email/email.module';
import { EventsGateway } from '~/socket/socket.gateway';
import { GasLimit, GasLimitSchema } from '~/schemas/gas-limit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemWallet.name, schema: SystemWalletSchema },
      { name: SettingWallet.name, schema: SettingWalletSchema },
      { name: GasLimit.name, schema: GasLimitSchema },
    ]),
    CommonModule,
    EmailModule,
  ],
  controllers: [SystemWalletController],
  providers: [SystemWalletService, EventsGateway],
})
export class SystemWalletModule {}
