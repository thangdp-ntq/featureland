import { Inject, Injectable, Logger } from '@nestjs/common';
import { EVENT_SOCKET } from '../common/constants';
import { ApiSuccessResponse } from '../common/responses/api-success';
import { NftService } from '../nft/nft.service';
import { FNftPoolService } from '../f-nft-pool/f-nft-pool.service';
import { EventsGateway } from '../socket/socket.gateway';
import { TieringPoolService } from '../tiering-pool/tiering-pool.service';
import { RewardPoolService } from '../reward-pool/reward-pool.service';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { StakingInfo } from '../f-nft-pool/dto/create-f-nft-pool.dto';
import { ClaimRewardService } from '../claim-reward/claim-reward.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

export enum WEBHOOK_TYPE {
  MINT_NFT = 'MintNFT',
  F_NFT = 'FractionalizeNFT',
  MINT_F_NFT_POOL = 'CreateFNFTPool',
  CREATE_TIER_POOL_EVENT = 'CreateTierPool',
  CREATE_REWARD_POOL_EVENT = 'CreateRewardPool',
  PURCHASE_F_NFT_EVENT = 'PurchaseFNFT',
  STAKE_EVENT = 'StakeTierPool',
  UN_STAKE_EVENT = 'UnStakeTierPool',
  ADMIN_SET = 'AdminSet',
  CLAIM_EVENT = 'ClaimReward',
  WITHDRAW_FUN = 'WithdrawFun',
}

