import { Inject, Injectable, Logger } from "@nestjs/common";
import { EVENT_SOCKET } from "../common/constants";
import { ApiSuccessResponse } from "../common/responses/api-success";
import { NftService } from "../nft/nft.service";
import { EventsGateway } from "../socket/socket.gateway";
import { InjectConnection } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

export enum WEBHOOK_TYPE {
  Transfer = "Transfer",
  Lock='Lock'
}

@Injectable()
export class WebhookService {
  private readonly loggerConsole = new Logger(WebhookService.name);
  constructor(
    private readonly eventsGateway: EventsGateway,
    private nftService: NftService,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}
  async processWebhook(data: any) {
    this.logger.debug(
      `WebhookService data receive, data=${JSON.stringify(data)}`
    );
    try {
      switch (data.eventName) {
        case WEBHOOK_TYPE.Transfer:
          await this.processTransferNFTDone(data);
          break;
        case WEBHOOK_TYPE.Lock:
          await this.processLockNFTDone(data);
          break;
      }
    } catch (error) {
      this.loggerConsole.error(`WebhookService, data=${error}`);
      throw error;
    }
    return new ApiSuccessResponse<unknown>().success({}, "");
  }

  async processTransferNFTDone(data) {
    try {
      await this.nftService.TranferNft(data);
      //this.eventsGateway.sendMessage(EVENT_SOCKET.MINT_NFT_EVENT, data);
      this.logger.debug("MintNFT successfully, data:: " + JSON.stringify(data));
    } catch (error) {
      this.loggerConsole.error(
        "MintNFT failed, data:: " + JSON.stringify(error)
      );
      throw error;
    }
  }

  async processLockNFTDone(data) {
    try {
      await this.nftService.updateLock(data);
      //this.eventsGateway.sendMessage(EVENT_SOCKET.MINT_NFT_EVENT, data);
      this.logger.debug("MintNFT successfully, data:: " + JSON.stringify(data));
    } catch (error) {
      this.loggerConsole.error(
        "MintNFT failed, data:: " + JSON.stringify(error)
      );
      throw error;
    }
  }
}
