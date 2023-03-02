import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  messsage,
  NFT_Status,
  POOL_NFT_MESSAGE,
  STAGE_DEFAULT_RESPONE_MESSAGE,
  TYPE_POOL,
} from '../common/constants';
import { NFT, NFTDocument } from '../schemas/NFT.schema';
import { CreateFNFTPoolDTO } from './dto/create-f-nft-pool.dto';
import {
  AllocationSettingDTO,
  VerifyConfigureWhitelistDTO,
  VerifyGeneralInfoDTO,
  VerifySelectNFTDTO,
} from './dto/verify-f-nft-pool.dto';
import { Model } from 'mongoose';
import { FNFTPool, FNFTPoolDocument } from '../schemas/f-nft-pool.schema';
import { Serial, SerialDocument } from '../schemas/serial.schema';
import { Utils } from '../common/utils';
import { Path, PathDocument } from '../schemas/path.schema';
import { TieringStructureService } from '../tiering-structure/tiering-structure.service';
import {
  UpdateFNFTPoolDTO,
  UpdateFNFTPoolOnChainDTO,
} from './dto/update-f-nft-pool.dto';
import { Timeline, TimelineDocument } from '../schemas/timeline.schema';
import BigNumber from 'bignumber.js';
import * as moment from 'moment';
import { Web3ETH } from '../blockchain/web3.eth';
import { isArray } from 'class-validator';
@Injectable()
export class FNFTPoolValidator {
  constructor(
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
    @InjectModel(FNFTPool.name) private fNFTModel: Model<FNFTPoolDocument>,
    @InjectModel(Serial.name) private serialModel: Model<SerialDocument>,
    @InjectModel(Path.name) private pathModel: Model<PathDocument>,
    @InjectModel(Timeline.name) private timelineModel: Model<TimelineDocument>,
    private tieringStructureService: TieringStructureService,
  ) {}
  /**
   * validator pipe of data when create f-nft pool
   * @param fNFT
   * @param file
   */
  async validateDataCreateFNFTPool(
    fNFT: CreateFNFTPoolDTO,
    file: Express.Multer.File,
    poolVideo: Express.Multer.File,
  ) {
    let errors = [];

    const dateStep1: VerifySelectNFTDTO = {
      nftId: fNFT.nftId,
      acceptedCurrencyAddress: fNFT.acceptedCurrencyAddress,
      acceptedCurrencyDecimals: fNFT.acceptedCurrencyDecimals,
      acceptedCurrencySymbol: fNFT.acceptedCurrencySymbol,
      blockchainNetwork: fNFT.blockchainNetwork,
      receiveWalletAddress: fNFT.receiveWalletAddress,
      totalSold: fNFT.totalSold,
    };
    const validateStep1 = await this.validateSelectNFT(dateStep1);
    errors = errors.concat(validateStep1.errors);

    const dataStep2: VerifyGeneralInfoDTO = {
      exchangeRates: fNFT.exchangeRates,
      pathId: fNFT.pathId,
      poolName: fNFT.poolName,
      purchaseEndTime: fNFT.purchaseEndTime,
      purchaseStartTime: fNFT.purchaseStartTime,
      registrationEndTime: fNFT.registrationEndTime,
      registrationStartTime: fNFT.registrationStartTime,
      seriesId: fNFT.seriesId,
      status: fNFT.status,
      poolDescription: fNFT.poolDescription,
    };
    const validateStep2 = await this.validateGeneralInfo(
      dataStep2,
      file,
      poolVideo,
    );
    errors = errors.concat(validateStep2.errors);

    const dataStep3: VerifyConfigureWhitelistDTO = {
      whitelistURL: fNFT.whitelistURL,
      allocationSettings: fNFT.allocationSettings
        ? JSON.parse(fNFT.allocationSettings)
        : [],
      whitelistAnnouncementTime: fNFT.whitelistAnnouncementTime,
      purchaseStartTime: fNFT.purchaseStartTime,
      registrationEndTime: fNFT.registrationEndTime,
      isFCFS: fNFT.isFCFS,
      totalSold: fNFT.totalSold,
      allocationFCFS: fNFT.allocationFCFS,
    };
    const validateStep3 = await this.validateConfigureWhitelist(dataStep3);
    errors = errors.concat(validateStep3.errors);

    return {
      isValid: errors.length <= 0,
      errors: errors,
    };
  }

