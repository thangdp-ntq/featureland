import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class KafkaController implements OnModuleInit {
  private logger = new Logger(KafkaController.name);

  onModuleInit() {
    // TODO : init module
  }

  @EventPattern(process.env.EVENT_MINT_NFT)
  async handleMintNftEvent(data) {
    this.logger.debug('handleMintNftEvent(): data', data);
  }

  @EventPattern(process.env.EVENT_BUY_NFT)
  async handleBuyNftEvent(data) {
    this.logger.debug('handleBuyNftEvent(): data', data);
  }

  @EventPattern(process.env.EVENT_CANCEL_SELL_ORDER)
  async handleCancelSellOrderEvent(data) {
    this.logger.debug('handleCancelSellOrderEvent(): data', data);
  }

  @EventPattern(process.env.EVENT_SET_ADMIN)
  async handleSetAdminEvent(data) {
    this.logger.debug('handleSetAdminEvent(): data', data);
  }

  @EventPattern(process.env.EVENT_TRANSFER)
  async handleTransfer(data) {
    this.logger.debug('handleTransfer(): data', data);
  }

  @EventPattern(process.env.EVENT_TRANSFER_BATCH)
  async handleTransferBatch(data) {
    this.logger.debug('handleTransferBatch(): data', data);
  }
}
