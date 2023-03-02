import { SystemWalletService } from './../system-wallet/system-wallet.service';
import { NONCE, Nonce, NonceDocument } from '../schemas/nonce.schema';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  FNFTPool,
  FNFTPoolDocument,
  PurchaseFNFT,
  PurchaseFNFTDocument,
} from '../schemas';
import { Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { PurchaseFNFTDto } from './dto/purchase-f-nft.dto';
import { PurchaseFNftValidator } from './purchase-f-nft.validator';
import { ErrorDetail } from '../common/responses/api-error';
import {
  BLOCKCHAIN_NETWORK,
  CommonCode,
  DECIMALS_DAD,
  EVENT_SOCKET,
  PURCHASE_F_NFT_RESPONSE,
  PURCHASE_STATUS,
  RETRY_INTERVAL,
  TRANSACTION_PAID_GAS_STATUS,
  TypeSign,
} from '../common/constants';
import { SignerService } from '../signer/signer.service';
import { Web3Gateway } from '../blockchain/web3.gateway';
import BigNumber from 'bignumber.js';
import { Utils } from '../common/utils';
import { CommonService } from '~/common-service/common.service';
import mongoose from 'mongoose';
import { Web3ETH } from '~/blockchain/web3.eth';
const Web3 = require('web3');
import Web3Type from 'web3';
import { AwsUtils } from '~/common/aws.util';
import {
  WALLET_TYPE,
  SystemWallet,
  SystemWalletDocument,
} from '~/schemas/system-wallet.schema';
import ObjectID from 'bson-objectid';
import { EventsGateway } from '~/socket/socket.gateway';
import { HttpError } from '~/common/responses/api-errors';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FastifyLoader } from '@nestjs/serve-static';