  /**
   * validate pipe of data when update pool draft
   * @param fNFT
   * @param file
   */
  async validateDataUpdatePoolDraft(
    fNFT: UpdateFNFTPoolDTO,
    file: Express.Multer.File,
    poolVideo: Express.Multer.File,
    fNFTDB: FNFTPool,
  ) {
    let errors = [];

    const dateStep1: VerifySelectNFTDTO = {
      nftId: fNFT.nftId,
      acceptedCurrencyAddress: fNFT.acceptedCurrencyAddress,
      acceptedCurrencyDecimals: fNFT.acceptedCurrencyDecimals,
      acceptedCurrencySymbol: fNFT.acceptedCurrencySymbol,
      blockchainNetwork: fNFT.blockchainNetwork,
      receiveWalletAddress: fNFT.receiveWalletAddress,
      totalSold: fNFT.totalSold,
    };
    const validateStep1 = await this.validateSelectNFT(dateStep1);
    errors = errors.concat(validateStep1.errors);

    const dataStep2: VerifyGeneralInfoDTO = {
      exchangeRates: fNFT.exchangeRates,
      pathId: fNFT.pathId,
      poolName: fNFT.poolName,
      purchaseEndTime: fNFT.purchaseEndTime,
      purchaseStartTime: fNFT.purchaseStartTime,
      registrationEndTime: fNFT.registrationEndTime,
      registrationStartTime: fNFT.registrationStartTime,
      productionPeriodStartTime: fNFT.productionPeriodStartTime,
      productionPeriodEndTime: fNFT.productionPeriodEndTime,
      seriesId: fNFT.seriesId,
      status: fNFT.status,
      poolDescription: fNFT.poolDescription,
    };
    const validateStep2 = await this.validateGeneralInfo(
      dataStep2,
      file,
      poolVideo,
      false,
      fNFTDB,
    );
    errors = errors.concat(validateStep2.errors);

    const dataStep3: VerifyConfigureWhitelistDTO = {
      whitelistURL: fNFT.whitelistURL,
      allocationSettings: fNFT.allocationSettings
        ? JSON.parse(fNFT.allocationSettings)
        : [],
      whitelistAnnouncementTime: fNFT.whitelistAnnouncementTime,
      purchaseStartTime: fNFT.purchaseStartTime,
      registrationEndTime: fNFT.registrationEndTime,
      isFCFS: fNFT.isFCFS,
      allocationFCFS: fNFT.allocationFCFS,
      totalSold: fNFT.totalSold,
    };
    const validateStep3 = await this.validateConfigureWhitelist(dataStep3);
    errors = errors.concat(validateStep3.errors);

    // const validateStepTimeline = await this.checkValidTimeline(fNFT.step);
    // if (!validateStepTimeline.isValid) {
    //   errors.push(validateStepTimeline.message);
    // }
    const dataStep4 = {
      productionPeriodEndTime: fNFT.productionPeriodEndTime,
      productionPeriodStartTime: fNFT.productionPeriodStartTime,
      step: fNFT.step,
      timelines: fNFT.timelines,
      purchaseEndTime: fNFT.purchaseEndTime,
    };
    const validateStepProductStage = await this.validateProductionStages(
      dataStep4,
    );
    if (!validateStepProductStage.isValid) {
      errors.push(...validateStepProductStage.errors);
    }

    // if (
    //   fNFT.startTimelines != undefined &&
    //   JSON.parse(fNFT.startTimelines).legth &&
    //   fNFT.productionPeriodStartTime &&
    //   fNFT.productionPeriodEndTime
    // ) {
    //   const validateStartTimelines = this.validateStartTimeLines(
    //     new Date(fNFT.productionPeriodStartTime),
    //     new Date(fNFT.productionPeriodEndTime),
    //     JSON.parse(fNFT.startTimelines),
    //   );
    //   if (!validateStartTimelines.isValid) {
    //     errors.push(...validateStepProductStage.errors);
    //   }
    // }
    const validateStepTimeline = await this.checkValidTimeline(fNFT.step);
    return {
      isValid: errors.length <= 0,
      errors: errors,
    };
  }

