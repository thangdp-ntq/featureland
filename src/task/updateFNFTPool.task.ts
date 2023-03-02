import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import BigNumber from 'bignumber.js';
import mongoose, { Model } from 'mongoose';
import { FNFTPool, FNFTPoolDocument } from '~/schemas/f-nft-pool.schema';
import { NFT, NFTDocument } from '~/schemas';
import { TYPE_POOL } from '../common/constants';
@Injectable()
export class UpdateFNFTPoolTask {
  private readonly logger = new Logger(UpdateFNFTPoolTask.name)
  @InjectModel(FNFTPool.name) private fnftPoolModel: Model<FNFTPoolDocument>
  @InjectModel(NFT.name) private nftModel: Model<NFTDocument>
  @InjectConnection() private readonly connection: mongoose.Connection;

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateFNFTPool() {
    this.logger.debug("Starting Task update FNFTPool")
    const currentDate = new Date();
    const fNFTPools = await this.fnftPoolModel.find({
      purchaseEndTime: { $lt: currentDate},
      isRefund: false,
      poolType: TYPE_POOL.ONCHAIN
    })
    if(fNFTPools && fNFTPools.length > 0) {
      for( const fNFTPool of fNFTPools){
        let availableAmountNFT;
        if(new BigNumber(fNFTPool.availableAmount).isGreaterThan(0)){
          const nfts = await this.nftModel.findOne({tokenId:fNFTPool.fNFT.nftId})
          availableAmountNFT = new BigNumber(nfts.availableAmount).plus(new BigNumber(fNFTPool.fNFT.availableAmount));
          const session = await this.connection.startSession();
          session.startTransaction();
          try {
            await this.fnftPoolModel.findOneAndUpdate(
              {
                poolId: fNFTPool.poolId,
              },
              {
                $set: {
                  isRefund: true,
                },
              },
              { session: session },
            );
            await this.nftModel.updateOne(
              { tokenId: fNFTPool.fNFT.nftId },
              {
                availableAmount: availableAmountNFT,
              },
              { session: session },
            );
            await session.commitTransaction();
          } catch (error) {
            this.logger.debug("An error occurred while updating fnftPool, poolId: " + fNFTPool.poolId);
            await session.abortTransaction();
          } finally {
            session.endSession();
          }
        }
      }
    }
    this.logger.debug("End Task update FNFTPool")
  }
}
