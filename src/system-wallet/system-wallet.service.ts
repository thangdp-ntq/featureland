import { HttpStatus, Injectable, Logger, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { CommonService } from '~/common-service/common.service';
import {
  CLAIM_RESPOND,
  CommonCode,
  EVENT_SOCKET,
  GAS_LIMIT,
  MAX_SYSTEM_WALLET,
  PURCHASE_F_NFT_RESPONSE,
  SYSTEM_WALLET_RESPONSE,
} from '~/common/constants';
import { EMAIL_CONFIG } from '~/common/email-config';
import { HttpError } from '~/common/responses/api-errors';
import { GasLimit, GasLimitDocument } from '~/schemas/gas-limit.schema';
import {
  SettingWallet,
  SettingWalletDocument,
} from '~/schemas/setting-wallet.schema';
import {
  SystemWallet,
  SystemWalletDocument,
  WALLET_TYPE,
} from '~/schemas/system-wallet.schema';
import { EmailService, Mail } from '~/services/email/email.service';
import { EventsGateway } from '~/socket/socket.gateway';
import {
  SearchSystemWalletDto,
  SystemWalletDto,
} from './dto/system-wallet.dto';

@Injectable()
export class SystemWalletService {
  private readonly logger = new Logger(SystemWalletService.name);
  constructor(
    @InjectModel(SystemWallet.name)
    private systemWalletModel: Model<SystemWalletDocument>,
    @InjectModel(SettingWallet.name)
    private settingWalletModel: Model<SettingWalletDocument>,
    @InjectModel(GasLimit.name)
    private gasLimitModel: Model<GasLimitDocument>,
    private commonService: CommonService,
    private emailService: EmailService,
    private readonly eventsGateway: EventsGateway,
  ) {}
  async findAllAndGetBalance(query: SearchSystemWalletDto) {
    const match = {};
    if (query.hasOwnProperty('type')) {
      Object.assign(match, { ...match, type: query.type });
    }

    const wallets = await this.systemWalletModel.aggregate([{ $match: match }]);

    const res = await Promise.all(
      wallets.map(async (wallet) => {
        return {
          ...wallet,
          balance: await this.commonService.getBalanceAddress(wallet.publicKey),
        };
      }),
    );

    return { totalDocs: res.length, docs: res };
  }

  // userHandle = true then check limit by const balance 0.01
  async checkAndSelectSystemWallet(type = undefined, userHandle = false) {
    const { limitPurchase, limitClaim, receiver } =
      await this.settingWalletModel.findOne();
    const wallet = await this.systemWalletModel.findOne({ type: type });
    let limitBalance =
      type === WALLET_TYPE.PURCHASE ? limitPurchase : limitClaim;
    if (userHandle) {
      const { gasLimit } = await this.gasLimitModel.findOne();
      limitBalance = gasLimit;
    }
    await this.walletHasEnoughBalance(
      wallet.publicKey,
      limitBalance,
      type,
      receiver,
    );
    return wallet;
  }

  async get(type = undefined) {
    const match = {};
    if (type) {
      Object.assign(match, { ...match, type: type });
    }

    const wallets = await this.systemWalletModel.aggregate([{ $match: match }]);

    return wallets;
  }

  async createWallet(body: SystemWalletDto) {
    if (body.secretKey !== process.env.SECRET_KEY_SYSTEM_WALLET) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        SYSTEM_WALLET_RESPONSE.SYSTEM_WALLET_IN_VALID,
        [SYSTEM_WALLET_RESPONSE.SYSTEM_WALLET_IN_VALID],
      );
    }

    if (await this.checkHasMaxSystemWallet(body.type)) {
      throw HttpError.error(HttpStatus.BAD_REQUEST, 'Limit system wallet', [
        'Limit system wallet',
      ]);
    }
    const dataWallet = await this.commonService.createAccount();
    const wallet = await this.systemWalletModel.create({
      publicKey: dataWallet.publicKey,
      privateKey: dataWallet.privateKey,
      type: body.type,
    });
    return wallet;
  }

  async checkHasMaxSystemWallet(type: number) {
    const totalSystemWallet =
      type == WALLET_TYPE.PURCHASE
        ? MAX_SYSTEM_WALLET.PURCHASE
        : MAX_SYSTEM_WALLET.CLAIM;
    const total = await this.systemWalletModel.find({ type: type });
    if (total.length >= totalSystemWallet) return true;
    return false;
  }

  async walletHasEnoughBalance(address, limitBalance, type, receiver) {
    const balance = await this.commonService.getBalanceAddress(address);
    const walletName =
      type == WALLET_TYPE.PURCHASE ? 'Purchase Wallet' : 'Claim Wallet';
    if (balance < limitBalance) {
      if (receiver.length) {
        const context = {
          walletName: walletName,
          walletAddress: address,
          currentBalance: balance,
          safeThreshold: limitBalance,
        };
        console.log(context);
        const mail = new Mail(
          EMAIL_CONFIG.FROM_EMAIL,
          receiver,
          EMAIL_CONFIG.TITLE.GAS_LIMIT,
          context,
          EMAIL_CONFIG.DIR.SUPPORT,
          'S1',
          EMAIL_CONFIG.MAIL_REPLY_TO,
        );
        await this.emailService.sendMailFrac(mail);
        this.logger.warn(
          `Send mail notification balance in ${type}, address: ${address}`,
        );
      }

      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        CommonCode.ER03,
        CommonCode.ER03,
      );
    }
  }

  async checkBalanceJob(address, limitBalance, type, receiver) {
    const balance = await this.commonService.getBalanceAddress(address);
    const walletName =
      type == WALLET_TYPE.PURCHASE ? 'Purchase Wallet' : 'Claim Wallet';
    if (balance < limitBalance) {
      if (receiver.length) {
        const context = {
          walletName: walletName,
          walletAddress: address,
          currentBalance: balance,
          safeThreshold: limitBalance,
        };
        const mail = new Mail(
          EMAIL_CONFIG.FROM_EMAIL,
          receiver,
          EMAIL_CONFIG.TITLE.GAS_LIMIT,
          context,
          EMAIL_CONFIG.DIR.SUPPORT,
          'S1',
          EMAIL_CONFIG.MAIL_REPLY_TO,
        );
        await this.emailService.sendMailFrac(mail);
        this.logger.warn(
          `Send mail notification balance in ${type}, address: ${address}`,
        );
      }
    }
  }
}