  /**
   * validate pipe of data when update pool on chain
   * @param fNFT
   * @param file
   */
  async validateDataUpdatePoolOnChain(
    fNFT: UpdateFNFTPoolOnChainDTO,
    file: Express.Multer.File,
    poolVideo: Express.Multer.File,
    fNFTOriginal: FNFTPool,
  ) {
    let errors = [];

    const dataStep2: VerifyGeneralInfoDTO = {
      pathId: fNFT.pathId,
      poolName: fNFT.poolName,
      seriesId: fNFT.seriesId,
      status: fNFT.status,
      poolDescription: fNFT.poolDescription,
      // productionPeriodStartTime: fNFT.productionPeriodStartTime,
      // productionPeriodEndTime: fNFT.productionPeriodEndTime,
      purchaseEndTime: moment(fNFTOriginal.purchaseEndTime).format(
        'MM/DD/YYYY HH:mm:ss',
      ),
    };
    const validateStep2 = await this.validateGeneralInfo(
      dataStep2,
      file,
      poolVideo,
      true,
      fNFTOriginal,
    );
    errors = errors.concat(validateStep2.errors);

    const dataStep3: VerifyConfigureWhitelistDTO = {
      whitelistURL: fNFT.whitelistURL,
      whitelistAnnouncementTime: fNFT.whitelistAnnouncementTime,
      purchaseStartTime: moment(fNFTOriginal.purchaseStartTime).format(
        'MM/DD/YYYY HH:mm:ss',
      ),
      registrationEndTime: moment(fNFTOriginal.registrationEndTime).format(
        'MM/DD/YYYY HH:mm:ss',
      ),
    };

    const validateStep3 = await this.validateConfigureWhitelist(
      dataStep3,
      true,
    );
    errors = errors.concat(validateStep3.errors);
    const dataStep4 = {
      productionPeriodEndTime: fNFT.productionPeriodEndTime,
      productionPeriodStartTime: fNFT.productionPeriodStartTime,
      step: fNFT.step,
      timelines: fNFT.timelines,
      purchaseEndTime: fNFTOriginal.purchaseEndTime,
    };
    const validateStepProductStage = await this.validateProductionStages(
      dataStep4,
    );
    // const validateStepTimeline = await this.checkValidTimeline(fNFT.step);
    if (!validateStepProductStage.isValid) {
      errors.push(...validateStepProductStage.errors);
    }

    return {
      isValid: errors.length <= 0,
      errors: errors,
    };
  }

  /**
   * validaator pipe of data in step 1 create f-nft-pool
   * @param data
   * @returns
   */
  async validateSelectNFT(data: VerifySelectNFTDTO) {
    let errors = [];

    const requireField = [
      'blockchainNetwork',
      'nftId',
      'totalSold',
      'acceptedCurrencyAddress',
      'acceptedCurrencySymbol',
      'acceptedCurrencyDecimals',
      'receiveWalletAddress',
    ];
    const validateRequire = this.validateRequire(data, requireField);
    errors = errors.concat(validateRequire);

    if (data.acceptedCurrencyAddress === data.receiveWalletAddress) {
      errors.push(POOL_NFT_MESSAGE.RECEIVER_ADDRESS_EQUAL_ACA);
    }
    const validateTokenAddress = await this.checkValidTokenAddress(
      data.acceptedCurrencyAddress,
      data.acceptedCurrencySymbol,
      data.acceptedCurrencyDecimals,
    );
    if (!validateTokenAddress.isValid) {
      errors.push(validateTokenAddress.message);
    }
    const validateTotalSold = await this.checkValidTotalSold(
      data.totalSold,
      data.nftId,
    );
    if (!validateTotalSold.isValid) {
      errors.push(validateTotalSold.messsage);
    }

    const validateNFT = await this.checkValidNFTId(data.nftId);
    if (!validateNFT.isValid) {
      errors.push(validateNFT.messsage);
    }
    return {
      isValid: errors.length <= 0,
      errors: errors,
    };
  }