@Injectable()
export class WebhookService {
  private readonly loggerConsole = new Logger(WebhookService.name);
  constructor(
    private nftService: NftService,
    private readonly eventsGateway: EventsGateway,
    private fNFTPoolService: FNftPoolService,
    private tierPoolService: TieringPoolService,
    private rewardPoolService: RewardPoolService,
    private tieringPoolService: TieringPoolService,
    private claimRewardService: ClaimRewardService,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  async processWebhook(data: any) {
    this.logger.debug(
      `WebhookService data receive, data=${JSON.stringify(data)}`,
    );
    try {
      switch (data.eventName) {
        case WEBHOOK_TYPE.MINT_NFT:
          await this.processMintNFTDone(data);
          break;
        case WEBHOOK_TYPE.F_NFT:
          await this.processFranctionalNFTDone(data);
          break;
        case WEBHOOK_TYPE.MINT_F_NFT_POOL:
          await this.processMintFNFTPoolDone(data);
          break;
        case WEBHOOK_TYPE.CREATE_TIER_POOL_EVENT:
          await this.processCreateTierPoolDone(data);
          break;
        case WEBHOOK_TYPE.CREATE_REWARD_POOL_EVENT:
          await this.processCreateRewardPool(data);
          break;
        case WEBHOOK_TYPE.PURCHASE_F_NFT_EVENT:
          await this.processPurchaseFNFT(data);
          break;
        case WEBHOOK_TYPE.STAKE_EVENT:
          await this.processStake(data);
          break;
        case WEBHOOK_TYPE.UN_STAKE_EVENT:
          await this.processUnStake(data);
          break;
        case WEBHOOK_TYPE.ADMIN_SET:
          await this.processAdminSet(data);
          break;
        case WEBHOOK_TYPE.CLAIM_EVENT:
          await this.processClaimReward(data);
          break;
        case WEBHOOK_TYPE.WITHDRAW_FUN:
          await this.processWithdrawFun(data);
          break;
      }
    } catch (error) {
      this.loggerConsole.error(`WebhookService, data=${error}`);
      throw error;
    }
    return new ApiSuccessResponse<unknown>().success({}, '');
  }

  async processMintNFTDone(data) {
    try {
      await this.nftService.updateNFTWhenMintSuccess(data._tokenId, data);
      this.eventsGateway.sendMessage(EVENT_SOCKET.MINT_NFT_EVENT, data);
      this.logger.debug('MintNFT successfully, data:: ' + JSON.stringify(data));
    } catch (error) {
      this.loggerConsole.error(
        'MintNFT failed, data:: ' + JSON.stringify(error),
      );
      throw error;
    }
  }

  async processClaimReward(data) {
    try {
      await this.claimRewardService.updateClaim(data);
      this.eventsGateway.sendMessage(EVENT_SOCKET.CLAIM_REWARD_EVENT, data);
      this.logger.debug(
        'ClaimReward successfully, data:: ' + JSON.stringify(data),
      );
    } catch (error) {
      this.loggerConsole.error(
        'ClaimReward failed, data:: ' + JSON.stringify(error),
      );
      throw error;
    }
  }

  async processWithdrawFun(data) {
    try {
      await this.fNFTPoolService.withdrawFun(data.poolId);
      this.eventsGateway.sendMessage(EVENT_SOCKET.WITHDRAW_FUN, data);
      this.logger.debug(
        'WithdrawFun successfully, data:: ' + JSON.stringify(data),
      );
    } catch (error) {
      this.loggerConsole.error(
        'WithdrawFun failed, data:: ' + JSON.stringify(error),
      );
      throw error;
    }
  }

  async processFranctionalNFTDone(data) {
    try {
      await this.nftService.updateNFTWhenFractionalSuccess(
        data._tokenId,
        data.transactionHash,
        data._tokenFNFT,
        data._symbol,
        data._totalSupply,
        data._name,
      );
      this.eventsGateway.sendMessage(EVENT_SOCKET.FRANCTIONAL_NFT_EVENT, data);
      this.logger.debug(
        'FranctionalNFT successfully, data:: ' + JSON.stringify(data),
      );
    } catch (error) {
      this.loggerConsole.error(
        'FranctionalNFT failed, data:: ' + JSON.stringify(error),
      );
      throw error;
    }
  }

  async processMintFNFTPoolDone(data) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.fNFTPoolService.updateFNFTPoolWhenMintSuccess(data, session);
      await this.nftService.updateAvailableAmountWhenCreateFNFTPool(
        data._fnftId,
        data._poolBalance,
        session,
      );
      await session.commitTransaction();
      this.eventsGateway.sendMessage(EVENT_SOCKET.MINT_F_NFT_POOL, data);
      this.logger.debug(
        'MintFNftPool successfully, data:: ' + JSON.stringify(data),
      );
    } catch (error) {
      await session.abortTransaction();
      this.loggerConsole.error(
        'MintFNftPool failed, data:: ' + JSON.stringify(error),
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  async processCreateTierPoolDone(data) {
    try {
      await this.tierPoolService.updateTierPoolWhenSubmitBlockchain(data);
      this.eventsGateway.sendMessage(EVENT_SOCKET.CREATE_TIER_POOL_EVENT, data);
      this.logger.debug(
        'CreateTierPool successfully, data:: ' + JSON.stringify(data),
      );
    } catch (error) {
      this.loggerConsole.error(
        'CreateTierPool failed, data:: ' + JSON.stringify(error),
      );
      throw error;
    }
  }

  async processCreateRewardPool(data) {
    try {
      await this.rewardPoolService.updateStatusPoolWhenMintSuccess(data);
      this.eventsGateway.sendMessage(EVENT_SOCKET.CREATE_REWARD_POOL, data);
      this.logger.debug(
        'CreateRewardPool successfully, data:: ' + JSON.stringify(data),
      );
    } catch (error) {
      this.loggerConsole.error(
        'CreateRewardPool failed, data:: ' + JSON.stringify(error),
      );
      throw error;
    }
  }

  async processPurchaseFNFT(data) {
    await this.fNFTPoolService.updateRemain(
      data.poolId,
      data.account,
      data.purchasedFNFT,
      data.purchaseId,
    );
    this.eventsGateway.sendMessage(EVENT_SOCKET.PURCHASE_F_NFT, data);
    this.logger.debug(
      'PurchaseFNFT successfully, data:: ' + JSON.stringify(data),
    );
  }

  async processStake(data) {
    const stakingInfo: StakingInfo = {
      userAddress: data.account,
      balance: data.amount,
    };
    await this.tieringPoolService.staking(stakingInfo);
    this.eventsGateway.sendMessage(EVENT_SOCKET.STAKE_EVENT, data);
    this.logger.debug('Staking successfully, data:: ' + JSON.stringify(data));
  }

  async processUnStake(data) {
    const stakingInfo: StakingInfo = {
      userAddress: data.account,
      balance: data.amount,
    };
    await this.tieringPoolService.unStaking(stakingInfo);
    this.eventsGateway.sendMessage(EVENT_SOCKET.UN_STAKE_EVENT, data);
    this.logger.debug('UnStake successfully, data:: ' + JSON.stringify(data));
  }
  async processAdminSet(data) {
    if (data.isSet == '1') {
      this.eventsGateway.sendMessage(EVENT_SOCKET.REACTIVE_USER, data);
      this.logger.debug(
        'active Admin successfully, data:: ' + JSON.stringify(data),
      );
    } else {
      this.eventsGateway.sendMessage(EVENT_SOCKET.INACTIVE_USER, data);
      this.logger.debug(
        'inactive Admin successfully, data:: ' + JSON.stringify(data),
      );
    }
  }
}
