import {
  SystemWallet,
  SystemWalletDocument,
} from './../schemas/system-wallet.schema';
import { UpdateClaimWorkerDto } from './dto/update-claim-reward.dto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { CreateClaimRewardDto } from './dto/create-claim-reward.dto';
import {
  FNFTPool,
  FNFTPoolDocument,
  RewardPool,
  RewardPoolDocument,
} from '../schemas';
import mongoose, { Model } from 'mongoose';
import { SignerService } from '../signer/signer.service';
import { Web3Gateway } from '../blockchain/web3.gateway';
import BigNumber from 'bignumber.js';
import {
  BLOCKCHAIN_NETWORK,
  CLAIM_RESPOND,
  CLAIM_STATUS,
  CommonCode,
  DECIMALS_DAD,
  EVENT_SOCKET,
  POOL_NFT_MESSAGE,
  PURCHASE_F_NFT_RESPONSE,
  RETRY_INTERVAL,
  TRANSACTION_PAID_GAS_STATUS,
  TypeSign,
} from '../common/constants';
import {
  ClaimRewardHistory,
  ClaimRewardHistoryDocument,
} from '../schemas/claim-reward-history.schema';
import { Utils } from '~/common/utils';
import { CommonService } from '~/common-service/common.service';
import ObjectID from 'bson-objectid';
import { NONCE, Nonce, NonceDocument } from '~/schemas/nonce.schema';
import { Web3ETH } from '~/blockchain/web3.eth';
const Web3 = require('web3');
import Web3Type from 'web3';
import { AwsUtils } from '~/common/aws.util';
import { SystemWalletService } from '~/system-wallet/system-wallet.service';
import { WALLET_TYPE } from '~/schemas/system-wallet.schema';
import { EventsGateway } from '~/socket/socket.gateway';
import { HttpError } from '~/common/responses/api-errors';

@Injectable()
export class ClaimRewardService {
  private readonly logger = new Logger(ClaimRewardService.name);