  /**
   * validaator pipe of data in step 2 create f-nft-pool
   * @param data
   */
  async validateGeneralInfo(
    data: VerifyGeneralInfoDTO,
    file: Express.Multer.File,
    poolVideo: Express.Multer.File,
    onChain: boolean = false,
    fNFT: FNFTPool = null,
  ) {
    const errors = [];
    if (!fNFT || (fNFT && file)) {
      const validateFile = Utils.validateFile(file, true, 3);
      if (!validateFile.isValid) {
        errors.push(validateFile.message);
      }
    }

    const validatePoolVideo = Utils.validateFile(poolVideo, false, 100);
    if (!validatePoolVideo.isValid) {
      errors.push(validatePoolVideo.message);
    }
    const validatePoolName = await this.checkValidPoolName(data.poolName);
    if (!validatePoolName.isValid) {
      errors.push(validatePoolName.message);
    }
    const validatePoolDescription = await this.checkValidPoolDescription(
      data.poolDescription,
    );
    if (!validatePoolDescription.isValid) {
      errors.push(validatePoolDescription.message);
    }
    if (data.seriesId) {
      const validateSerial = await this.checkValidSeries(data.seriesId);
      if (!validateSerial.isValid) {
        errors.push(validateSerial.messsage);
      }
    }
    if (data.pathId) {
      const validatePath = await this.checkValidPath(data.pathId);
      if (!validatePath.isValid) {
        errors.push(validatePath.messsage);
      }
    }
    if (!onChain) {
      const validateTime = this.checkValidTimeSetting(data);
      if (!validateTime.isValid) {
        errors.push(validateTime.messsage);
      }
      const validateExchangeRates = this.checkValidExchangeRates(
        data.exchangeRates,
      );
      if (!validateExchangeRates.isValid) {
        errors.push(validateExchangeRates.messsage);
      }
    }

    // const validateProductionTime = this.checkValidProductionPeriodTime(data);
    // if (!validateProductionTime.isValid) {
    //   errors.push(validateProductionTime.messsage);
    // }
    return {
      isValid: errors.length <= 0,
      errors: errors,
    };
  }

  /**
   * validaator pipe of data in step 2 create f-nft-pool
   * @param data
   */
  async validateGeneralInfoWhenEdit(
    data: VerifyGeneralInfoDTO,
    file: Express.Multer.File,
    poolVideo: Express.Multer.File,
    onChain: boolean = false,
    fNFT: FNFTPool = null,
  ) {
    const errors = [];
    if (file) {
      const validateFile = Utils.validateFile(file, true, 3);
      if (!validateFile.isValid) {
        errors.push(validateFile.message);
      }
    }

    const validatePoolVideo = Utils.validateFile(poolVideo, false, 100);
    if (!validatePoolVideo.isValid) {
      errors.push(validatePoolVideo.message);
    }
    const validatePoolName = await this.checkValidPoolName(data.poolName);
    if (!validatePoolName.isValid) {
      errors.push(validatePoolName.message);
    }
    const validatePoolDescription = await this.checkValidPoolDescription(
      data.poolDescription,
    );
    if (!validatePoolDescription.isValid) {
      errors.push(validatePoolDescription.message);
    }
    if (data.seriesId) {
      const validateSerial = await this.checkValidSeries(data.seriesId);
      if (!validateSerial.isValid) {
        errors.push(validateSerial.messsage);
      }
    }
    if (data.pathId) {
      const validatePath = await this.checkValidPath(data.pathId);
      if (!validatePath.isValid) {
        errors.push(validatePath.messsage);
      }
    }
    if (!onChain) {
      const validateTime = this.checkValidTimeSetting(data);
      if (!validateTime.isValid) {
        errors.push(validateTime.messsage);
      }
      const validateExchangeRates = this.checkValidExchangeRates(
        data.exchangeRates,
      );
      if (!validateExchangeRates.isValid) {
        errors.push(validateExchangeRates.messsage);
      }
    }

    // const validateProductionTime = this.checkValidProductionPeriodTime(data);
    // if (!validateProductionTime.isValid) {
    //   errors.push(validateProductionTime.messsage);
    // }
    return {
      isValid: errors.length <= 0,
      errors: errors,
    };
  }

