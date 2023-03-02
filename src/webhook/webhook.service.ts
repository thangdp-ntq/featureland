import { Inject, Injectable, Logger } from '@nestjs/common';
import { EVENT_SOCKET } from '../common/constants';
import { ApiSuccessResponse } from '../common/responses/api-success';
import { NftService } from '../nft/nft.service';
import { EventsGateway } from '../socket/socket.gateway';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose from 'mongoose';
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
    private readonly eventsGateway: EventsGateway,
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
      }
    } catch (error) {
      this.loggerConsole.error(`WebhookService, data=${error}`);
      throw error;
    }
    return new ApiSuccessResponse<unknown>().success({}, '');
  }

  async processMintNFTDone(data) {
    try {
      // await this.nftService.updateNFTWhenMintSuccess(data._tokenId, data);
      this.eventsGateway.sendMessage(EVENT_SOCKET.MINT_NFT_EVENT, data);
      this.logger.debug('MintNFT successfully, data:: ' + JSON.stringify(data));
    } catch (error) {
      this.loggerConsole.error(
        'MintNFT failed, data:: ' + JSON.stringify(error),
      );
      throw error;
    }
  }

  
}