  constructor(
    @InjectModel(FNFTPool.name)
    private fNFTModel: Model<FNFTPoolDocument>,
    @InjectModel(RewardPool.name)
    private rewardPoolModel: Model<RewardPoolDocument>,
    @InjectModel(Nonce.name)
    private nonceModel: Model<NonceDocument>,

    @InjectModel(SystemWallet.name)
    private systemWalletModel: Model<SystemWalletDocument>,
    @InjectModel(ClaimRewardHistory.name)
    private rewardHistoryModel: Model<ClaimRewardHistoryDocument>,
    private readonly signerService: SignerService,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly commonService: CommonService,
    private readonly systemWalletService: SystemWalletService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async handleClaim(data: CreateClaimRewardDto) {
    const rewardPool = await this.rewardPoolModel.findOne({
      rewardPoolId: data.rewardPoolId,
    });
    if (rewardPool.bePaidGasFee) {
      this.logger.warn(`Handle claim in gas fee pool`);
      return await this.claimPaidGasFee(data);
    }
    return await this.claimNormal(data);
  }

  async claimNormal(createClaimRewardDto: CreateClaimRewardDto) {
    const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
    const signer = await this.signerService.getSigner(BLOCKCHAIN_NETWORK.BSC);
    const privateKey = await web3Gateway.decrypt(signer.hashKey);
    const rewardPool = await this.rewardPoolModel.findOne({
      rewardPoolId: createClaimRewardDto.rewardPoolId,
    });
    if (!rewardPool) return POOL_NFT_MESSAGE.REWARD_POOL_NOT_FOUND;
    if (rewardPool.poolOpenTime > new Date())
      return CLAIM_RESPOND.REWARD_POOL_NOT_OPEN;
    const pool = await this.fNFTModel.findOne({
      poolId: rewardPool.FNFTPoolId,
    });
    if (!pool) return POOL_NFT_MESSAGE.POOL_NOT_FOUND;
    const user = this.getUserPool(pool, createClaimRewardDto.userWalletAddress);
    if (!user) return PURCHASE_F_NFT_RESPONSE.USER_WALLET_NOT_EXIST;
    if (
      // amount = FNFT want claim
      // allocationEachUser fnft number has the right to buy (FNFT)
      // remaining  : remaining fnft to be purchased  (USDT)// là số usdt nó còn lại nó có thể mua
      //Sóo fnft vconf lại để vclaimz  //
      // claim : number USDT  has been claimed// SÔ usdt nó đã claim về
      new BigNumber(createClaimRewardDto.amount).isGreaterThan(
        new BigNumber(user.allocationEachUser)
          .minus(
            new BigNumber(user.remaining).dividedBy(pool.fNFT.exchangeRates),
          )
          .minus(new BigNumber(user.claim).dividedBy(rewardPool.exchangeRates)),
      )
    )
      return CLAIM_RESPOND.AMOUNT_GREATER_THAN_PURCHASE;
    const decimals = await this.commonService.getCacheDecimals(
      web3Gateway,
      rewardPool.tokenContractAddress,
    );
    // rewardCash USDT claim
    const rewardCash = new BigNumber(
      new BigNumber(
        new BigNumber(createClaimRewardDto.amount).multipliedBy(
          new BigNumber(rewardPool.exchangeRates),
        ),
      ).toFixed(decimals - 1, 1),
    )
      .multipliedBy(Math.pow(10, decimals))
      .toString();
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const nonceBefore = await this.nonceModel.findOne({});
      const nonceAfter = await this.nonceModel.findOneAndUpdate(
        {
          id: NONCE,
          updatedAt: nonceBefore['updatedAt'],
          claimNonce: nonceBefore['claimNonce'],
        },
        {
          $inc: { claimNonce: 1 },
        },
        { new: true, session: session },
      );
      const nonce = nonceAfter.claimNonce;
      const signature = await web3Gateway.sign(
        [
          createClaimRewardDto.rewardPoolId,
          new BigNumber(createClaimRewardDto.amount).multipliedBy(
            Math.pow(10, DECIMALS_DAD),
          ),
          Number(nonce),
          TypeSign.claimReward,
          createClaimRewardDto.userWalletAddress,
        ],
        privateKey,
      );

      const rewardHistory = await this.rewardHistoryModel.create(
        [
          {
            amount: new BigNumber(createClaimRewardDto.amount)
              .multipliedBy(Math.pow(10, DECIMALS_DAD))
              .toString(),
            userWalletAddress: createClaimRewardDto.userWalletAddress,
            rewardPoolId: createClaimRewardDto.rewardPoolId,
            poolId: pool.poolId,
            poolName: pool.poolName.en,
            signature,
            allocation: new BigNumber(user.eachUserUSDT)
              .multipliedBy(Math.pow(10, decimals))
              .toString(),
            status: CLAIM_STATUS.CLAIM_PROCESSING,
          },
        ],
        { session: session },
      );
      if (!nonceAfter || !rewardHistory) {
        throw 'Update failed';
      }
      if (nonceAfter && rewardHistory) {
        await session.commitTransaction();
        return {
          _id: rewardHistory[0]._id,
          rewardPoolId: createClaimRewardDto.rewardPoolId,
          amountFNFT: Utils.convertNumberToNoExponents(
            new BigNumber(createClaimRewardDto.amount)
              .multipliedBy(Math.pow(10, DECIMALS_DAD))
              .toString(),
          ),
          allocation: Utils.convertNumberToNoExponents(
            new BigNumber(user.eachUserUSDT)
              .multipliedBy(Math.pow(10, decimals))
              .toString(),
          ),
          rewardUSDT: Utils.convertNumberToNoExponents(rewardCash.toString()),
          userWalletAddress: createClaimRewardDto.userWalletAddress,
          poolName: pool.poolName.en,
          signature,
          status: CLAIM_STATUS.CLAIM_PROCESSING,
          nonce: Number(nonce),
        };
      }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async claimPaidGasFee(createClaimRewardDto: CreateClaimRewardDto) {
    const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
    const signer = await this.signerService.getSigner(BLOCKCHAIN_NETWORK.BSC);
    const privateKey = await web3Gateway.decrypt(signer.hashKey);
    const rewardPool = await this.rewardPoolModel.findOne({
      rewardPoolId: createClaimRewardDto.rewardPoolId,
    });

    if (!rewardPool) return POOL_NFT_MESSAGE.REWARD_POOL_NOT_FOUND;

    if (rewardPool.poolOpenTime > new Date())
      return CLAIM_RESPOND.REWARD_POOL_NOT_OPEN;

    const pool = await this.fNFTModel.findOne({
      poolId: rewardPool.FNFTPoolId,
    });

    if (!pool) return POOL_NFT_MESSAGE.POOL_NOT_FOUND;

    const user = this.getUserPool(pool, createClaimRewardDto.userWalletAddress);

    if (!user) return PURCHASE_F_NFT_RESPONSE.USER_WALLET_NOT_EXIST;

    this._checkAmount(createClaimRewardDto, user, pool, rewardPool);

    const decimals = await this.commonService.getCacheDecimals(
      web3Gateway,
      rewardPool.tokenContractAddress,
    );
    // rewardCash USDT claim
    const rewardCash = new BigNumber(
      new BigNumber(
        new BigNumber(createClaimRewardDto.amount).multipliedBy(
          new BigNumber(rewardPool.exchangeRates),
        ),
      ).toFixed(decimals - 1, 1),
    )
      .multipliedBy(Math.pow(10, decimals))
      .toString();

    const wallet = await this.systemWalletService.checkAndSelectSystemWallet(
      WALLET_TYPE.CLAIM,
      true,
    );
    let isSucceed = true;
    let rewardHistory;
    let signature;
    let nonce;
    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      try {
        // get nonce & update nonce +1
        const nonceBefore = await this.nonceModel.findOne({});
        const nonceAfter = await this.nonceModel.findOneAndUpdate(
          {
            id: NONCE,
            updatedAt: nonceBefore['updatedAt'],
            claimNonce: nonceBefore['claimNonce'],
          },
          {
            $inc: { claimNonce: 1 },
          },
          { new: true, session: session },
        );
        nonce = nonceAfter.claimNonce;

        // sign signature
        signature = await web3Gateway.sign(
          [
            createClaimRewardDto.rewardPoolId,
            new BigNumber(createClaimRewardDto.amount).multipliedBy(
              Math.pow(10, DECIMALS_DAD),
            ),
            Number(nonce),
            TypeSign.claimReward,
            wallet.publicKey,
          ],
          Utils.revertFromBytes(privateKey),
        );

        // create document reward history
        rewardHistory = await this.rewardHistoryModel.create(
          [
            {
              amount: new BigNumber(createClaimRewardDto.amount)
                .multipliedBy(Math.pow(10, DECIMALS_DAD))
                .toString(),
              userWalletAddress: createClaimRewardDto.userWalletAddress,
              rewardPoolId: createClaimRewardDto.rewardPoolId,
              poolId: pool.poolId,
              poolName: pool.poolName.en,
              nonce: Number(nonce),
              signature,
              allocation: new BigNumber(user.eachUserUSDT)
                .multipliedBy(Math.pow(10, decimals))
                .toString(),
              status: CLAIM_STATUS.CLAIM_PROCESSING,
              rewardCash: rewardCash,
              bePaidGasFee: true,
            },
          ],
          { session: session },
        );
        if (!nonceAfter || !rewardHistory) {
          throw 'Update failed';
        }
      } catch (error) {
        isSucceed = false;
        throw error;
      }
    });
    session.endSession();
    if (isSucceed) {
      // when get nonce & create document reward succeed => push transaction
      const dataContract = {
        id: rewardHistory[0].id,
        rewardPoolId: createClaimRewardDto.rewardPoolId,
        amountFNFT: Utils.convertNumberToNoExponents(
          new BigNumber(createClaimRewardDto.amount)
            .multipliedBy(Math.pow(10, DECIMALS_DAD))
            .toString(),
        ),
        allocation: Utils.convertNumberToNoExponents(
          new BigNumber(user.eachUserUSDT)
            .multipliedBy(Math.pow(10, decimals))
            .toString(),
        ),
        rewardUSDT: Utils.convertNumberToNoExponents(rewardCash.toString()),
        userWalletAddress: createClaimRewardDto.userWalletAddress,
        poolName: pool.poolName.en,
        signature,
        status: CLAIM_STATUS.CLAIM_PROCESSING,
        nonce: Number(nonce),
      };

      const [signedData, privateKey] = await Promise.all([
        this.callClaimMethodABI(dataContract, createClaimRewardDto),
        AwsUtils.decrypt(wallet.privateKey as string),
      ]);
      const tx = {
        from: wallet.publicKey,
        to: process.env.CONTRACT_PROXY,
        data: signedData,
      };

      const gas = await this.estimateGasClaim(tx, web3Gateway);
      const nonceTransaction = await this.getNonceWithReTry(
        web3Gateway,
        wallet.publicKey,
      );

      tx['gas'] = gas;
      tx['nonce'] = nonceTransaction;
      const signedTransaction = await web3Gateway.signTransaction(
        tx,
        privateKey,
      );

      try {
        this.logger.log(
          `Start Transaction, nonce ${nonceTransaction}::  ${new Date().toISOString()}`,
        );
        const sendSignedTransaction = await web3Gateway.sendSignedTransaction(
          signedTransaction.rawTransaction,
        );
        this.logger.log(
          `End Transaction, nonce ${nonceTransaction}:: ${new Date().toISOString()}`,
        );
        this.logger.log(`hash:: ${sendSignedTransaction.transactionHash}`);
        await this.rewardHistoryModel.updateOne(
          { _id: new ObjectID(rewardHistory[0].id) },
          {
            txId: sendSignedTransaction.transactionHash,
            gasFeeStatus: TRANSACTION_PAID_GAS_STATUS.PAID_SUCCESS,
            nonceTransaction: nonceTransaction,
          },
        );
        this.eventsGateway.sendMessage(
          EVENT_SOCKET.CLAIM_SUCCESS,
          dataContract,
        );
      } catch (error) {
        this.logger.error(`Transaction failed: ${error}`);
        if (error?.receipt?.status === false) {
          throw HttpError.error(
            HttpStatus.BAD_REQUEST,
            CommonCode.ER05,
            CommonCode.ER05,
          );
        }
        const update = await this.rewardHistoryModel.updateOne(
          { _id: new ObjectID(rewardHistory[0].id) },
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

  async updateClaim(data: UpdateClaimWorkerDto) {
    const updatedClaim = await this.rewardHistoryModel.findOne({
      _id: ObjectID(data.claimId),
    });
    if (updatedClaim.status === CLAIM_STATUS.CLAIM_SUCCESS) {
      return 'Update success';
    }
    const rewardPool = await this.rewardPoolModel.findOne({
      rewardPoolId: data.poolId,
    });
    const pool = await this.fNFTModel.findOne({
      poolId: rewardPool.FNFTPoolId,
    });
    const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
    const decimals = await this.commonService.getCacheDecimals(
      web3Gateway,
      rewardPool.tokenContractAddress,
    );
    const user = this.getUserPool(pool, data.account);
    const claim = new BigNumber(data.rewardUSDT)
      .dividedBy(Math.pow(10, decimals))
      .plus(new BigNumber(user.claim))
      .toString();
    const claimReward = new BigNumber(data.rewardUSDT)
      .dividedBy(Math.pow(10, decimals))
      .plus(new BigNumber(rewardPool.claim))
      .toString();
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const rewardHistoryStatus =
        await this.rewardHistoryModel.findOneAndUpdate(
          {
            _id: ObjectID(data.claimId),
            updatedAt: updatedClaim['updatedAt'],
          },
          { status: CLAIM_STATUS.CLAIM_SUCCESS },
          { session: session },
        );

      const rewardAfter = await this.rewardPoolModel.findOneAndUpdate(
        { rewardPoolId: data.poolId },
        {
          claim: claimReward,
        },
        { session: session },
      );

      const poolAfer = await this.fNFTModel.findOneAndUpdate(
        {
          poolId: rewardPool.FNFTPoolId,
          'users.address': data.account,
        },
        {
          $set: {
            'users.$.claim': claim,
          },
        },
        {
          session: session,
        },
      );
      if (rewardHistoryStatus && poolAfer && rewardAfter) {
        await session.commitTransaction();
      }
    } catch (error) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }

  private _checkAmount(createClaimRewardDto, user, pool, rewardPool) {
    // amount = FNFT want claim
    // allocationEachUser fnft number has the right to buy (FNFT)
    // remaining  : remaining fnft to be purchased  (USDT)// là số usdt nó còn lại nó có thể mua
    //Sóo fnft vconf lại để vclaimz  //
    // claim : number USDT  has been claimed// SÔ usdt nó đã claim về
    if (
      new BigNumber(createClaimRewardDto.amount).isGreaterThan(
        new BigNumber(user.allocationEachUser)
          .minus(
            new BigNumber(user.remaining).dividedBy(pool.fNFT.exchangeRates),
          )
          .minus(new BigNumber(user.claim).dividedBy(rewardPool.exchangeRates)),
      )
    )
      return CLAIM_RESPOND.AMOUNT_GREATER_THAN_PURCHASE;
  }

  async estimateGasClaim(tx: any, web3Gateway: Web3Gateway) {
    try {
      const estimatedGas = await web3Gateway.estimateGas(tx);
      this.logger.log(`gas:: ${estimatedGas}`);
      const gas = estimatedGas + Math.round((estimatedGas * 10) / 100);
      return gas;
    } catch (error) {
      this.logger.error(`Error estimateGas: ${error}`);
      // case amount contract not enough to claim
      if (error.toString().indexOf('transfer amount exceeds balance') > -1) {
        throw HttpError.error(
          HttpStatus.BAD_REQUEST,
          CommonCode.ER07,
          CommonCode.ER07,
        );
      }

      // common case estimate gas failed
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        CommonCode.ER04,
        CommonCode.ER04,
      );
    }
  }

  private async callClaimMethodABI(
    dataContract: any,
    createClaimRewardDto: any,
  ) {
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
        dataContract?.id,
        dataContract?.signature,
        createClaimRewardDto.userWalletAddress,
      )
      .encodeABI();
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
}