@Injectable()
export class PurchaseFNftService {
  private readonly logger = new Logger(PurchaseFNFT.name);
  constructor(
    @InjectModel(PurchaseFNFT.name)
    private purchaseFNFTModel: Model<PurchaseFNFTDocument>,
    @InjectModel(FNFTPool.name)
    private fNFTModel: Model<FNFTPoolDocument>,
    @InjectModel(Nonce.name)
    private nonceModel: Model<NonceDocument>,
    @InjectModel(SystemWallet.name)
    private systemWalletModel: Model<SystemWalletDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly purchaseFNFTValidator: PurchaseFNftValidator,
    private readonly signerService: SignerService,
    private readonly commonService: CommonService,
    private readonly systemWalletService: SystemWalletService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async handlePurchaseFNFT(purchaseData: PurchaseFNFTDto) {
    const pool = await this.fNFTModel.findOne({ poolId: purchaseData.poolId });
    if (pool.bePaidGasFee) {
      this.logger.warn(`Handle purchase in gas fee pool`);
      return await this.purchaseFNFTInGasFeePool(purchaseData);
    }

    return await this.purchaseFNFTInNomalPool(purchaseData);
  }

  async purchaseFNFTInNomalPool(purchaseData: PurchaseFNFTDto) {
    const validateData =
      await this.purchaseFNFTValidator.validateDataPurchaseFNFT(purchaseData);
    if (!validateData.isValid) {
      throw new ErrorDetail(CommonCode.PER06, validateData.errors);
    }
    const pool = await this.fNFTModel.findOne({ poolId: purchaseData.poolId });
    const signer = await this.signerService.getSigner(BLOCKCHAIN_NETWORK.BSC);
    const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
    const privateKey = await web3Gateway.decrypt(signer.hashKey);
    const decimals = await this.commonService.getCacheDecimals(
      web3Gateway,
      pool.acceptedCurrencyAddress,
    );
    const user = this.getUserPool(pool, purchaseData.userWalletAddress);
    /* 
  - if amount USDT = remaining (user can purchase) 
    then purchaseFNFT = allcationEachUser(max FNFT user can by) - fnftBalance ( fnft user has purchased)
  - else : purchaseFNFT = amount (USDT) / exchangeRates !!!( toFixed 8 decimal digits and round down)
  */
    let purchaseFNFT: string;
    if (Number(purchaseData.amount) === Number(user.remaining)) {
      purchaseFNFT = new BigNumber(user.allocationEachUser)
        .minus(new BigNumber(user.fnftBalance) || 0)
        .multipliedBy(Math.pow(10, DECIMALS_DAD))
        .toFixed(0, 1)
        .toString();
    } else {
      purchaseFNFT = new BigNumber(purchaseData.amount)
        .dividedBy(pool.fNFT.exchangeRates)
        .multipliedBy(Math.pow(10, DECIMALS_DAD))
        .toFixed(0, 1)
        .toString();
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const nonceBefore = await this.nonceModel.findOne();
      const nonceAfter = await this.nonceModel.findOneAndUpdate(
        {
          id: NONCE,
          purchaseNonce: nonceBefore['purchaseNonce'],
          updatedAt: nonceBefore['updatedAt'],
        },
        {
          $inc: { purchaseNonce: 1 },
        },
        { new: true, session: session },
      );
      const nonce = nonceAfter.purchaseNonce;
      const signature = await web3Gateway.sign(
        [
          purchaseData.poolId,
          new BigNumber(purchaseData.amount).multipliedBy(
            Math.pow(10, decimals),
          ),
          Number(nonce),
          Number(TypeSign.purchaseFNFT),
          purchaseData.userWalletAddress,
        ],
        privateKey,
      );

      const purchaseDB: PurchaseFNFT = {
        userWalletAddress: purchaseData.userWalletAddress,
        amount: new BigNumber(purchaseData.amount)
          .multipliedBy(Math.pow(10, decimals))
          .toString(),
        decimals: String(decimals),
        poolId: purchaseData.poolId,
        nonce: Number(nonce),
        poolName: pool.poolName.en,
        signature: signature,
        allocation: user.allocationEachUser, // so FNFT user co the mua toi da trong pool
        status: PURCHASE_STATUS.PURCHASE_PROCESSING,
      };
      const purchaseNFT = await this.purchaseFNFTModel.create([purchaseDB], {
        session: session,
      });
      if (nonceAfter && purchaseNFT) {
        await session.commitTransaction();
        return {
          userWalletAddress: purchaseData.userWalletAddress,
          purchaseFNFT,
          purchaseId: purchaseNFT[0].id,
          amountUSDT: Utils.convertNumberToNoExponents(purchaseNFT[0].amount),
          signature: purchaseNFT[0].signature,
          poolId: purchaseNFT[0].poolId,
          allocationUSDT: Utils.convertNumberToNoExponents(
            new BigNumber(user.eachUserUSDT)
              .multipliedBy(Math.pow(10, decimals))
              .toString(),
          ),
          nonce: Number(nonce),
        };
      }
      if (!nonceAfter || !purchaseNFT) {
        throw 'Update failed';
      }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async purchaseFNFTInGasFeePool(purchaseData: PurchaseFNFTDto) {
    // validate data
    const validateData =
      await this.purchaseFNFTValidator.validateDataPurchaseFNFT(purchaseData);
    if (!validateData.isValid) {
      throw new ErrorDetail(CommonCode.PER06, validateData.errors);
    }
    const pool = await this.fNFTModel.findOne({ poolId: purchaseData.poolId });
    const signer = await this.signerService.getSigner(BLOCKCHAIN_NETWORK.BSC);
    const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
    const privateKey = await web3Gateway.decrypt(signer.hashKey);
    const decimals = await this.commonService.getCacheDecimals(
      web3Gateway,
      pool.acceptedCurrencyAddress,
    );
    const user = this.getUserPool(pool, purchaseData.userWalletAddress);
    if (user?.remainOfPurchase === 0) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        CommonCode.PURCHASED_LIMIT_REACHED,
        CommonCode.PURCHASED_LIMIT_REACHED,
      );
    }
    /*
    - if amount USDT = remaining (user can purchase)
      then purchaseFNFT = allcationEachUser(max FNFT user can by) - fnftBalance ( fnft user has purchased)
    - else : purchaseFNFT = amount (USDT) / exchangeRates !!!( toFixed 8 decimal digits and round down)
    */
    let purchaseFNFT: string;
    if (Number(purchaseData.amount) === Number(user.remaining)) {
      purchaseFNFT = new BigNumber(user.allocationEachUser)
        .minus(new BigNumber(user.fnftBalance) || 0)
        .multipliedBy(Math.pow(10, DECIMALS_DAD))
        .toFixed(0, 1)
        .toString();
    } else {
      purchaseFNFT = new BigNumber(purchaseData.amount)
        .dividedBy(pool.fNFT.exchangeRates)
        .multipliedBy(Math.pow(10, DECIMALS_DAD))
        .toFixed(0, 1)
        .toString();
    }
    //select wallet and check by LIMIT set in contant file = 0.01 BNB
    const wallet = await this.systemWalletService.checkAndSelectSystemWallet(
      WALLET_TYPE.PURCHASE,
      true,
    );
    const session = await this.connection.startSession();
    let isSucceed = true;
    let purchaseNFT;
    let nonce;
    await session.withTransaction(async () => {
      try {
        //get nonce handle purchase
        const nonceBefore = await this.nonceModel.findOne();
        const nonceAfter = await this.nonceModel.findOneAndUpdate(
          {
            id: NONCE,
            purchaseNonce: nonceBefore['purchaseNonce'],
            updatedAt: nonceBefore['updatedAt'],
          },
          {
            $inc: { purchaseNonce: 1 },
          },
          { new: true, session: session },
        );
        nonce = nonceAfter.purchaseNonce;

        // sign signature
        const signature = await web3Gateway.sign(
          [
            purchaseData.poolId,
            new BigNumber(purchaseData.amount).multipliedBy(
              Math.pow(10, decimals),
            ),
            Number(nonce),
            Number(TypeSign.purchaseFNFT),
            wallet.publicKey, // edit vi
          ],
          Utils.revertFromBytes(privateKey),
        );

        //crate document purchase history
        const purchaseDB: PurchaseFNFT = {
          userWalletAddress: purchaseData.userWalletAddress,
          amount: new BigNumber(purchaseData.amount)
            .multipliedBy(Math.pow(10, decimals))
            .toString(),
          decimals: String(decimals),
          poolId: purchaseData.poolId,
          purchaseFNFT: purchaseFNFT,
          nonce: Number(nonce),
          poolName: pool.poolName.en,
          signature: signature,
          allocation: user.allocationEachUser, // so FNFT user co the mua toi da trong pool
          allocationUSDT: Utils.convertNumberToNoExponents(
            new BigNumber(user.eachUserUSDT)
              .multipliedBy(Math.pow(10, decimals))
              .toString(),
          ),
          status: PURCHASE_STATUS.PURCHASE_PROCESSING,
          bePaidGasFee: true,
        };
        purchaseNFT = await this.purchaseFNFTModel.create([purchaseDB], {
          session: session,
        });
        if (!nonceAfter || !purchaseNFT) {
          throw 'Update failed';
        }
      } catch (error) {
        isSucceed = false;
        throw error;
      }
    });
    session.endSession();

    // transaction succeed => call contract
    if (isSucceed) {
      const dataContract = {
        userWalletAddress: purchaseData.userWalletAddress,
        purchaseFNFT,
        purchaseId: purchaseNFT[0].id,
        amountUSDT: Utils.convertNumberToNoExponents(purchaseNFT[0].amount),
        signature: purchaseNFT[0].signature,
        poolId: purchaseNFT[0].poolId,
        allocationUSDT: Utils.convertNumberToNoExponents(
          new BigNumber(user.eachUserUSDT)
            .multipliedBy(Math.pow(10, decimals))
            .toString(),
        ),
        nonce: Number(nonce),
      };

      const [signedData, privateKey] = await Promise.all([
        this.callPurchaseMethodABI(dataContract, purchaseData),
        AwsUtils.decrypt(wallet.privateKey as string),
      ]);

      const tx = {
        from: wallet.publicKey,
        to: process.env.CONTRACT_PROXY,
        data: signedData,
      };
      const gas = await this.estimateGasPurchase(tx, web3Gateway);
      const nonceTransaction = await this.getNonceWithReTry(
        web3Gateway,
        wallet.publicKey,
      );

      tx['gas'] = gas;
      tx['nonce'] = nonceTransaction;

      try {
        this.logger.log(`Start Transaction::  ${new Date().toISOString()}`);
        const signedTransaction = await web3Gateway.signTransaction(
          tx,
          privateKey,
        );
        const sendSignedTransaction = await web3Gateway.sendSignedTransaction(
          signedTransaction.rawTransaction,
        );
        this.logger.log(
          `End Transaction, nonce ${nonceTransaction}:: ${new Date().toISOString()}`,
        );
        this.logger.log(`hash:: ${sendSignedTransaction.transactionHash}`);
        await this.purchaseFNFTModel.updateOne(
          { _id: new ObjectID(purchaseNFT[0].id) },
          {
            txId: sendSignedTransaction.transactionHash,
            gasFeeStatus: TRANSACTION_PAID_GAS_STATUS.PAID_SUCCESS,
            nonceTransaction: nonceTransaction,
          },
        );
        // this.eventsGateway.sendMessage(
        //   EVENT_SOCKET.PURCHASE_SUCCESS,
        //   dataContract,
        // );
        return { success: true };
      } catch (error) {
        this.logger.error(
          `Transaction purchase failed, nonce: ${nonceTransaction}: ${JSON.stringify(
            error,
          )}`,
        );
        if (error?.receipt?.status === false) {
          throw HttpError.error(
            HttpStatus.BAD_REQUEST,
            CommonCode.ER05,
            CommonCode.ER05,
          );
        }
        const update = await this.purchaseFNFTModel.updateOne(
          { _id: new ObjectID(purchaseNFT[0].id) },
          {
            gasFeeStatus: TRANSACTION_PAID_GAS_STATUS.PAID_PENDING,
            nonceTransaction: nonceTransaction,
          },
        );
      }
    }
  }

  getUserPool(pool, userAddress) {
    return pool.users.find((user) => user.address === userAddress);
  }

  async estimateGasPurchase(tx: any, web3Gateway: Web3Gateway) {
    try {
      const estimatedGas = await web3Gateway.estimateGas(tx);
      const gas = estimatedGas + Math.round((estimatedGas * 10) / 100);
      this.logger.log(`gas:: ${gas}`);
      return gas;
    } catch (error) {
      this.logger.error(`Error estimateGas: ${error}`);

      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        CommonCode.ER04,
        CommonCode.ER04,
      );
    }
  }

