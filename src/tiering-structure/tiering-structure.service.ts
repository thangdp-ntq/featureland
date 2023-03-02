import { BigNumber } from 'bignumber.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Web3ETH } from '~/blockchain/web3.eth';
import {
  AllocationTypeTier,
  SORT_AGGREGATE,
  TieringPoolStatus,
  TieringStructureResponse,
  TIER_NULL,
} from '../common/constants';
import { Utils } from '../common/utils';
import {
  TieringPool,
  TieringPoolDocument,
} from '../schemas/pool-tiering.schema';
import {
  TieringStructure,
  TieringStructureDocument,
} from '../schemas/tiering-structure.schema';
import { TieringStructureDto } from './dto/update-tiering-structure.dto';
import { Web3Gateway } from '~/blockchain/web3.gateway';
import { CommonService } from '~/common-service/common.service';

@Injectable()
export class TieringStructureService {
  private readonly logger = new Logger(TieringStructureService.name);
  constructor(
    @InjectModel(TieringStructure.name)
    private tieringStructureModel: Model<TieringStructureDocument>,
    @InjectModel(TieringPool.name)
    private tieringPoolModel: Model<TieringPoolDocument>,
    private readonly commonService: CommonService,
  ) {}

  async getTiersData(): Promise<any> {
    return await this.tieringStructureModel.aggregate([
      { $sort: { stakingQuantity: SORT_AGGREGATE.DESC } },
      { $unset: ['updatedAt', 'createdAt', '__v'] },
    ]);
  }

  async getTiersUser() {
    try {
      this.logger.debug("get tier user");
      const tiers = await this.tieringStructureModel
        .find()
        .sort({ tierNumber: SORT_AGGREGATE.DESC });
      const tieringPool = await this.tieringPoolModel.findOne();
      const contractProxy = new Web3ETH().getContractInstance();
      this.logger.debug(contractProxy);
      const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
      const decimals = await this.commonService.getCacheDecimals(
        web3Gateway,
        tieringPool.tieringTokenAddress,
      );
      this.logger.debug(decimals);
      this.logger.debug(contractProxy.methods);
      const { stakedBalance } = await contractProxy.methods
        .tierPools(tieringPool.tieringPoolId)
        .call();
      this.logger.debug(stakedBalance);
      if (!tieringPool)
        return {
          message: 'Comming Soon',
        };
      if (tieringPool.tieringPoolStatus === TieringPoolStatus.OFF)
        return {
          message: 'Comming Soon',
        };
      const tier = [TIER_NULL, ...tiers].map((tier) => {
        return {
          tierNumber: tier.tierNumber,
          tierName: tier.name,
          stakingPeriod: tier.stakingPeriod,
          stakingQuantity: tier.stakingQuantity,
          withdrawDelayDuration: tieringPool.withdrawDelayDuration,
          lockDuration: tieringPool.lockDuration,
          allocationType: AllocationTypeTier,
        };
      });
      return {
        tieringPoolId: tieringPool.tieringPoolId,
        tier,
        totalValueLock: new BigNumber(stakedBalance).dividedBy(
          new BigNumber(Math.pow(10, decimals)),
        ),
      };
    } catch (err) {
      this.logger.debug(err.message, err.stack);
      throw err;
    }
  }

  async updateTiersData(tiersData: TieringStructureDto[]): Promise<any> {
    tiersData.sort((a, b) => a.tierNumber - b.tierNumber);
    if (this.checkDuplicateNameOfTiers(tiersData)) {
      throw TieringStructureResponse.DUPLICATE_NAME;
    }
    if (!this.validateStakingQuantity(tiersData)) {
      throw TieringStructureResponse.INVALID_STAKING_QUANTITY;
    }
    for (let i = 0; i < tiersData.length; i++) {
      await this.updateTier(tiersData[i]);
    }
    return tiersData;
  }

  async addTiersData(tiersData: TieringStructureDto[]): Promise<any> {
    for (let i = 0; i < tiersData.length; i++) {
      const checkExist = await this.checkExistTierInDatabase(tiersData[i]);
      if (!checkExist) {
        await this.tieringStructureModel.create(tiersData);
      } else {
        throw TieringStructureResponse.DUPLICATE_NAME;
      }
    }
    return tiersData;
  }

  async updateTier(tierData: TieringStructureDto) {
    const tier = await this.tieringStructureModel.findOne({
      _id: tierData._id,
      tierNumber: tierData.tierNumber,
    });
    if (!tier) {
      throw TieringStructureResponse.NOT_EXIST;
    }
    if (this.hashNameTier(tierData.name) !== this.hashNameTier(tier.name)) {
      const checkExist = await this.checkExistTierInDatabase(tierData);
      if (checkExist) {
        throw TieringStructureResponse.DUPLICATE_NAME;
      }
    }

    tier.name = tierData.name;
    tier.stakingPeriod = tierData.stakingPeriod;
    tier.stakingQuantity = tierData.stakingQuantity;
    await tier.save();
    this.logger.debug(`Update tier ${tierData.name} successfully`);
  }

  checkDuplicateNameOfTiers(tiersData: TieringStructureDto[]) {
    for (let i = 0; i < tiersData.length - 1; i++) {
      for (let j = i + 1; j < tiersData.length; j++) {
        if (this.nameExist(tiersData[i].name, tiersData[j].name)) {
          return true;
        }
      }
    }
    return false;
  }

  nameExist(namePrevious, nameCurrent) {
    if (
      namePrevious.en === nameCurrent.en ||
      namePrevious.cn === nameCurrent.cn ||
      namePrevious.jp === nameCurrent.jp
    )
      return true;
    return false;
  }

  hashNameTier(name: any) {
    const objName = {
      en: name.en,
      jp: name.jp,
      cn: name.cn,
    };
    return Utils.hashMD5(JSON.stringify(objName));
  }

  validateStakingQuantity(tiersData: TieringStructureDto[]) {
    for (let i = 0; i < tiersData.length - 1; i++) {
      if (tiersData[i].stakingQuantity <= tiersData[i + 1].stakingQuantity) {
        return false;
      }
    }
    return true;
  }

  async checkExistTierInDatabase(tierData: TieringStructureDto) {
    return (
      (await this.tieringStructureModel.exists({
        'name.en': tierData.name.en,
        'name.jp': tierData.name.jp,
        'name.cn': tierData.name.cn,
      })) || false
    );
  }

  async getAllTieringStructure() {
    return await this.tieringStructureModel.find();
  }
}
