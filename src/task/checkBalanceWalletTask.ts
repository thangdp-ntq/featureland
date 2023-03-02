import {
  SettingWallet,
  SettingWalletDocument,
} from '~/schemas/setting-wallet.schema';
import { FNftPoolModule } from './../f-nft-pool/f-nft-pool.module';
import { FNftPoolService } from './../f-nft-pool/f-nft-pool.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { FNFTPool, FNFTPoolDocument } from '~/schemas/f-nft-pool.schema';
import {
  SystemWallet,
  SystemWalletDocument,
  WALLET_TYPE,
} from '~/schemas/system-wallet.schema';
import { SystemWalletService } from '~/system-wallet/system-wallet.service';
@Injectable()
export class CheckBalanceTask {
  private readonly logger = new Logger(CheckBalanceTask.name);
  @InjectModel(SettingWallet.name)
  private settingWalletModel: Model<SettingWalletDocument>;
  @InjectModel(SystemWallet.name)
  private systemWalletModel: Model<SystemWalletDocument>;
  constructor(private readonly systemWalletService: SystemWalletService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async _executeCheckBalance() {
    const { limitPurchase, limitClaim, receiver } =
      await this.settingWalletModel.findOne();
    const wallets = await this.systemWalletModel.find();
    if (wallets.length) {
      for (const wallet of wallets) {
        const type = wallet.type;
        await this.checkSystemWallet(
          type,
          wallet,
          limitPurchase,
          limitClaim,
          receiver,
        );
      }
    }
  }

  async checkSystemWallet(type, wallet, limitPurchase, limitClaim, receiver) {
    const limitBalance =
      type === WALLET_TYPE.PURCHASE ? limitPurchase : limitClaim;
    await this.systemWalletService.checkBalanceJob(
      wallet.publicKey,
      limitBalance,
      type,
      receiver,
    );
  }
}
