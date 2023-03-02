import {
  RewardMultiplier,
  RewardMultiplierDocument,
} from './../schemas/reward-multiplier.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RewardMultiplierDto } from './dto/reward-multiplier.dto';

@Injectable()
export class RewardMultiplierService {
  constructor(
    @InjectModel(RewardMultiplier.name)
    private rewardMultiplier: Model<RewardMultiplierDocument>,
  ) {}
  async findOne() {
    return await this.rewardMultiplier.findOne();
  }

  async update(updateRewardMultiplierDto: RewardMultiplierDto) {
    const isRewardMultiplier = await this.rewardMultiplier.findOne();
    if (!isRewardMultiplier) {
      return await this.rewardMultiplier.create(updateRewardMultiplierDto);
    } else {
      await this.rewardMultiplier.updateOne(
        { _id: isRewardMultiplier._id },
        updateRewardMultiplierDto,
      );
    }
    return updateRewardMultiplierDto;
  }
}