  async getNonce(web3Gateway: Web3Gateway, publicKey: string) {
    const currentNonce = await web3Gateway.getTransactionCountAddress(
      publicKey,
    );

    const wallet = await this.systemWalletModel.findOne({
      publicKey: publicKey,
    });

    const currentSavedNonce = wallet.nonce;
    let timeGetNonce = wallet.updatedAt;

    if (currentNonce > currentSavedNonce) {
      const updateWallet = await this.systemWalletModel.findOneAndUpdate(
        {
          publicKey: publicKey,
          updatedAt: timeGetNonce,
        },
        {
          nonce: currentNonce,
        },
      );
      if (!updateWallet) throw 'Sync Nonce Failed';
      timeGetNonce = updateWallet.updatedAt;
    }

    const nextNonce = await this.systemWalletModel.findOneAndUpdate(
      {
        publicKey: publicKey,
        updatedAt: timeGetNonce,
      },
      {
        $inc: {
          nonce: 1,
        },
      },
      { new: false },
    );
    if (!nextNonce) throw 'Increase nonce failed';
    this.logger.log(`nonce CT:: ${currentNonce}, nonceDB:: ${nextNonce.nonce}`);
    return nextNonce.nonce;
  }

  private async getNonceWithReTry(web3Gateway: Web3Gateway, publicKey: string) {
    while (true) {
      try {
        const nonce = await this.getNonce(web3Gateway, publicKey);
        return nonce;
      } catch (error) {
        this.logger.log(`Retry one time nonce`);
        await Utils.timeout(RETRY_INTERVAL);
        continue;
      }
    }
  }

  async callPurchaseMethodABI(dataContract: any, purchaseData: any) {
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
        purchaseData.userWalletAddress,
      )
      .encodeABI();
  }
}
