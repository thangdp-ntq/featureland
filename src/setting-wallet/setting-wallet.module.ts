import { GasLimit, GasLimitSchema } from './../schemas/gas-limit.schema';
import {
  RewardMultiplier,
  RewardMultiplierSchema,
} from '../schemas/reward-multiplier.schema';
import { Module } from '@nestjs/common';
import { SettingWalletService } from './setting-wallet.service';
import { SettingWalletController } from './setting-wallet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '~/common-service/common.module';
import {
  SettingWallet,
  SettingWalletSchema,
} from '~/schemas/setting-wallet.schema';
import { EventsGateway } from '~/socket/socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SettingWallet.name, schema: SettingWalletSchema },
      { name: GasLimit.name, schema: GasLimitSchema },
    ]),
    CommonModule,
  ],
  controllers: [SettingWalletController],
  providers: [SettingWalletService, EventsGateway],
})
export class SettingWalletModule {}
