import { GasLimit, GasLimitDocument } from './../schemas/gas-limit.schema';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SettingWalletDto, GasLimitDto } from './dto/setting-wallet.dto';
import {
  SettingWallet,
  SettingWalletDocument,
} from '~/schemas/setting-wallet.schema';
import { HttpError } from '~/common/responses/api-errors';

@Injectable()
export class SettingWalletService {
  constructor(
    @InjectModel(SettingWallet.name)
    private settingWalletModel: Model<SettingWalletDocument>,
    @InjectModel(GasLimit.name)
    private gasLimitModel: Model<GasLimitDocument>,
  ) {}
  async findOne() {
    const { gasLimit } = await this.gasLimitModel.findOne();
    const setting = await this.settingWalletModel.findOne().lean();
    return { gasLimit, ...setting };
  }

  async update(settingWalletDto: SettingWalletDto) {
    const wallet = await this.settingWalletModel.findOne();
    if (!wallet) {
      return await this.settingWalletModel.create(settingWalletDto);
    } else {
      await this.settingWalletModel.updateOne(
        { _id: wallet._id },
        settingWalletDto,
      );
    }
    return wallet;
  }

  async updateGasLimit(body: GasLimitDto) {
    if (body.secretKey !== process.env.SECRET_KEY_GAS_LIMIT) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        'Key Invalid or missing secret key',
        ['Key Invalid or missing secret key'],
      );
    }
    const gasLimit = await this.gasLimitModel.findOne();
    if (!gasLimit) {
      return await this.gasLimitModel.create({ gasLimit: body.gasLimit });
    } else {
      await this.gasLimitModel.updateOne(
        { _id: gasLimit._id },
        { gasLimit: body.gasLimit },
      );
    }
    return body.gasLimit;
  }
}
