import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseFNftService } from './purchase-f-nft.service';
import { PurchaseFNftUserController } from './purchase-f-nft.user.controller';
import { PurchaseFNftValidator } from './purchase-f-nft.validator';
import {
  PurchaseFNFT,
  PurchaseFNFTSchema,
  FNFTPool,
  FNFTPoolSchema,
  Signer,
  SignerSchema,
} from '~/schemas';
import { SignerService } from '../signer/signer.service';
import { CommonService } from '~/common-service/common.service';
import { Nonce, NonceSchema } from '~/schemas/nonce.schema';
import { PriceToken, PriceTokenSchema } from '~/schemas/price-token.schema';
import { CommonModule } from '~/common-service/common.module';
import { TimeSetting, TimeSettingSchema } from '~/schemas/time-setting.schema';
import { EventsGateway } from '~/socket/socket.gateway';
import { SystemWalletService } from '~/system-wallet/system-wallet.service';
import {
  SystemWallet,
  SystemWalletSchema,
} from '~/schemas/system-wallet.schema';
import { EmailModule } from '~/services/email/email.module';
import {
  SettingWallet,
  SettingWalletSchema,
} from '~/schemas/setting-wallet.schema';
import { GasLimit, GasLimitSchema } from '~/schemas/gas-limit.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseFNFT.name, schema: PurchaseFNFTSchema },
      { name: FNFTPool.name, schema: FNFTPoolSchema },
      { name: Signer.name, schema: SignerSchema },
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
  controllers: [PurchaseFNftUserController],
  providers: [
    PurchaseFNftService,
    PurchaseFNftValidator,
    SignerService,
    CommonService,
    EventsGateway,
    SystemWalletService,
  ],
})
export class PurchaseFNftModule {}
