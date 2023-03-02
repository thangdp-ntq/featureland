import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PurchaseFNFTDto } from './dto/purchase-f-nft.dto';
import { Model } from 'mongoose';
import { FNFTPool, FNFTPoolDocument } from '../schemas';
import {
  NFT_RESPOND_MESSAGE,
  POOL_NFT_MESSAGE,
  PURCHASE_F_NFT_RESPONSE,
} from '../common/constants';
import BigNumber from 'bignumber.js';

@Injectable()
export class PurchaseFNftValidator {
  constructor(
    @InjectModel(FNFTPool.name) private fNFTModel: Model<FNFTPoolDocument>,
  ) {}
  async validateDataPurchaseFNFT(purchase: PurchaseFNFTDto) {
    const errors = [];
    const validatePool = await this.checkPoolPurchase(purchase);
    if (!validatePool.isValid) {
      errors.push(validatePool.message);
    }
    const validateAddress = await this.checkValidUserWalletAddress(
      purchase.poolId,
      purchase.userWalletAddress,
    );
    if (!validateAddress.isValid) {
      errors.push(validateAddress.message);
    }

    const validateAmount = await this.checkValidAmount(purchase);
    if (!validateAmount.isValid) {
      errors.push(validateAmount.message);
    }
    return {
      isValid: errors.length <= 0,
      errors: errors,
    };
  }

  async checkValidUserWalletAddress(poolId, address) {
    const isUserWalletAddressValid = await this.fNFTModel.exists({
      poolId,
      'users.address': address,
      tier: { $ne: null },
    });
    return {
      isValid: isUserWalletAddressValid ? true : false,
      message: isUserWalletAddressValid
        ? ''
        : PURCHASE_F_NFT_RESPONSE.USER_WALLET_NOT_EXIST,
    };
  }

  async checkValidAmount(purchase: PurchaseFNFTDto) {
    const fNFT = await this.fNFTModel.findOne({
      'users.address': purchase.userWalletAddress,
      poolId: purchase.poolId,
    });
    if (!fNFT)
      return {
        isValid: false,
        message: NFT_RESPOND_MESSAGE.NFT_NOT_FOUND,
      };
    const amount = new BigNumber(purchase.amount);
    const user = fNFT.users.find(
      (e) => e.address === purchase.userWalletAddress,
    );
    const remainAmount = new BigNumber(user.remaining);
    return {
      isValid: remainAmount.isGreaterThanOrEqualTo(amount) ? true : false,
      message: remainAmount.isGreaterThanOrEqualTo(amount)
        ? ''
        : PURCHASE_F_NFT_RESPONSE.REMAIN_AMOUNT_NOT_ENOUGH,
    };
  }

  async checkPoolPurchase(purchase: PurchaseFNFTDto) {
    const pool = await this.fNFTModel.findOne({ poolId: purchase.poolId });
    if (!pool) {
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.POOL_NOT_FOUND,
      };
    }
    if (
      new BigNumber(pool.fNFT.availableAmount)
        .multipliedBy(new BigNumber(pool.fNFT.exchangeRates))
        .isLessThan(purchase.amount)
    ) {
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.FNFT_NOT_ENOUGH_PURCHASE,
      };
    }
    if (new Date() < pool.purchaseStartTime)
      return {
        isValid: false,
        message: PURCHASE_F_NFT_RESPONSE.POOL_IS_NOT_OPEN_SELL,
      };

    if (new Date() >= pool.purchaseEndTime) {
      return {
        isValid: false,
        message: PURCHASE_F_NFT_RESPONSE.POOL_IS_SOLD,
      };
    }
    return {
      isValid: true,
    };
  }
}
