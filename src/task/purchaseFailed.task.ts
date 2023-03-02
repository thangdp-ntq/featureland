import { Web3Gateway } from '~/blockchain/web3.gateway';
import {
  PurchaseFNFT,
  PurchaseFNFTDocument,
} from './../schemas/purchase-f-nft.schema';
import { HttpStatus, Injectable, Logger, Controller } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import {
  PURCHASE_STATUS,
  TRANSACTION_PAID_GAS_STATUS,
} from '~/common/constants';
import { Web3ETH } from '~/blockchain/web3.eth';
import { HttpError } from '~/common/responses/api-errors';
import {
  SystemWallet,
  SystemWalletDocument,
  WALLET_TYPE,
} from '~/schemas/system-wallet.schema';
import { Utils } from '~/common/utils';
import BigNumber from 'bignumber.js';
import { AwsUtils } from '~/common/aws.util';
import { SystemWalletService } from '~/system-wallet/system-wallet.service';
import ObjectID from 'bson-objectid';
@Injectable()
export class PurchaseFailedTask {
  private readonly logger = new Logger(PurchaseFailedTask.name);
  @InjectModel(PurchaseFNFT.name)
  private readonly purchaseModel: Model<PurchaseFNFTDocument>;
  constructor(private readonly systemWalletService: SystemWalletService) {}

  @Cron('*/15 * * * * *') // every 15s
  async handleTaskPurchase() {
    const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
    const txPending = await this.purchaseModel.find({
      gasFeeStatus: TRANSACTION_PAID_GAS_STATUS.PAID_PENDING,
      bePaidGasFee: true,
    });

    if (txPending.length) {
      const wallet = await this.systemWalletService.checkAndSelectSystemWallet(
        WALLET_TYPE.PURCHASE,
        true,
      );
      await Promise.all(
        txPending.map(async (purchase) => {
          try {
            await this._sendTransaction(purchase, wallet, web3Gateway);
          } catch (error) {}
        }),
      );
    }
  }

  async _sendTransaction(purchase, wallet, web3Gateway) {
    this.logger.warn(
      `Starting resend transaction for purchase:; ${purchase.id} `,
    );
    await this.purchaseModel.updateOne(
      { _id: new ObjectID(purchase.id) },
      {
        gasFeeStatus: TRANSACTION_PAID_GAS_STATUS.PAID_PROCESSING,
      },
    );

    try {
      const dataContract = {
        userWalletAddress: purchase.userWalletAddress,
        purchaseFNFT: purchase.purchaseFNFT,
        purchaseId: purchase.id,
        amountUSDT: Utils.convertNumberToNoExponents(purchase.amount),
        signature: purchase.signature,
        poolId: purchase.poolId,
        allocationUSDT: purchase.allocationUSDT,
        nonce: Number(purchase.nonce),
      };

      const [signedData, privateKey] = await Promise.all([
        this.callPurchaseMethodABI(dataContract),
        AwsUtils.decrypt(wallet.privateKey as string),
      ]);

      const tx = {
        from: wallet.publicKey,
        to: process.env.CONTRACT_PROXY,
        data: signedData,
      };

      const gas = await this.estimateGasPurchase(tx, web3Gateway);
      const nonceTransaction = purchase.nonceTransaction;
      tx['gas'] = gas;
      tx['nonce'] = nonceTransaction;

      this.logger.log(`Start Transaction::  ${new Date().toISOString()}`);
      const signedTransaction = await web3Gateway.signTransaction(
        tx,
        privateKey,
      );
      const sendSignedTransaction = await web3Gateway.sendSignedTransaction(
        signedTransaction.rawTransaction,
      );
      this.logger.log(`End Transaction:: ${new Date().toISOString()}`);
      this.logger.log(`hash:: ${sendSignedTransaction.transactionHash}`);
      await this.purchaseModel.updateOne(
        { _id: new ObjectID(purchase.id) },
        {
          txId: sendSignedTransaction.transactionHash,
          gasFeeStatus: TRANSACTION_PAID_GAS_STATUS.PAID_SUCCESS,
        },
      );
    } catch (error) {
      this.logger.error(
        `Transaction purchase failed: ${JSON.stringify(error)}`,
      );
      await this.purchaseModel.updateOne(
        { _id: new ObjectID(purchase.id) },
        {
          gasFeeStatus: TRANSACTION_PAID_GAS_STATUS.PAID_PENDING,
        },
      );
    }
  }

  async callPurchaseMethodABI(dataContract: any) {
    const contractProxy = await new Web3ETH().getContractInstance();
    return await contractProxy.methods
      .purchaseFNFT(
        [
          dataContract.poolId,
          dataContract.amountUSDT,
          dataContract.allocationUSDT,
          dataContract.purchaseFNFT,
          dataContract.nonce,
        ],
        dataContract.purchaseId,
        dataContract.signature,
        dataContract.userWalletAddress,
      )
      .encodeABI();
  }

  async estimateGasPurchase(tx: any, web3Gateway: Web3Gateway) {
    try {
      const estimatedGas = await web3Gateway.estimateGas(tx);
      const gas = estimatedGas + Math.round((estimatedGas * 10) / 100);
      this.logger.log(`gas:: ${gas}`);
      return gas;
    } catch (error) {
      throw error;
    }
  }
}