  async validateProductionStages(data) {
    const errors = [];
    const validateProductionTime = this.checkValidProductionPeriodTime(data);
    if (!validateProductionTime.isValid) {
      errors.push(validateProductionTime.messsage);
    }
    if (typeof data.timelines === 'string') {
      errors.push(
        this.checkTimelinesMultiLanguage(
          JSON.parse(data.timelines),
          data.step,
        ).flat(),
      );
    } else {
      errors.push(
        this.checkTimelinesMultiLanguage(data.timelines, data.step).flat(),
      );
    }
    return {
      isValid: errors.flat().length <= 0,
      errors: errors,
    };
  }
  checkTimelinesMultiLanguage(timelines, step) {
    const errors = [];
    if (step > timelines.length) {
      errors.push(STAGE_DEFAULT_RESPONE_MESSAGE.STEP_NOT_FOUND);
    }
    const errorsValidateTimelines = timelines.map((timeline) =>
      this.validateItemLanguge(timeline),
    );
    errors.push(errorsValidateTimelines.flat());
    return errors;
  }

  validateItemLanguge(timeline) {
    const errors = [];
    if (!timeline.en) {
      errors.push(STAGE_DEFAULT_RESPONE_MESSAGE.EN_TIMELINE_REQUIRE);
    }
    if (timeline.en) {
      if (timeline.en.length > 256) {
        errors.push(STAGE_DEFAULT_RESPONE_MESSAGE.EN_TIMELINE_TOO_LONG);
      }
    }
    if (!timeline.jp) {
      errors.push(STAGE_DEFAULT_RESPONE_MESSAGE.JP_TIMELINE_REQUIRE);
    }
    if (timeline.jp) {
      if (timeline?.jp.length > 256) {
        errors.push(STAGE_DEFAULT_RESPONE_MESSAGE.JP_TIMELINE_TOO_LONG);
      }
    }
    if (!timeline.cn) {
      errors.push(STAGE_DEFAULT_RESPONE_MESSAGE.CN_TIMELINE_REQUIRE);
    }
    if (timeline.cn) {
      if (timeline?.cn.length > 256) {
        errors.push(STAGE_DEFAULT_RESPONE_MESSAGE.CN_TIMELINE_TOO_LONG);
      }
    }
    return errors;
  }
  /**
   * validate pipe of data in step 3 create f-nft pool
   * @param data
   * @returns
   */
  async validateConfigureWhitelist(
    data: VerifyConfigureWhitelistDTO,
    onChain = false,
  ) {
    const errors = [];
    if (!onChain) {
      if (data.isFCFS) {
        if (data.allocationFCFS == '')
          errors.push(POOL_NFT_MESSAGE.ALLOCATION_SIZE_IS_REQUIRE);
        if (new BigNumber(data.allocationFCFS).isLessThanOrEqualTo(0))
          errors.push(messsage.E14);
        if (
          new BigNumber(data.allocationFCFS).isGreaterThan(
            new BigNumber(data.totalSold),
          )
        )
          errors.push(messsage.E29);
        if (data.allocationFCFS.split('.').length === 2) {
          if (data.allocationFCFS.split('.')[1].length > 4)
            errors.push(messsage.E32);
        }
      } else {
        const validateAllocation = await this.checkValidAllocationSetting(
          data.allocationSettings,
        );
        if (!validateAllocation.isValid) {
          errors.push(validateAllocation.message);
        }
      }
    }
    const validateTime = await this.checkValidwhitelistAnnouncementTime(data);
    if (!validateTime.isValid) {
      errors.push(validateTime.message);
    }
    return {
      isValid: errors.length <= 0,
      errors: errors,
    };
  }

