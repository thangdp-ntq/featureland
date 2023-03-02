import { Inject, Injectable, CACHE_MANAGER, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache, CachingConfig } from 'cache-manager';
import {
  PRICE_CACHE,
  TTL_CACHE_DECIMALS,
  TTL_CACHE_PRICE,
} from '~/common/constants';
import { Utils } from '~/common/utils';
import { CoinMarketGateway } from '~/providers/coin-market/coin-market.gateway';
import { CoinMarketType } from '~/providers/coin-market/coin-market.type';
import { PriceToken, PriceTokenDocument } from '~/schemas/price-token.schema';
import { Web3Gateway } from '../blockchain/web3.gateway';
import {
  TimeSetting,
  TimeSettingDocument,
} from '~/schemas/time-setting.schema';
const Web3 = require('web3');
import Web3Type from 'web3';
import { AwsUtils } from '~/common/aws.util';
import { EmailService, Mail } from '~/services/email/email.service';
import { EMAIL_CONFIG } from '~/common/email-config';
@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);
  constructor(
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(PriceToken.name)
    private priceTokenModel: Model<PriceTokenDocument>,
    @InjectModel(TimeSetting.name)
    private timeSettingModel: Model<TimeSettingDocument>,
  ) {}

  logError(error: Error) {
    this.logger.error(error.message, error.stack);
  }

  async setCache(key: string, data: any, options?: CachingConfig) {
    try {
     // await this.cacheManager.set(key, data, options);
    } catch (error) {
      this.logError(error);
    }
  }

  getCache(key: string) {
   // return this.cacheManager.get(key) as any;
  }

  async delCache(key: string) {
    //await this.cacheManager.del(key);
  }

  async getCacheDecimals(
    web3Gateway: Web3Gateway,
    address: any,
  ): Promise<number> {
    // let decimals: string = await this.getCache(address);
    // if (!decimals || decimals === '0') {
    //   const result = await web3Gateway.getDecimal(address);
    //   decimals = result.decimals;
    //   await this.cacheManager.set(address, decimals, {
    //     ttl: TTL_CACHE_DECIMALS,
    //   });
    // }
     return Number(1);
  }

  async createAccount() {
    const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
    const account = await web3Gateway.createAccount();
    const privateKey = await AwsUtils.encrypt(account['privateKey']);
    const response = {
      publicKey: account['address'],
      privateKey: privateKey,
    };
    return response;
  }

  async getBalanceAddress(address: string) {
    try {
      const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
      const balance = await web3Gateway.getBalance(String(address));
      return Number(balance) / 1e18;
    } catch (err) {
      throw err;
    }
  }

  async getStatus(txId: string) {
    try {
      const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
      return web3Gateway.getTransactionReceipt(txId);
    } catch (err) {
      throw err;
    }
  }

  async encrypt(privateKey: string) {
    try {
      return await AwsUtils.encrypt(privateKey);
    } catch (err) {
      throw err;
    }
  }

  async decrypt(privateKeyHash: string) {
    try {
      return await AwsUtils.decrypt(privateKeyHash);
    } catch (err) {
      throw err;
    }
  }

  async getPriceUsdByContract(tokenAddress: string) {
    try {
      const key = `${tokenAddress}-${PRICE_CACHE}`;
      // const price = await this.getCache(key);
      // if (price) {
      //   this.logger.debug('get Price in cache: ' + price);
      //   return price;
      // }
      let retry = 1;
      while (true) {
        try {
          await this.delCache(key);
          const coinGecko = new CoinMarketGateway(CoinMarketType.COINGECKO);
          const coinPrices = await coinGecko.getPriceUsdByContract(
            tokenAddress,
          );
          await this.setCache(key, coinPrices, { ttl: TTL_CACHE_PRICE });
          await this.priceTokenModel.findOneAndUpdate(
            { contractAddress: tokenAddress },
            { usdPrice30Days: coinPrices },
            { upsert: true },
          );
          this.logger.debug(
            'get coin prices in coingeko: ',
            JSON.stringify(coinPrices),
          );
          return coinPrices;
        } catch (error) {
          this.logger.warn(
            `get Price(): Retrying ${retry} time. ${error.message}`,
          );
          retry++;
          if (retry > 3) {
            throw error;
          }
          await Utils.wait(300);
        }
      }
    } catch (error) {
      this.logger.log('Waiting find data in db');
      const priceInDB = await this.priceTokenModel.findOne({
        contractAddress: tokenAddress,
      });
      if (priceInDB && priceInDB.usdPrice30Days)
        return priceInDB.usdPrice30Days;
      this.logger.error('Error when get coinPrice():: ', error);
      throw Error('Error when get coinPrices(): ');
    }
  }

  async checkTimeAllowLogin(address: string): Promise<boolean> {
    const timeSetting = await this.timeSettingModel.find({
      isActive: true,
      admins: address,
    });
    const dateTimeLocal = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Singapore',
      hourCycle: 'h23',
    });
    const datePrefix = '01/01/1970';
    const timeLocal = new Date(dateTimeLocal).toTimeString().split(' ')[0];
    const dayOfWeek = new Date(dateTimeLocal).getDay();
    for (let i = 0; i < timeSetting.length; i++) {
      if (!timeSetting[i].days.includes(dayOfWeek)) continue;

      const timeFrom = `${datePrefix} ${timeSetting[i].hourFrom}`;
      const timeTo = `${datePrefix} ${timeSetting[i].hourTo}`;
      const timeCurrent = `${datePrefix} ${timeLocal}`;

      const check =
        Date.parse(timeFrom) <= Date.parse(timeCurrent) &&
        Date.parse(timeCurrent) <= Date.parse(timeTo);
      if (check) return true;
    }
    return false;
  }
}
