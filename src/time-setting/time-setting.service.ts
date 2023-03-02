import {
  TimeSetting,
  TimeSettingDocument,
} from './../schemas/time-setting.schema';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GetTimeSettingDto,
  TimeSettingDto,
  UpdateTimeSettingDto,
} from './dto/time-setting.dto';
import { HttpError } from '~/common/responses/api-errors';
const _ = require('lodash');

@Injectable()
export class TimeSettingService {
  constructor(
    @InjectModel(TimeSetting.name)
    private timeSettingModel: Model<TimeSettingDocument>,
  ) {}
  async find(query: GetTimeSettingDto) {
    let match: Record<string, any> = {};
    if (query.hasOwnProperty('isActive')) {
      match = {
        isActive: query.isActive,
      };
    }
    return await this.timeSettingModel.aggregate([{ $match: match }]);
  }

  async update(id: string, data: UpdateTimeSettingDto) {
    await this.timeSettingModel.updateOne(
      { _id: id },
      { isActive: data.isActive },
    );
    return data;
  }

  async create(data: TimeSettingDto) {
    const timeSetting = await this.timeSettingModel.find({
      hourTo: data.hourTo,
      hourFrom: data.hourFrom,
    });

    if (timeSetting.length > 0) {
      for (let i = 0; i < timeSetting.length; i++) {
        if (_.isEqual(timeSetting[i].days.sort(), data.days.sort())) {
          throw HttpError.error(
            HttpStatus.BAD_REQUEST,
            "Can't create a new time setting as same as old time setting",
            ["Can't create a new time setting as same as old time setting"],
          );
        }
      }
    }
    return await this.timeSettingModel.create(data);
  }

  async delete(id: string) {
    const setting = await this.timeSettingModel.findOne({ _id: id });
    if (setting.isActive) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        "Can't delete an active setting time ",
        ["Can't delete an active setting time "],
      );
    }
    await this.timeSettingModel.deleteOne({ _id: id });
    return id;
  }
}