  async checkValidTokenAddress(tokenAddress, dataSymbol, dataDecimals) {
    const contractProxy = new Web3ETH().getContractErc20Instance(tokenAddress);
    const symbol = await contractProxy.methods.symbol().call();
    const decimals = await contractProxy.methods.decimals().call();
    return {
      isValid: !(
        symbol.toUpperCase() !== dataSymbol.toUpperCase() ||
        decimals !== dataDecimals
      ),
      message:
        symbol !== dataSymbol || decimals !== dataDecimals
          ? POOL_NFT_MESSAGE.INVALID_TOKEN
          : '',
    };
  }

  async checkValidwhitelistAnnouncementTime(
    fNFTPool: VerifyConfigureWhitelistDTO,
  ) {
    if (fNFTPool.whitelistAnnouncementTime) {
      const purchaseStartTime = new Date(fNFTPool.purchaseStartTime);
      const registrationEndTime = new Date(fNFTPool.registrationEndTime);
      const whitelistTime = new Date(fNFTPool.whitelistAnnouncementTime);

      if (whitelistTime) {
        if (purchaseStartTime <= whitelistTime) {
          return {
            isValid: false,
            message: POOL_NFT_MESSAGE.WHITELIST_TIME_E22,
          };
        }

        if (registrationEndTime >= whitelistTime) {
          return {
            isValid: false,
            message: POOL_NFT_MESSAGE.WHITELIST_TIME_E15,
          };
        }
      }
    }

    return {
      isValid: true,
      message: '',
    };
  }

  async checkValidPoolName(poolName) {
    const obj = JSON.parse(poolName);
    if (
      !Object.keys(obj).includes('en') ||
      !Object.keys(obj).includes('jp') ||
      !Object.keys(obj).includes('cn') ||
      Object.keys(obj).length !== 3
    ) {
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.POOL_NAME_INVALID,
      };
    }

