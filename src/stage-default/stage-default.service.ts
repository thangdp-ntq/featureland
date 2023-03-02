import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StageDefault,
  StageDefaultDocument,
} from '../schemas/stage-default.schema';
import { UpdateStageDefaultDto } from './dto/update-stage-default.dto';

@Injectable()
export class StageDefaultService {
  constructor(
    @InjectModel(StageDefault.name)
    private stageDefault: Model<StageDefaultDocument>,
  ) {}
  async findAll() {
    return await this.stageDefault.findOne();
  }

  async update(updateStageDefaultDto: UpdateStageDefaultDto) {
    const isExistStageDefault = await this.stageDefault.findOne();
    if (!isExistStageDefault) {
      return await this.stageDefault.create(updateStageDefaultDto);
    } else {
      await this.stageDefault.update(
        { _id: isExistStageDefault._id },
        updateStageDefaultDto,
      );
    }
    return updateStageDefaultDto;
  }
}
