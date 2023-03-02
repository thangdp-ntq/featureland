import { FNftPoolModule } from './../f-nft-pool/f-nft-pool.module';
import { FNftPoolService } from './../f-nft-pool/f-nft-pool.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { FNFTPool, FNFTPoolDocument } from '~/schemas/f-nft-pool.schema';
@Injectable()
export class UpdateFNFTStepTask {
  private readonly logger = new Logger(UpdateFNFTStepTask.name);
  @InjectModel(FNFTPool.name) private fnftPoolModel: Model<FNFTPoolDocument>;

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateFNFTPool() {
    const fnftPools = await this.fnftPoolModel.find({
      startTimelines: { $exists: true },
    });
    for (let i = 0; i < fnftPools.length; i++) {
      if (fnftPools[i].startTimelines.length == 0) return;
      const stepCurrent: number = fnftPools[i].step;
      let step;
      if (fnftPools[i].startTimelines?.length) {
        step = this.updateStepProduction(fnftPools[i].startTimelines);
      }
      if (stepCurrent === step) continue;
      await this.fnftPoolModel.updateOne(
        { poolId: fnftPools[i].poolId },
        { step: step },
      );
      this.logger.warn('Update Step FNFTPool, poolId ::', fnftPools[i].poolId);
    }
  }

  updateStepProduction(startTimelines) {
    for (let i = startTimelines.length - 1; i > 0; i--) {
      if (
        new Date(startTimelines[i]).getTime() > new Date().getTime() &&
        new Date(startTimelines[i - 1]).getTime() <= new Date().getTime()
      ) {
        return i + 1;
      }
    }
    return 1;
  }
}