    if (!obj.en) {
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.POOL_NAME_EN_REQUIRE,
      };
    }
    if (obj.en.length > 256) {
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.POOL_NAME_EN_MAX_256,
      };
    }

    if (!obj.jp) {
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.POOL_NAME_JP_REQUIRE,
      };
    }
    if (obj.jp.length > 256) {
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.POOL_NAME_JP_MAX_256,
      };
    }
    if (!obj.cn) {
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.POOL_NAME_CN_REQUIRE,
      };
    }
    if (obj.cn.length > 256) {
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.POOL_NAME_CN_MAX_256,
      };
    }
    Object.keys(obj).forEach((e) => {
      if (!Utils.validateLengthOfString(obj[e])) {
        return {
          isValid: false,
          message: POOL_NFT_MESSAGE.POOL_NAME_INVALID,
        };
      }
    });

    return {
      isValid: true,
      message: '',
    };
  }

  async checkValidPoolDescription(poolDescription) {
    if (poolDescription) {
      const obj = JSON.parse(poolDescription);
      if (
        !Object.keys(obj).includes('en') ||
        !Object.keys(obj).includes('jp') ||
        !Object.keys(obj).includes('cn') ||
        Object.keys(obj).length !== 3
      ) {
        return {
          isValid: false,
          message: POOL_NFT_MESSAGE.POOL_DESCRIPTION_INVALID,
        };
      }
      if (obj.en.length > 5000) {
        return {
          isValid: false,
          message: POOL_NFT_MESSAGE.POOL_DESCRIPTION_EN_MAX_256,
        };
      }
      if (obj.jp.length > 5000) {
        return {
          isValid: false,
          message: POOL_NFT_MESSAGE.POOL_DESCRIPTION_JP_MAX_256,
        };
      }
      if (obj.cn.length > 5000) {
        return {
          isValid: false,
          message: POOL_NFT_MESSAGE.POOL_DESCRIPTION_CN_MAX_256,
        };
      }

      Object.keys(obj).forEach((e) => {
        if (!Utils.validateLengthOfString(obj[e], 5000)) {
          return {
            isValid: false,
            message: POOL_NFT_MESSAGE.POOL_DESCRIPTION_INVALID,
          };
        }
      });
    }

    return {
      isValid: true,
      message: '',
    };
  }

  async checkValidNFTId(nftId) {
    const nft = await this.nftModel.findOne({
      tokenId: nftId,
    });
    if (!nft) {
      return {
        isValid: false,
        messsage: POOL_NFT_MESSAGE.NFT_NOT_EXIST,
      };
    }
    if (nft.status !== NFT_Status.NFT_FRACTIONALIZED) {
      return {
        isValid: false,
        messsage: POOL_NFT_MESSAGE.NFT_IS_NOT_F,
      };
    }

    if (nft.deleted) {
      return {
        isValid: false,
        messsage: POOL_NFT_MESSAGE.NFT_IS_DETELED,
      };
    }

    const pool = await this.fNFTModel.findOne({
      'fNFT.nftId': nftId,
      poolType: TYPE_POOL.ONCHAIN,
    });
    if (pool) {
      return {
        isValid: false,
        messsage: POOL_NFT_MESSAGE.FNFT_POOL_EXIST,
      };
    }

    return {
      isValid: true,
      messsage: '',
    };
  }

  async checkValidTotalSold(totalSold, nftId) {
    const totalSoldStr = new BigNumber(totalSold);
    if (totalSold) {
      if (!totalSoldStr.isGreaterThan(0)) {
        return {
          isValid: false,
          messsage: 'totalSold must be greater than 0',
        };
      }
      if (!Utils.validateMaxLengthOfNumber(totalSoldStr.toString(), 18, 8)) {
        return {
          isValid: false,
          messsage: 'totalSold must be shorter than or equal to 18 characters',
        };
      }
      const nft = await this.nftModel.findOne({ tokenId: nftId });
      const fNFTAvailableAmount = new BigNumber(nft?.availableAmount || '0');
      const fNFTPoolTotalSold = new BigNumber(totalSold);
      if (fNFTPoolTotalSold.isGreaterThan(fNFTAvailableAmount)) {
        return {
          isValid: false,
          messsage: POOL_NFT_MESSAGE.NOT_ENOUGH_AMOUNT,
        };
      }
    }
    return {
      isValid: true,
      messsage: '',
    };
  }

  checkValidExchangeRates(totalSold) {
    const totalSoldStr = new BigNumber(totalSold);
    if (totalSoldStr) {
      if (!totalSoldStr.isGreaterThan(0)) {
        return {
          isValid: false,
          messsage: 'exchangeRates must be greater than 0',
        };
      }
      if (!Utils.validateMaxLengthOfNumber(totalSoldStr.toString(), 18, 8)) {
        return {
          isValid: false,
          messsage:
            'exchangeRates must be shorter than or equal to 18 characters',
        };
      }
    }
    return {
      isValid: true,
      messsage: '',
    };
  }

  async checkValidSeries(seriesId) {
    const checkExist = await Utils.checkExistInDBById(
      this.serialModel,
      seriesId,
    );
    return {
      isValid: checkExist ? true : false,
      messsage: checkExist ? '' : POOL_NFT_MESSAGE.SERIAL_NOT_EXIST,
    };
  }

  async checkValidPath(pathId) {
    const checkExist = await Utils.checkExistInDBById(this.pathModel, pathId);
    return {
      isValid: checkExist ? true : false,
      messsage: checkExist ? '' : POOL_NFT_MESSAGE.PATH_NOT_EXIST,
    };
  }

  checkValidProductionPeriodTime(fNFTPool) {
    if (
      !fNFTPool.productionPeriodStartTime &&
      !fNFTPool.productionPeriodEndTime
    ) {
      return {
        isValid: true,
        messsage: '',
      };
    }
    if (
      fNFTPool.productionPeriodStartTime == 'null' &&
      fNFTPool.productionPeriodEndTime == 'null'
    ) {
      return {
        isValid: true,
        messsage: '',
      };
    }
    const productionPeriodStartTime = new Date(
      fNFTPool.productionPeriodStartTime,
    );
    const productionPeriodEndTime = new Date(fNFTPool.productionPeriodEndTime);
    const purchaseEndTime = new Date(fNFTPool.purchaseEndTime);
    if (
      fNFTPool.productionPeriodEndTime != '' &&
      !fNFTPool.productionPeriodStartTime
    ) {
      return {
        isValid: false,
        messsage: messsage.E23,
      };
    }
    if (
      fNFTPool.productionPeriodStartTime != '' &&
      !fNFTPool.productionPeriodEndTime
    ) {
      return {
        isValid: false,
        messsage: messsage.E30,
      };
    }
    if (productionPeriodEndTime <= productionPeriodStartTime) {
      return {
        isValid: false,
        messsage: messsage.E23,
      };
    }
    if (purchaseEndTime > productionPeriodStartTime) {
      return {
        isValid: false,
        messsage: messsage.E24,
      };
    }
    if (purchaseEndTime > productionPeriodEndTime) {
      return {
        isValid: false,
        messsage: messsage.E25,
      };
    }

    return {
      isValid: true,
      messsage: '',
    };
  }

  checkValidTimeSetting(fNFTPool) {
    const registrationStartTime = new Date(fNFTPool.registrationStartTime);
    const registrationEndTime = new Date(fNFTPool.registrationEndTime);
    const purchaseStartTime = new Date(fNFTPool.purchaseStartTime);
    const purchaseEndTime = new Date(fNFTPool.purchaseEndTime);
    if (registrationEndTime <= registrationStartTime) {
      return {
        isValid: false,
        messsage: POOL_NFT_MESSAGE.E15,
      };
    }
    if (purchaseStartTime <= registrationEndTime) {
      return {
        isValid: false,
        messsage: POOL_NFT_MESSAGE.E16,
      };
    }
    if (purchaseEndTime <= purchaseStartTime) {
      return {
        isValid: false,
        messsage: POOL_NFT_MESSAGE.E17,
      };
    }
    return {
      isValid: true,
      messsage: '',
    };
  }

  async checkValidAllocationSetting(data: AllocationSettingDTO[]) {
    const tieringStructure =
      await this.tieringStructureService.getAllTieringStructure();
    if (!isArray(data))
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.DATA_TIERING_STRUCTURE_INVALID,
      };
    if (data.length !== tieringStructure.length) {
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.DATA_TIERING_STRUCTURE_INVALID,
      };
    }
    data.sort((a, b) => a.tierNumber - b.tierNumber);
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i].tierNumber !== data[i + 1].tierNumber - 1) {
        return {
          isValid: false,
          message: POOL_NFT_MESSAGE.DATA_TIERING_STRUCTURE_INVALID,
        };
      }
    }

    let percentCount = 0;
    data.forEach((e) => {
      percentCount += Number(e.allocationPercent);
    });

    return {
      isValid: percentCount === 100,
      message: percentCount === 100 ? '' : POOL_NFT_MESSAGE.ALLOCATION_ERROR,
    };
  }

  async checkValidTimeline(step: number) {
    const timeline = await this.timelineModel.exists({
      step: step,
    });
    return {
      isValid: timeline ? true : false,
      message: timeline ? '' : POOL_NFT_MESSAGE.STEP_OF_TIMELINE_NOT_EXIST,
    };
  }

  validateRequire(obj, fields) {
    const errs = [];
    fields.forEach((e) => {
      if (!obj[e]) errs.push(`${e} is required`);
    });
    return errs;
  }

  validateStartTimeLines(periodStart, periodEnd, startTimelines) {
    if (new Date(startTimelines[0]).getTime() < periodStart.getTime())
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.VALIDATE_START_TIME_LINE,
      };

    if (
      new Date(startTimelines[startTimelines.length - 1]).getTime() >
      periodEnd.getTime()
    )
      return {
        isValid: false,
        message: POOL_NFT_MESSAGE.VALIDATE_END_TIME_LINE,
      };

    for (let i = 0; i < startTimelines.length - 1; i++) {
      if (
        new Date(startTimelines[i]).getTime() >=
        new Date(startTimelines[i + 1]).getTime()
      ) {
        return {
          isValid: false,
          message: POOL_NFT_MESSAGE.VALIDATE_STEP_TIME_LINE,
        };
      }
    }
  }
}
