import {
  CLAIM_STATUS,
  TRANSACTION_PAID_GAS_STATUS,
} from './../common/constants';
import {
  ClaimRewardHistory,
  ClaimRewardHistoryDocument,
} from './../schemas/claim-reward-history.schema';
import { Web3Gateway } from '~/blockchain/web3.gateway';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { SystemWalletService } from '~/system-wallet/system-wallet.service';
import { WALLET_TYPE } from '~/schemas/system-wallet.schema';
import { AwsUtils } from '~/common/aws.util';
import ObjectID from 'bson-objectid';
import { Web3ETH } from '~/blockchain/web3.eth';
@Injectable()
export class ClaimRewardTask {
  private readonly logger = new Logger(ClaimRewardTask.name);
  @InjectModel(ClaimRewardHistory.name)
  private readonly claimRewardModel: Model<ClaimRewardHistoryDocument>;
  constructor(private readonly systemWalletService: SystemWalletService) {}

  @Cron('*/15 * * * * *') // every 15s
  async handleTaskPurchase() {
    const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
    const txPending = await this.claimRewardModel.find({
      gasFeeStatus: TRANSACTION_PAID_GAS_STATUS.PAID_PENDING,
      bePaidGasFee: true,
    });

    if (txPending.length) {
      const wallet = await this.systemWalletService.checkAndSelectSystemWallet(
        WALLET_TYPE.CLAIM,
        true,
      );
      await Promise.all(
        txPending.map(async (claim) => {
          try {
            await this._sendTransaction(claim, wallet, web3Gateway);
          } catch (error) {}
        }),
      );
    }
  }

  async _sendTransaction(claim, wallet, web3Gateway) {
    this.logger.warn(`Starting resend transaction for claim:; ${claim.id} `);
    await this.claimRewardModel.updateOne(
      { _id: new ObjectID(claim.id) },
      {
        gasFeeStatus: TRANSACTION_PAID_GAS_STATUS.PAID_PROCESSING,
      },
    );

    try {
      const dataContract = {
        _id: claim._id,
        rewardPoolId: claim.rewardPoolId,
        amountFNFT: claim.amount,
        allocation: claim.allocation,
        rewardUSDT: claim.rewardCash,
        userWalletAddress: claim.userWalletAddress,
        signature: claim.signature,
        nonce: claim.nonce,
      };

      const [signedData, privateKey] = await Promise.all([
        this.callClaimMethodABI(dataContract),
        AwsUtils.decrypt(wallet.privateKey as string),
      ]);

      const tx = {
        from: wallet.publicKey,
        to: process.env.CONTRACT_PROXY,
        data: signedData,
      };

      const gas = await this.estimateGasPurchase(tx, web3Gateway);
      const nonceTransaction = claim.nonceTransaction;
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
      await this.claimRewardModel.updateOne(
        { _id: new ObjectID(claim.id) },
        {
          txId: sendSignedTransaction.transactionHash,
          gasFeeStatus: TRANSACTION_PAID_GAS_STATUS.PAID_SUCCESS,
        },
      );
    } catch (error) {
      this.logger.error(`Transaction claim failed: ${JSON.stringify(error)}`);
      await this.claimRewardModel.updateOne(
        { _id: new ObjectID(claim.id) },
        {
          gasFeeStatus: TRANSACTION_PAID_GAS_STATUS.PAID_PENDING,
        },
      );
    }
  }

  async callClaimMethodABI(dataContract: any) {
    const contractProxy = await new Web3ETH().getContractInstance();
    return await contractProxy.methods
      .claimReward(
        [
          dataContract?.rewardPoolId,
          dataContract?.amountFNFT,
          dataContract?.allocation,
          dataContract?.rewardUSDT,
          dataContract.nonce,
        ],
        dataContract?._id,
        dataContract?.signature,
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
