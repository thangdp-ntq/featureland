import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { parseString } from 'fast-csv';
import { sub } from 'date-fns';
import {
  SORT_AGGREGATE,
  sortType,
  POOL_NFT_MESSAGE,
  API_SUCCESS,
  TYPE_POOL,
  STAKING_TYPE,
  WEBHOOK_EXCEPTION,
  DECIMALS_DAD,
  PURCHASE_STATUS,
  RewardPoolStatus,
  KEY_IMPORT_CSV,
} from '../common/constants';
import ObjectID from 'bson-objectid';
import { isEthereumAddress } from 'class-validator';

import { Pagination } from '../common/interface';
import { Utils } from '../common/utils';
import { CreateFNFTPoolDTO, StakingInfo } from './dto/create-f-nft-pool.dto';
import { FNFTPoolSchema, PoolUsers } from './dto/response.dto';
import { FNFTPoolValidator } from './f-nft-pool.validator';
import {
  VerifyConfigureWhitelistDTO,
  VerifyGeneralInfoDTO,
  VerifySelectNFTDTO,
  VerifyStageDto,
} from './dto/verify-f-nft-pool.dto';
import { ApiSuccessResponse } from '../common/responses/api-success';
import { ErrorDetail } from '../common/responses/api-error';
import { GetFNFTPoolDTO } from './dto/get-f-nft-pool.dto';
import { Timeline, TimelineDocument } from '../schemas/timeline.schema';
import {
  FNFTPool,
  FNFTPoolDocument,
  Stages,
} from '../schemas/f-nft-pool.schema';
import { NftService } from '../nft/nft.service';
import { UploadService } from '../upload/upload.service';
import {
  UpdateAllocationSettingDTO,
  UpdateFNFTPoolDTO,
  UpdateFNFTPoolOnChainDTO,
} from './dto/update-f-nft-pool.dto';
import {
  TieringStructure,
  TieringStructureDocument,
} from '../schemas/tiering-structure.schema';
import {
  HistoryStaking,
  HistoryStakingDocument,
} from '../schemas/staking-history.schema';
import { User, UserDocument } from '../schemas/user.schema';
import BigNumber from 'bignumber.js';
import {
  NFT,
  NFTDocument,
  PurchaseFNFT,
  PurchaseFNFTDocument,
  RewardPool,
  RewardPoolDocument,
} from '../schemas';
import { HttpError } from '../common/responses/api-errors';
import mongoose from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { IdPool, IdPoolDocument } from '../schemas/idPool.schema';
import { CommonService } from '~/common-service/common.service';
import { FilterPurchasedUserDetails } from './dto/analysis-fnft-pool.dto';
const _ = require('lodash');

@Injectable()
export class FNftPoolService {
  constructor(
    private uploadService: UploadService,
    private fNFTPoolValidator: FNFTPoolValidator,
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
    @InjectModel(FNFTPool.name)
    private fNFTModel: Model<FNFTPoolDocument>,
    @InjectModel(PurchaseFNFT.name)
    private purchaseModel: Model<PurchaseFNFTDocument>,
    @InjectModel(HistoryStaking.name)
    private stakingHistoryModel: Model<HistoryStakingDocument>,
    @InjectModel(FNFTPool.name) private fnftPoolModel: Model<FNFTPoolDocument>,
    @InjectModel(Timeline.name) private timelineModel: Model<TimelineDocument>,
    @InjectModel(RewardPool.name)
    private rewardPoolModel: Model<RewardPoolDocument>,
    @InjectModel(TieringStructure.name)
    private tierModel: Model<TieringStructureDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(IdPool.name)
    private idPoolModel: Model<IdPoolDocument>,
    private nftService: NftService,
    private readonly jwtService: JwtService,
    private readonly commonService: CommonService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async getListFNFTPool(query): Promise<Pagination<FNFTPoolSchema[]>> {
    const { page, pageSize } = query;
    let match: Record<string, any> = {};
    const sort: Record<string, any> = {};
    if (query.textSearch) {
      match = {
        $or: [
          {
            'poolName.en': {
              $regex: Utils.escapeRegex(query.textSearch.trim()),
              $options: 'i',
            },
          },
          {
            'poolName.cn': {
              $regex: Utils.escapeRegex(query.textSearch.trim()),
              $options: 'i',
            },
          },
          {
            'poolName.jp': {
              $regex: Utils.escapeRegex(query.textSearch.trim()),
              $options: 'i',
            },
          },
          {
            'fNFT.nftName': {
              $regex: Utils.escapeRegex(query.textSearch.trim()),
              $options: 'i',
            },
          },
          {
            'fNFT.fNFTName': {
              $regex: Utils.escapeRegex(query.textSearch.trim()),
              $options: 'i',
            },
          },
          {
            'fNFT.fNFTSymbol': {
              $regex: Utils.escapeRegex(query.textSearch.trim()),
              $options: 'i',
            },
          },
          {
            'fNFT.nftId': +query.textSearch,
          },
        ],
      };
    }
    if (query.textSearch && !isNaN(+query.textSearch.trim())) {
      match['$or'].push({
        poolId: +query.textSearch.trim(),
      });
    }
    if (query.nameOId) {
      match = {
        $or: [
          {
            'poolName.en': {
              $regex: Utils.escapeRegex(query.nameOId.trim()),
              $options: 'i',
            },
          },
          {
            'poolName.cn': {
              $regex: Utils.escapeRegex(query.nameOId.trim()),
              $options: 'i',
            },
          },
          {
            'poolName.jp': {
              $regex: Utils.escapeRegex(query.nameOId.trim()),
              $options: 'i',
            },
          },
          {
            'fNFT.nftId': +query.nameOId,
          },
        ],
      };
    }
    if (Object.keys(query).includes('status')) {
      match.status = query.status;
    }
    if (Object.keys(query).includes('poolType')) {
      match.poolType = query.poolType;
    }
    if (query.canCreateReward) {
      match.purchaseEndTime = {
        $lt: new Date(),
      };
      match.rewardId = {
        $exists: false,
      };
      match['$expr'] = {
        $ne: ['$fNFT.availableAmount', '$fNFT.totalSold'],
      };
    }
    const embeddedField = ['nftId', 'nftName', 'fNFTName', 'fNFTSymbol'];
    if (query.sortField) {
      if (!embeddedField.includes(query.sortField)) {
        sort[query.sortField] =
          SORT_AGGREGATE[
            query.sortType
              ? query.sortType.toUpperCase()
              : sortType.asc.toUpperCase()
          ];
      } else {
        sort[`fNFT.${query.sortField}`] =
          SORT_AGGREGATE[
            query.sortType
              ? query.sortType.toUpperCase()
              : sortType.asc.toUpperCase()
          ];
      }
    } else {
      sort['createdAt'] = SORT_AGGREGATE.DESC;
    }
    const queryParam = {
      limit: pageSize,
      page,
      projection: {
        _id: 1,
        poolName: 1,
        poolImage: 1,
        poolDescription: 1,
        withdraw: 1,
        blockchainNetwork: 1,
        acceptedCurrencyAddress: 1,
        acceptedCurrencySymbol: 1,
        acceptedCurrencyDecimals: 1,
        receiveWalletAddress: 1,
        registrationStartTime: 1,
        registrationEndTime: 1,
        purchaseStartTime: 1,
        purchaseEndTime: 1,
        fNFT: 1,
        status: 1,
        step: 1,
        allocationSettings: 1,
        poolType: 1,
        whitelistURL: 1,
        poolId: 1,
        createdAt: 1,
        createdBy: 1,
        updatedAt: 1,
        updatedBy: 1,
        mintedOn: 1,
        mintedBy: 1,
        bePaidGasFee: 1,
      },
      sort,
    };
    const listFNFTPool = await Utils.paginate(
      this.fNFTModel,
      { ...match },
      queryParam,
    );
    const allPool = JSON.parse(JSON.stringify(listFNFTPool.docs));

    const pools = await Promise.all(
      allPool.map(async (pool) => {
        const createdBy = await this.getAdminHandle(pool?.createdBy);
        const updatedBy = await this.getAdminHandle(pool?.updatedBy);
        const mintedBy = await this.getAdminHandle(pool?.mintedBy);
        return {
          ...pool,
          createdBy: createdBy,
          updatedBy: updatedBy,
          mintedBy: mintedBy,
        };
      }),
    );
    return {
      items: pools,
      pageCurrent: page,
      totalDocs: listFNFTPool.totalDocs,
      hasPrevPage: listFNFTPool.hasPrevPage,
      hasNextPage: listFNFTPool.hasNextPage,
    };
  }

  async getFNFTPoolDetail(id) {
    const queryParam = {
      limit: 1,
      page: 1,
      projection: {
        _id: 1,
        poolName: 1,
        poolImage: 1,
        poolVideo: 1,
        poolDescription: 1,
        status: 1,
        seriesId: 1,
        pathId: 1,
        withdraw: 1,
        blockchainNetwork: 1,
        acceptedCurrencyAddress: 1,
        acceptedCurrencySymbol: 1,
        acceptedCurrencyDecimals: 1,
        receiveWalletAddress: 1,
        registrationStartTime: 1,
        registrationEndTime: 1,
        purchaseStartTime: 1,
        purchaseEndTime: 1,
        fNFT: 1,
        whitelistURL: 1,
        step: 1,
        poolId: 1,
        allocationSettings: 1,
        poolType: 1,
        users: 1,
        isFCFS: 1,
        allocationFCFS: 1,
        timelines: 1,
        startTimelines: 1,
        productionPeriodEndTime: 1,
        productionPeriodStartTime: 1,
        whitelistAnnouncementTime: 1,
        configWhitelist: 1,
        createdAt: 1,
        updatedAt: 1,
        mintedAt: 1,
        bePaidGasFee: 1,
      },
    };
    const fNFTPool = await Utils.paginate(
      this.fNFTModel,
      { poolId: id },
      queryParam,
    );
    if (!fNFTPool.totalDocs) {
      throw POOL_NFT_MESSAGE.POOL_NOT_EXIST;
    }
    const data = fNFTPool.docs[0];
    const admins = await this.userModel.find({
      address: { $in: [data.createdBy, data.updatedBy, data.mintedBy] },
    });
    const createdBy = admins.find((admin) => admin.address === data.createdBy);
    const updatedBy = admins.find((admin) => admin.address === data.updatedBy);
    const mintedBy = admins.find((admin) => admin.address === data.mintedBy);
    const createdByAdmin = {
      address: createdBy?.address,
      username: createdBy?.username,
    };
    const updatedByAdmin = {
      address: updatedBy?.address,
      username: updatedBy?.username,
    };
    const mintedByAdmin = {
      address: mintedBy?.address,
      username: mintedBy?.username,
    };
    return {
      code: API_SUCCESS,
      data: data,
      adminCreated: {
        address: createdByAdmin.address,
        username: createdByAdmin.username,
      },
      adminUpdated: {
        address: updatedByAdmin.address,
        username: updatedByAdmin.username,
      },
      adminMinted: {
        address: mintedByAdmin.address,
        username: mintedByAdmin.username,
      },
      message: 'Get Detail Reward Successfully',
    };
  }

  async createFNFTPool(
    data: CreateFNFTPoolDTO,
    admin: any,
    poolImage: Express.Multer.File,
    poolVideo: Express.Multer.File,
  ) {
    const validateData =
      await this.fNFTPoolValidator.validateDataCreateFNFTPool(
        data,
        poolImage,
        poolVideo,
      );
    if (!validateData.isValid) {
      throw new ErrorDetail(
        POOL_NFT_MESSAGE.VALIDATE_CREATE_F_NFT_POOL_ERROR,
        validateData.errors,
      );
    }

    const fNFT = await this.nftService.getFNFTByNFTId(data.nftId);
    fNFT.exchangeRates = data.exchangeRates;
    fNFT.totalSold = data.totalSold;
    fNFT.availableAmount = data.totalSold;
    const fNFTData: FNFTPool = {
      poolName: JSON.parse(data.poolName),
      poolDescription: data?.poolDescription
        ? JSON.parse(data?.poolDescription)
        : '',
      status: data.status,
      blockchainNetwork: data.blockchainNetwork,
      acceptedCurrencyAddress: data.acceptedCurrencyAddress,
      receiveWalletAddress: data.receiveWalletAddress,
      registrationStartTime: new Date(data.registrationStartTime),
      registrationEndTime: new Date(data.registrationEndTime),
      purchaseStartTime: new Date(data.purchaseStartTime),
      purchaseEndTime: new Date(data.purchaseEndTime),
      acceptedCurrencySymbol: data.acceptedCurrencySymbol,
      acceptedCurrencyDecimals: data.acceptedCurrencyDecimals,
      fNFT: fNFT,
      availableAmount: data.totalSold,
      isFCFS: data.isFCFS,
      step: 1,
      whitelistURL: data.whitelistURL,
      whitelistAnnouncementTime: data.whitelistAnnouncementTime
        ? new Date(data.whitelistAnnouncementTime)
        : null,
      createdBy: admin.address,
      updatedBy: admin.address,
      bePaidGasFee: data.bePaidGasFee,
    };
    if (data.bePaidGasFee) {
      fNFTData.limitPurchase = data?.limitPurchase;
    }
    if (data.isFCFS) {
      fNFTData.allocationFCFS = data.allocationFCFS;
    } else {
      fNFTData.allocationSettings = JSON.parse(data.allocationSettings);
    }
    if (data.seriesId) {
      fNFTData.seriesId = data.seriesId;
    }
    if (data.pathId) {
      fNFTData.pathId = data.pathId;
    }
    const resUpload = await this.uploadService.uploadFileS3(
      poolImage,
      process.env.AWS_FOLDER_IMAGES,
    );
    if (resUpload.code === API_SUCCESS) {
      fNFTData.poolImage = resUpload.data;
    } else {
      throw new ErrorDetail(POOL_NFT_MESSAGE.UPLOAD_FAIL, [
        POOL_NFT_MESSAGE.UPLOAD_FAIL,
      ]);
    }
    if (poolVideo) {
      const resUploadVideo = await this.uploadService.uploadFileS3(
        poolVideo,
        process.env.AWS_FOLDER_VIDEOS,
      );
      if (resUploadVideo.code === API_SUCCESS) {
        fNFTData.poolVideo = resUploadVideo.data;
      } else {
        throw new ErrorDetail(POOL_NFT_MESSAGE.UPLOAD_FAIL, [
          POOL_NFT_MESSAGE.UPLOAD_FAIL,
        ]);
      }
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const nft = await this.nftModel.findOne({ tokenId: data.nftId });
      if (nft.hasFNFTPool)
        throw new ErrorDetail(POOL_NFT_MESSAGE.FNFT_POOL_EXIST, [
          POOL_NFT_MESSAGE.FNFT_POOL_EXIST,
        ]);
      const id = await this.idPoolModel.findOne({});
      if (id) {
        fNFTData.poolId = id.id + 1;
        const fNFTModel = await this.fnftPoolModel.create(fNFTData);
        await this.idPoolModel.updateOne(
          { _id: id._id },
          { id: id.id + 1 },
          { session: session },
        );
        try {
          await this.nftModel.findOneAndUpdate(
            { tokenId: nft.tokenId, updatedAt: nft['updatedAt'] },
            { hasFNFTPool: true },
            { session: session },
          );
        } catch (error) {
          throw new ErrorDetail(POOL_NFT_MESSAGE.CONFLICT_CREATE_FNFT_POOL, [
            POOL_NFT_MESSAGE.CONFLICT_CREATE_FNFT_POOL,
          ]);
        }
        await session.commitTransaction();
        return fNFTModel;
      } else {
        const id = await this.idPoolModel.create({ id: 1 });
        fNFTData.poolId = id.id;
        const fNFTModel = await this.fnftPoolModel.create(fNFTData);
        try {
          await this.nftModel.findOneAndUpdate(
            { tokenId: nft.tokenId, updatedAt: nft['updatedAt'] },
            { hasFNFTPool: true },
            { session: session },
          );
        } catch (error) {
          throw new ErrorDetail(POOL_NFT_MESSAGE.CONFLICT_CREATE_FNFT_POOL, [
            POOL_NFT_MESSAGE.CONFLICT_CREATE_FNFT_POOL,
          ]);
        }
        await session.commitTransaction();
        return fNFTModel;
      }
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getPoolNft(params: GetFNFTPoolDTO) {
    return params;
  }

  async importWhitelist(file, poolId: number) {
    try {
      const pool = await this.fnftPoolModel.findOne({ poolId: poolId });
      if (!pool) return POOL_NFT_MESSAGE.POOL_NOT_FOUND;
      // if (new Date() > pool.purchaseStartTime)
      //   return POOL_NFT_MESSAGE.POOL_IS_PURCHASE;
      const data = await this.readCsv(file);
      const { addressInvalid, duplicateUsers, correctUsers } =
        this.filterAddress(data, pool);
      // await this.fnftPoolModel.updateOne(
      //   { _id: pool._id },
      //   {
      //     users: correctUsers,
      //   },
      // );
      return {
        addressInvalid,
        duplicateUsers,
        correctUsers,
      };
    } catch (error) {
      return POOL_NFT_MESSAGE.IMPORT_WHITE_LIST_FAIL;
    }
  }
  readCsv(file) {
    return new Promise((res, rej) => {
      const data = [];
      parseString(file.buffer.toString(), {
        headers: true,
        objectMode: true,
        maxRows: 1000000000,
      })
        .on('error', (error) => rej(error))
        .on('data', (row) => {
          data.push(row);
        })
        .on('end', (rowCount) => res(data));
    });
  }

  async verifySelectNFT(data: VerifySelectNFTDTO) {
    const { isValid, errors } = await this.fNFTPoolValidator.validateSelectNFT(
      data,
    );
    if (!isValid)
      throw new ErrorDetail(POOL_NFT_MESSAGE.VALIDATE_SELECT_NFT_ERROR, errors);
    return new ApiSuccessResponse<unknown>().success({}, '');
  }

  async updateTimeline(step: number, poolId: ObjectID) {
    const timeline = await this.timelineModel.findOne({ step });
    if (!timeline) {
      return POOL_NFT_MESSAGE.TIME_LINE_NOT_FOUND;
    }
    const pool = await this.fnftPoolModel.findOne({ id: poolId });
    if (!pool) return POOL_NFT_MESSAGE.POOL_NOT_FOUND;

    await this.fnftPoolModel.updateOne(
      { id: poolId },
      { step: ObjectID(timeline.id) },
    );
    return POOL_NFT_MESSAGE.UPDATE_TIME_LINE_SUCCESS;
  }

  async verifyGeneralInfo(
    data: VerifyGeneralInfoDTO,
    file: Express.Multer.File,
    poolVideo: Express.Multer.File,
  ) {
    const { isValid, errors } =
      await this.fNFTPoolValidator.validateGeneralInfo(data, file, poolVideo);
    if (!isValid)
      throw new ErrorDetail(
        POOL_NFT_MESSAGE.VALIDATE_GENERAL_INFO_ERROR,
        errors,
      );
    return new ApiSuccessResponse<unknown>().success({}, '');
  }

  async verifyGeneralInfoWhenEdit(
    data: VerifyGeneralInfoDTO,
    file: Express.Multer.File,
    poolVideo: Express.Multer.File,
  ) {
    const { isValid, errors } =
      await this.fNFTPoolValidator.validateGeneralInfoWhenEdit(
        data,
        file,
        poolVideo,
      );
    if (!isValid)
      throw new ErrorDetail(
        POOL_NFT_MESSAGE.VALIDATE_GENERAL_INFO_ERROR,
        errors,
      );
    return new ApiSuccessResponse<unknown>().success({}, '');
  }

  async verifyConfigureWhitelist(data: VerifyConfigureWhitelistDTO) {
    const { isValid, errors } =
      await this.fNFTPoolValidator.validateConfigureWhitelist(data);
    if (!isValid)
      throw new ErrorDetail(
        POOL_NFT_MESSAGE.VALIDATE_CONFIGURE_WHITELIST_ERROR,
        errors,
      );
    return new ApiSuccessResponse<unknown>().success({}, '');
  }

  async verifyProductionStage(data: VerifyStageDto) {
    const { isValid, errors } =
      await this.fNFTPoolValidator.validateProductionStages(data);
    if (!isValid)
      throw new ErrorDetail(
        POOL_NFT_MESSAGE.VALIDATE_PRODUCTION_STAGE_ERROR,
        errors,
      );
    return new ApiSuccessResponse<unknown>().success({}, '');
  }

  async updateTier() {
    return;
  }

  async calculator(users, poolId) {
    const pool = await this.fnftPoolModel.findOne({ poolId: poolId });
    if (users.isFCFS) {
      //const { correctUsers } = this.filterAddress(users, pool);
      // await this.fnftPoolModel.updateOne(
      //   { _id: pool._id },
      //   {
      //     users: users.data,
      //   },
      // );
      return POOL_NFT_MESSAGE.POOL_FCFS;
    }
    if (!pool) return POOL_NFT_MESSAGE.POOL_NOT_FOUND;
    const tier = await this.tierModel
      .find()
      .sort({ tierNumber: SORT_AGGREGATE.ASC });
    const {
      addressInvalid,
      duplicateUsers,
      resultUser,
      userUnStaking,
      tierCalc,
    } = await this.calculateWhitelist(
      users.data,
      tier,
      new Date(users.purchaseStartTime),
      users.tieringStructure,
      users.totalSold,
      users.exchangeRates,
    );
    // await this.fnftPoolModel.updateOne(
    //   { _id: pool.id },
    //   {
    //     users: resultUser,
    //     configWhitelist: tierCalc,
    //   },
    // );
    return {
      correctUsers: resultUser,
      duplicateUsers,
      addressInvalid,
      userUnStaking,
      tier: tierCalc,
    };
  }

  filterAddress(infoUsers, pool) {
    const arrayKey = KEY_IMPORT_CSV;
    let keyAddress = KEY_IMPORT_CSV[0];
    let addressInvalid = [];
    const duplicateUsers = [];
    let correctUsers = [];

    if (infoUsers.length) {
      for (let key of arrayKey) {
        if (key in infoUsers[0]) {
          keyAddress = key;
          break;
        }
      }
    }

    infoUsers.forEach((infoUser) => {
      if (!isEthereumAddress(infoUser[keyAddress].trim()))
        addressInvalid.push({
          address: infoUser[keyAddress].trim(),
        });
      else if (
        correctUsers.find(
          (correctAddress) =>
            correctAddress[keyAddress] === infoUser[keyAddress].trim(),
        ) !== undefined
      )
        duplicateUsers.push({
          address: infoUser[keyAddress].trim(),
        });
      else {
        correctUsers.push({
          [`${keyAddress}`]: infoUser[keyAddress].trim(),
          address: infoUser[keyAddress].trim(),
        });
      }
    });
    addressInvalid = addressInvalid.filter((user) => user.address !== '');
    correctUsers = correctUsers.map((user) => {
      return { address: user.address };
    });

    return {
      addressInvalid,
      duplicateUsers,
      correctUsers,
    };
  }

  async updateFNFTPoolDraft(
    poolId: string,
    admin: any,
    data: UpdateFNFTPoolDTO,
    file: Express.Multer.File,
    poolVideo: Express.Multer.File,
  ) {
    const fNFTPool = await this.fnftPoolModel.findById(poolId);
    if (!fNFTPool) {
      throw POOL_NFT_MESSAGE.POOL_NOT_EXIST;
    }

    if (fNFTPool.poolType === TYPE_POOL.ONCHAIN) {
      throw new ErrorDetail(POOL_NFT_MESSAGE.VALIDATE_UPDATE_POOL_DRAFT_ERROR, [
        POOL_NFT_MESSAGE.CAN_NOT_UPDATE_DRAFT_POOL_ON_CHAIN,
      ]);
    }

    const validateData =
      await this.fNFTPoolValidator.validateDataUpdatePoolDraft(
        data,
        file,
        poolVideo,
        fNFTPool,
      );
    if (!validateData.isValid) {
      throw new ErrorDetail(
        POOL_NFT_MESSAGE.VALIDATE_UPDATE_POOL_DRAFT_ERROR,
        validateData.errors,
      );
    }

    const fNFT = await this.nftService.getFNFTByNFTId(data.nftId);
    fNFT.exchangeRates = data.exchangeRates;
    fNFT.totalSold = data.totalSold;
    fNFT.availableAmount = data.totalSold;
    const fNFTData: FNFTPool = {
      poolName: JSON.parse(data.poolName),
      poolDescription: data?.poolDescription
        ? JSON.parse(data?.poolDescription)
        : '',
      status: data.status,
      blockchainNetwork: data.blockchainNetwork,
      acceptedCurrencyAddress: data.acceptedCurrencyAddress,
      acceptedCurrencySymbol: data.acceptedCurrencySymbol,
      acceptedCurrencyDecimals: data.acceptedCurrencyDecimals,
      receiveWalletAddress: data.receiveWalletAddress,
      registrationStartTime: new Date(data.registrationStartTime),
      registrationEndTime: new Date(data.registrationEndTime),
      purchaseStartTime: new Date(data.purchaseStartTime),
      purchaseEndTime: new Date(data.purchaseEndTime),
      fNFT: fNFT,
      availableAmount: data.totalSold,
      whitelistURL: data.whitelistURL,
      whitelistAnnouncementTime: data.whitelistAnnouncementTime
        ? new Date(data.whitelistAnnouncementTime)
        : null,
      seriesId: data?.seriesId || null,
      pathId: data?.pathId || null,
      isFCFS: data.isFCFS ?? fNFTPool.isFCFS,
      timelines: JSON.parse(data.timelines),
      step: data.step || fNFTPool.step,
      users: JSON.parse(data.users),
      updatedBy: admin.address,
      bePaidGasFee: data?.bePaidGasFee,
    };
    if (data.productionPeriodStartTime) {
      fNFTData.productionPeriodStartTime = new Date(
        data.productionPeriodStartTime,
      );
    }
    if (data.productionPeriodEndTime) {
      fNFTData.productionPeriodEndTime = new Date(data.productionPeriodEndTime);
    }
    if (data.startTimelines) {
      fNFTData.startTimelines = JSON.parse(data.startTimelines);
      if (JSON.parse(data.startTimelines)?.length) {
        fNFTData.step = this.updateStepProduction(
          JSON.parse(data.startTimelines),
        );
      }
    }

    if (data.configWhitelist) {
      fNFTData.configWhitelist = JSON.parse(data.configWhitelist);
    }
    if (fNFTData.isFCFS) {
      fNFTData.allocationFCFS = data.allocationFCFS;
      fNFTData.allocationSettings = [];
      fNFTData.users = this.updateWhiteListWhenUpdatePoolFCFS(
        fNFTData.users,
        fNFTData.allocationFCFS,
        fNFTData.fNFT.exchangeRates,
      );
    } else {
      fNFTData.allocationSettings = JSON.parse(data.allocationSettings);
      fNFTData.allocationFCFS = null;
    }
    if (data.bePaidGasFee) {
      fNFTData.limitPurchase = data?.limitPurchase;
      fNFTData.limitPurchase &&
        this.updateRemainOfPurchasePoolGasLess(
          fNFTData.users,
          fNFTData.limitPurchase,
        );
    }
    if (file) {
      const resUpload = await this.uploadService.uploadFileS3(
        file,
        process.env.AWS_FOLDER_IMAGES,
      );
      if (resUpload.code === API_SUCCESS) {
        fNFTData.poolImage = resUpload.data;
      } else {
        throw new ErrorDetail(POOL_NFT_MESSAGE.UPLOAD_FAIL, [
          POOL_NFT_MESSAGE.UPLOAD_FAIL,
        ]);
      }
    } else {
      fNFTData.poolImage = fNFTPool.poolImage;
    }

    if (poolVideo) {
      const resUploadVideo = await this.uploadService.uploadFileS3(
        poolVideo,
        process.env.AWS_FOLDER_VIDEOS,
      );
      if (resUploadVideo.code === API_SUCCESS) {
        fNFTData.poolVideo = resUploadVideo.data;
      } else {
        throw new ErrorDetail(POOL_NFT_MESSAGE.UPLOAD_FAIL, [
          POOL_NFT_MESSAGE.UPLOAD_FAIL,
        ]);
      }
    } else {
      fNFTData.poolVideo = fNFTPool.poolVideo;
    }

    if (data.beforeChangeNFTId && data.beforeChangeNFTId !== data.nftId) {
      const session = await this.connection.startSession();
      session.startTransaction();
      try {
        // update id of pool before change => hasFNFTPool = false
        await this.nftModel.updateOne(
          { tokenId: data.beforeChangeNFTId },
          { hasFNFTPool: false },
          { session: session },
        );
        // update id of pool create poolOnChain => hasFNFTPool = true
        await this.nftModel.updateOne(
          { tokenId: data.nftId },
          { hasFNFTPool: true },
          { session: session },
        );
        const fNFTPool = await this.fnftPoolModel.findOneAndUpdate(
          { _id: poolId },
          fNFTData,
          { new: true, session: session },
        );
        await session.commitTransaction();
        return fNFTPool;
      } catch (error) {
        console.log(error);
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    return await this.fnftPoolModel.findOneAndUpdate(
      { _id: poolId },
      fNFTData,
      { new: true },
    );
  }

  async updateAllocationSetting(
    poolId: string,
    data: UpdateAllocationSettingDTO,
  ) {
    const fNFTPool = await this.fnftPoolModel.findOne({ poolId: +poolId });
    if (!fNFTPool) {
      throw POOL_NFT_MESSAGE.POOL_NOT_EXIST;
    }

    if (fNFTPool.purchaseStartTime < new Date()) {
      throw new ErrorDetail(POOL_NFT_MESSAGE.POOL_ON_SALE, [
        POOL_NFT_MESSAGE.POOL_ON_SALE,
      ]);
    }
    fNFTPool.allocationSettings = data.allocationSettings;
    await fNFTPool.save();
    return {};
  }

  async calculateWhitelist(
    infoUsers,
    tier,
    purchaseStartTime,
    allocationSettings,
    totalSold,
    exchangeRates,
  ) {
    const addressInvalid = [];
    const duplicateUsers = [];
    const correctUsers = [];
    const userUnStaking = [];
    infoUsers.forEach((infoUser) => {
      if (!isEthereumAddress(infoUser?.address)) addressInvalid.push(infoUser);
      else if (
        correctUsers.find(
          (correctAddress) => correctAddress?.address === infoUser.address,
        ) !== undefined
      )
        duplicateUsers.push(infoUser);
      else {
        correctUsers.push(infoUser);
      }
    });
    const { resultUser, tierCalc } = await this.updateAllocation(
      correctUsers,
      tier,
      purchaseStartTime,
      allocationSettings,
      totalSold,
      exchangeRates,
    );
    return {
      addressInvalid,
      duplicateUsers,
      resultUser,
      userUnStaking,
      tierCalc,
    };
  }

  // calc tier
  async getTierUser(info, tier, purchaseStartTime) {
    for (let index = 0; index < tier.length; index++) {
      const isTier = await this.checkTier(
        purchaseStartTime,
        info.address,
        tier[index],
      );
      if (isTier) return tier[index].tierNumber;
    }
    return null;
  }

  //Update No.User of tier and User allocation
  async updateAllocation(
    userInfos,
    tier,
    purchaseStartTime,
    allocationSettings,
    totalSold,
    exchangeRates,
  ) {
    const tierCalc = tier.map((e) => {
      const supply =
        (allocationSettings.find(
          (allocationSetting) => allocationSetting.tierNumber === e.tierNumber,
        ).allocationPercent *
          totalSold) /
        100;
      return {
        tierNumber: e.tierNumber,
        name: e.name,
        stakingPeriod: e.stakingPeriod,
        stakingQuantity: e.stakingQuantity,
        noOfWallet: 0,
        allocationEachUser: 0,
        supply,
        eachUserUSDT: 0,
        fnftBalance: '0',
        claim: '0',
      };
    });
    const resultUsers = await Promise.all(
      userInfos.map(async (user) => {
        user.tier = await this.getTierUser(user, tier, purchaseStartTime);
        const indexTier = tierCalc.findIndex((e) => e.tierNumber === user.tier);
        if (indexTier !== -1) tierCalc[indexTier].noOfWallet += 1;
        return user;
      }),
    );

    //update
    const tierUpdateAllocation = tierCalc.map((tierC) => {
      if (tierC.noOfWallet && tierC.supply) {
        tierC.allocationEachUser = parseFloat(
          new BigNumber(tierC.supply)
            .dividedBy(new BigNumber(tierC.noOfWallet))
            .toFixed(8, 1),
        );
        tierC.eachUserUSDT = parseFloat(
          new BigNumber(tierC.allocationEachUser)
            .multipliedBy(new BigNumber(exchangeRates))
            .toFixed(8, 1),
        );
      }
      return tierC;
    });
    const resultUser = resultUsers.map((e) => {
      if (e.tier == null) {
        return e;
      }
      const tierInfor = tierUpdateAllocation.find(
        (tier) => tier.tierNumber === e.tier,
      );
      return {
        address: e.address,
        tier: tierInfor.tierNumber,
        tierName: tierInfor.name,
        allocationEachUser: tierInfor.allocationEachUser,
        eachUserUSDT: tierInfor.eachUserUSDT,
        remaining: tierInfor.eachUserUSDT,
        claim: '0',
        fnftBalance: '0',
      };
    });
    return { resultUser, tierCalc: tierUpdateAllocation };
  }

  async updateFNFTPoolOnChain(
    poolId: string,
    admin: any,
    data: UpdateFNFTPoolOnChainDTO,
    file: Express.Multer.File,
    poolVideo: Express.Multer.File,
  ) {
    const fNFTPool = await this.fnftPoolModel.findById(poolId);
    if (!fNFTPool) {
      throw POOL_NFT_MESSAGE.POOL_NOT_EXIST;
    }

    if (fNFTPool.poolType === TYPE_POOL.DRAFT) {
      throw new ErrorDetail(
        POOL_NFT_MESSAGE.VALIDATE_UPDATE_POOL_ON_CHAIN_ERROR,
        [POOL_NFT_MESSAGE.INVALID_STATUS],
      );
    }

    const validateData =
      await this.fNFTPoolValidator.validateDataUpdatePoolOnChain(
        data,
        file,
        poolVideo,
        fNFTPool,
      );
    if (!validateData.isValid) {
      throw new ErrorDetail(
        POOL_NFT_MESSAGE.VALIDATE_UPDATE_POOL_DRAFT_ERROR,
        validateData.errors,
      );
    }

    const fNFTData: FNFTPool = {
      poolName: JSON.parse(data.poolName),
      poolDescription: data?.poolDescription
        ? JSON.parse(data?.poolDescription)
        : '',
      status: data.status,
      isFCFS: data.isFCFS,
      whitelistURL: data.whitelistURL,
      whitelistAnnouncementTime: data.whitelistAnnouncementTime
        ? new Date(data.whitelistAnnouncementTime)
        : null,
      seriesId: data?.seriesId || null,
      pathId: data?.pathId || null,
      timelines: JSON.parse(data.timelines),
      step: data.step || fNFTPool.step,
      updatedBy: admin.address,
    };
    let users = JSON.parse(data.users);
    if (users.length > 0) {
      fNFTData.users = users;
    }
    // case FCFS:
    // update (remaining, fnftBalance, claim) for whiteList
    // when purchase start time > current time; pool has user in whitelist and no user has field fnftBalance
    const needUpdateWhiteList = (function hasFnftBalance() {
      let check = false;
      if (fNFTData?.users?.length) {
        fNFTData.users.forEach((user) => {
          if (user?.fnftBalance === undefined) {
            check = true;
          }
        });
      }
      return check;
    })();
    if (data.isFCFS && data.allocationFCFS) {
      fNFTData.allocationFCFS = data.allocationFCFS;
      if (fNFTPool.purchaseStartTime > new Date() || needUpdateWhiteList) {
        users = this.updateWhiteListWhenUpdatePoolFCFS(
          users,
          data.allocationFCFS,
          fNFTPool.fNFT.exchangeRates,
        );
        fNFTData.users = users;
      }
    }
    if (data.allocationSettings) {
      fNFTData.allocationSettings = JSON.parse(data.allocationSettings);
    }
    if (data.configWhitelist && JSON.parse(data.configWhitelist).length > 0) {
      fNFTData.configWhitelist = JSON.parse(data.configWhitelist);
    }
    if (data.productionPeriodStartTime) {
      fNFTData.productionPeriodStartTime = new Date(
        data.productionPeriodStartTime,
      );
    }
    if (data.productionPeriodEndTime) {
      fNFTData.productionPeriodEndTime = new Date(data.productionPeriodEndTime);
    }
    if (data.startTimelines) {
      fNFTData.startTimelines = JSON.parse(data.startTimelines);
      if (JSON.parse(data.startTimelines)?.length) {
        fNFTData.step = this.updateStepProduction(
          JSON.parse(data.startTimelines),
        );
      }
    }
    if (file) {
      const resUpload = await this.uploadService.uploadFileS3(
        file,
        process.env.AWS_FOLDER_IMAGES,
      );
      if (resUpload.code === API_SUCCESS) {
        fNFTData.poolImage = resUpload.data;
      } else {
        throw new ErrorDetail(POOL_NFT_MESSAGE.UPLOAD_FAIL, [
          POOL_NFT_MESSAGE.UPLOAD_FAIL,
        ]);
      }
    } else {
      fNFTData.poolImage = fNFTPool.poolImage;
    }

    if (poolVideo) {
      const resUploadVideo = await this.uploadService.uploadFileS3(
        poolVideo,
        process.env.AWS_FOLDER_VIDEOS,
      );
      if (resUploadVideo.code === API_SUCCESS) {
        fNFTData.poolVideo = resUploadVideo.data;
      } else {
        throw new ErrorDetail(POOL_NFT_MESSAGE.UPLOAD_FAIL, [
          POOL_NFT_MESSAGE.UPLOAD_FAIL,
        ]);
      }
    } else {
      fNFTData.poolVideo = fNFTPool.poolVideo;
    }

    return await this.fnftPoolModel.findOneAndUpdate(
      { _id: poolId },
      fNFTData,
      { new: true },
    );
  }

  async staking(stakingInfo: StakingInfo) {
    const user = await this.userModel.findOne({
      address: stakingInfo.userAddress,
    });
    if (user?.joinDate == null) {
      await this.userModel.updateOne(
        { _id: user._id },
        {
          joinDate: new Date(),
        },
      );
    }
    const balance = await this.getCurrentBalance(stakingInfo.userAddress);
    let newBalance = stakingInfo.balance;
    if (balance) {
      newBalance = new BigNumber(stakingInfo.balance)
        .plus(new BigNumber(balance))
        .toString();
    }
    return await this.stakingHistoryModel.create({
      userAddress: stakingInfo.userAddress,
      balance: newBalance,
      value: stakingInfo.balance,
      type: STAKING_TYPE.STAKING,
    });
  }
  async unStaking(stakingInfo: StakingInfo) {
    const balance = await this.getCurrentBalance(stakingInfo.userAddress);
    let newBalance;
    if (
      balance &&
      new BigNumber(balance)
        .minus(new BigNumber(stakingInfo.balance))
        .comparedTo(0)
    ) {
      newBalance = new BigNumber(balance).minus(stakingInfo.balance);
    }
    return await this.stakingHistoryModel.create({
      userAddress: stakingInfo.userAddress,
      balance: newBalance,
      value: stakingInfo.balance,
      type: STAKING_TYPE.UNSTAKING,
    });
  }
  // update code to test
  async getMinBalance(purchaseStartTime, userAddress, tier) {
    const minBalance = await this.stakingHistoryModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sub(purchaseStartTime, { minutes: tier.stakingPeriod }),
          },
          userAddress,
        },
      },
      {
        $group: {
          _id: '$userAddress',
          doc: {
            $min: {
              balance: '$balance',
              userAddress: '$userAddress',
              createdAt: '$createdAt',
              id: '$_id',
            },
          },
          items: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$doc',
        },
      },
    ]);
    // update code to test
    const hasPreTransaction = await this.stakingHistoryModel.aggregate([
      {
        $match: {
          createdAt: {
            $lte: sub(purchaseStartTime, { minutes: tier.stakingPeriod }),
          },
          userAddress,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return { history: minBalance[0], hasPreTransaction: hasPreTransaction[0] };
  }

  async getCurrentBalance(userAddress) {
    const currentBalance = await this.stakingHistoryModel.find(
      {
        userAddress,
      },
      null,
      { sort: { createdAt: -1 }, limit: 1 },
    );
    return currentBalance[0]?.balance;
  }

  async checkTier(purchaseStartTime, userAddress, tier) {
    const minBalance = await this.getMinBalance(
      purchaseStartTime,
      userAddress,
      tier,
    );
    if (!minBalance.history?.balance) {
      const balance = await this.getCurrentBalance(userAddress);
      if (balance >= tier.stakingQuantity) {
        return true;
      }
      return false;
    }
    if (
      minBalance.history.balance >= tier.stakingQuantity &&
      minBalance.hasPreTransaction &&
      minBalance.hasPreTransaction?.balance >= tier.stakingQuantity
    ) {
      return true;
    }
    return false;
  }

  async updateFNFTPoolWhenMintSuccess(data, session = null) {
    const fNFT = await this.fNFTModel.findOne({
      poolId: data._poolId,
    });
    fNFT.poolType = TYPE_POOL.ONCHAIN;
    await fNFT.save({ session: session });
  }

  async getPoolDetail(poolId, req) {
    const [pool = null] = await this.fnftPoolModel.aggregate([
      {
        $match: {
          poolId: poolId,
        },
      },
      {
        $lookup: {
          from: 'Path',
          localField: 'pathId',
          foreignField: '_id',
          as: 'path',
        },
      },
      {
        $lookup: {
          from: 'Series',
          localField: 'seriesId',
          foreignField: '_id',
          as: 'series',
        },
      },
    ]);
    if (!pool) return POOL_NFT_MESSAGE.POOL_NOT_FOUND;
    const rewardPool = await this.rewardPoolModel.findOne({
      FNFTPoolId: pool.poolId,
    });
    const tiers = await this.tierModel
      .find()
      .sort({ tierNumber: SORT_AGGREGATE.ASC });
    let tierAllocation = [];
    if (!pool.isFCFS) {
      tierAllocation = pool.allocationSettings.map((allocationSetting) => {
        const tierInfo = tiers.find(
          (tier) => tier.tierNumber == allocationSetting.tierNumber,
        );
        return {
          tierName: tierInfo.name,
          ...allocationSetting,
          allocationFnfts: new BigNumber(pool.fNFT.totalSold)
            .multipliedBy(allocationSetting.allocationPercent / 100)
            .decimalPlaces(4),
        };
      });
    }
    let userInfor;
    if (req.headers.token && pool.users) {
      const { address } = await this.jwtService.verify(req.headers.token);
      userInfor = pool.users.find((user) => user.address === address);
      if (userInfor && rewardPool) {
        let remainingFNFTclaim = new BigNumber(userInfor.fnftBalance)
          .minus(
            new BigNumber(userInfor.claim).dividedBy(rewardPool.exchangeRates),
          )
          .toFixed(8, 1)
          .toString();
        if (Number(remainingFNFTclaim) <= Math.pow(10, -8)) {
          remainingFNFTclaim = '0';
        }
        userInfor.remainingFNFTclaim =
          Utils.convertNumberToNoExponents(remainingFNFTclaim);
      }
    }
    return {
      poolName: pool.poolName,
      path: pool.path[0] ? pool.path[0] : null,
      series: pool.series[0] ? pool.series[0] : null,
      poolDescription: pool.poolDescription,
      registrationStartTime: pool.registrationStartTime,
      registrationEndTime: pool.registrationEndTime,
      purchaseStartTime: pool.purchaseStartTime,
      purchaseEndTime: pool.purchaseEndTime,
      blockchainNetwork: pool.blockchainNetwork,
      acceptedCurrencySymbol: pool.acceptedCurrencySymbol,
      totalSold: new BigNumber(pool.fNFT.totalSold).decimalPlaces(4),
      tierAllocation: tierAllocation,
      batchAnalytics: {
        nftAttributes: pool.fNFT.nftAttributes,
        nftIdHash: pool.fNFT.nftIdHash,
        fNFTIdHash: pool.fNFT.fNFTIdHash,
        nftTransactionHash: pool.fNFT.nftTransactionHash,
        fNFTTransactionHash: pool.fNFT.fNFTTransactionHash,
      },
      whitelistAnnouncementTime: pool.whitelistAnnouncementTime,
      rewardPool,
      poolType: pool.poolType,
      acceptedCurrencyAddress: pool.acceptedCurrencyAddress,
      acceptedCurrencyDecimals: pool.acceptedCurrencyDecimals,
      allocationFCFS: pool.allocationFCFS,
      isFCFS: pool.isFCFS,
      bePaidGasFee: pool?.bePaidGasFee,
      status: pool.status,
      step: pool.step,
      startTimelines: pool.startTimelines,
      userInfor,
      stage: this.getStage(pool),
      target: `${new BigNumber(pool.fNFT?.exchangeRates)
        .multipliedBy(new BigNumber(pool.fNFT.totalSold))
        .toFixed(4)} ${pool.acceptedCurrencySymbol || ''}`,
      price: `${(+pool.fNFT?.exchangeRates || 0).toFixed(4)} ${
        pool.acceptedCurrencySymbol || ''
      } `,
      timelines: pool.timelines,
      productionPeriodEndTime: pool.productionPeriodEndTime,
      productionPeriodStartTime: pool.productionPeriodStartTime,
      poolTimeline: pool.step,
      fNft: pool.fNFT,
      whitelistURL: pool.whitelistURL,
      poolImage: pool.poolImage,
      poolVideo: pool.poolVideo,
      circulating:
        new BigNumber(pool.fNFT.totalSold)
          .minus(pool.fNFT.availableAmount)
          .toString() || 0,
      smartContractBalance:
        new BigNumber(pool.fNFT.totalSupply)
          .minus(new BigNumber(pool.fNFT.totalSold))
          .plus(new BigNumber(pool.fNFT.availableAmount))
          .minus(new BigNumber(pool.withdraw))
          .toString() || 0,
    };
  }
  getStage(item) {
    if (new Date(item.registrationStartTime) > new Date())
      return Stages.COMING_SOON;
    if (
      new Date() >= new Date(item.registrationStartTime) &&
      new Date() < new Date(item.registrationEndTime)
    )
      return Stages.OPENED_FOR_REGISTRATION;
    if (
      new Date() >= new Date(item.registrationEndTime) &&
      new Date() < new Date(item.purchaseStartTime)
    )
      return Stages.ON_SALE_SOON;
    if (
      new Date() >= new Date(item.purchaseStartTime) &&
      new Date() < new Date(item.purchaseEndTime)
    )
      return Stages.ON_SALE;
    if (item.rewardPool) {
      if (item.rewardStatus === RewardPoolStatus.ON) {
        if (
          new Date() >= new Date(item.purchaseEndTime) &&
          new Date() < new Date(item.poolOpenTime)
        )
          return Stages.PRODUCTION;
        if (new Date() >= new Date(item.poolOpenTime))
          return Stages.OPENED_FOR_REWARD;
      } else {
        if (new Date() > new Date(item.purchaseEndTime))
          return Stages.PRODUCTION;
      }
    } else {
      if (new Date() > new Date(item.purchaseEndTime)) return Stages.PRODUCTION;
    }
  }
  async getWhiteList(poolId, query) {
    const { page, pageSize } = query;
    const pool = await this.fnftPoolModel.findOne({ poolId: poolId });
    if (!pool) return POOL_NFT_MESSAGE.POOL_NOT_FOUND;
    const users = pool.users || [];
    if (
      !pool?.whitelistAnnouncementTime ||
      new Date() < pool.whitelistAnnouncementTime
    )
      return POOL_NFT_MESSAGE.WHITELIST_NOT_OPEN_YET;
    if (users.length === 0)
      return {
        items: 0,
        pageCurrent: page,
        totalDocs: 0,
        total: 0,
        hasPrevPage: false,
        hasNextPage: false,
      };
    let whiteList: PoolUsers[] = users;
    if (query.textSearch) {
      if (query.textSearch.trim()) {
        whiteList = users.filter((user) =>
          user.address
            .toLowerCase()
            .includes(query.textSearch.trim().toLowerCase()),
        );
      }
    }
    const totalItem = whiteList.length;
    const totalPages = Math.ceil(totalItem / pageSize);
    return {
      items: whiteList.slice(pageSize * (page - 1), pageSize * page),
      pageCurrent: page,
      totalDocs: totalItem,
      total: users.length,
      hasPrevPage: page > 1 && totalItem > 0,
      hasNextPage: page < totalPages,
    };
  }

  async updateRemain1() {
    const poolAfter = await this.fnftPoolModel.findOneAndUpdate(
      {
        poolId: 346,
        'users.address': '0xb76716Bd450bB05c41E7c017a8F9AD8E3e083b3E',
      },
      {
        $inc: { 'users.$.remainOfPurchase': -1 },
      },
    );
  }

  async updateRemain(poolId, userAddress, purchasedFNFT, purchaseId) {
    let countRetry = 0;
    while (true) {
      if (countRetry >= 10) {
        throw HttpError.error(
          HttpStatus.BAD_REQUEST,
          WEBHOOK_EXCEPTION.MAX_RETRY,
          [],
        );
      }
      const purchaseHistory = await this.purchaseModel.findOne({
        _id: ObjectID(purchaseId),
      });
      if (purchaseHistory.status === PURCHASE_STATUS.PURCHASE_SUCCESS) {
        return 'Update success';
      }
      const pool = await this.fnftPoolModel.findOne({ poolId: poolId });
      if (!pool)
        throw HttpError.error(
          HttpStatus.BAD_REQUEST,
          POOL_NFT_MESSAGE.POOL_NOT_FOUND,
          [],
        );
      // update availableAmount in pool : availableAmount - purchasedFNFT ( user purchased)
      const availableAmount = new BigNumber(pool.fNFT.availableAmount)
        .minus(
          new BigNumber(purchasedFNFT).dividedBy(
            new BigNumber(Math.pow(10, DECIMALS_DAD)),
          ),
        )
        .toString();
      const poolUser = await this.getUserPool(pool, userAddress);
      // update fnftBalance of user
      const oldFnftBalance = poolUser.fnftBalance || 0;
      const newFnftBalance = new BigNumber(oldFnftBalance)
        .plus(
          new BigNumber(purchasedFNFT).dividedBy(
            new BigNumber(Math.pow(10, DECIMALS_DAD)),
          ),
        )
        .toString();
      // update remaining amount token swap of fnft User can purchase.
      // newRemaining = oldRemaining - amount;
      const oldRemaining = poolUser.remaining;
      let newRemaining = new BigNumber(oldRemaining)
        .minus(
          new BigNumber(purchaseHistory.amount).dividedBy(
            new BigNumber(Math.pow(10, +pool.acceptedCurrencyDecimals)),
          ),
        )
        .toFixed(8, 1)
        .toString();
      // hell case
      if (Number(newRemaining) < Math.pow(10, -8)) {
        newRemaining = '0';
      }
      newRemaining = Utils.convertNumberToNoExponents(newRemaining);

      const session = await this.connection.startSession();
      session.startTransaction();
      try {
        const poolAfter = await this.fnftPoolModel.findOneAndUpdate(
          {
            poolId: poolId,
            'users.address': userAddress,
            updatedAt: pool['updatedAt'],
          },
          {
            $set: {
              'users.$.remaining': newRemaining,
              'users.$.fnftBalance': newFnftBalance,
              'fNFT.availableAmount': availableAmount,
              availableAmount: availableAmount,
            },
            $inc: { 'users.$.remainOfPurchase': -1 },
          },
          { session: session },
        );

        const purchaseStatus = await this.purchaseModel.findOneAndUpdate(
          {
            _id: ObjectID(purchaseId),
            updatedAt: purchaseHistory['updatedAt'],
          },
          {
            status: PURCHASE_STATUS.PURCHASE_SUCCESS,
          },
          { session: session },
        );
        await this.userModel.updateOne(
          {
            address: userAddress,
            joinDate: { $exists: false },
          },
          { joinDate: new Date() },
          { session: session },
        );
        if (poolAfter && purchaseStatus) {
          await session.commitTransaction();
          break;
        }
        countRetry++;
        await Utils.sleep(1000);
      } catch (error) {
        await session.abortTransaction();
      } finally {
        session.endSession();
      }
    }
  }

  async withdrawFun(poolId) {
    const pool = await this.fnftPoolModel.findOne({ poolId: poolId });
    await this.fnftPoolModel.updateOne(
      { poolId },
      {
        availableAmount: '0',
        withdraw: new BigNumber(pool.fNFT.totalSupply)
          .minus(
            new BigNumber(pool.fNFT.totalSold).minus(
              new BigNumber(pool.fNFT.availableAmount),
            ),
          )
          .toString(),
      },
    );
  }

  getUserPool(pool, userAddress) {
    return pool.users.find((user) => user.address === userAddress);
  }

  updateWhiteListWhenUpdatePoolFCFS(
    users: any[],
    allocationFCFS: string,
    exchangeRates: string,
  ) {
    if (users.length > 0) {
      return (users = users.map((obj) => ({
        ...obj,
        allocationEachUser: allocationFCFS,
        eachUserUSDT: new BigNumber(allocationFCFS)
          .multipliedBy(new BigNumber(exchangeRates))
          .toFixed(8, 1)
          .toString(),
        fnftBalance: '0',
        claim: '0',
        remaining: new BigNumber(allocationFCFS)
          .multipliedBy(new BigNumber(exchangeRates))
          .toFixed(8, 1)
          .toString(),
      })));
    }
    return [];
  }

  private updateRemainOfPurchasePoolGasLess(
    users: any[],
    limitpurchase: number,
  ) {
    if (users.length > 0) {
      return (users = users.map((user) => ({
        ...user,
        remainOfPurchase: limitpurchase,
      })));
    }
    return [];
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

  async updateFNFTPoolWhenMintSuccessAPI(data, admin) {
    const fNFT = await this.fNFTModel.findOne({
      poolId: data._poolId,
    });
    fNFT.poolType = TYPE_POOL.ONCHAIN;
    fNFT.mintedBy = admin.address;
    fNFT.mintedOn = new Date();
    await fNFT.save();
  }

  async getAdminHandle(address: string) {
    const admin = await this.userModel.findOne({ address: address }).lean();
    return { address: admin?.address, username: admin?.username };
  }

  async analysisUsersPurchased(
    poolId: number,
    query: FilterPurchasedUserDetails,
  ) {
    const purchased = await this.fnftPoolModel.aggregate([
      {
        $match: { poolId: poolId },
      },

      { $addFields: { FNFTSymbol: '$fNFT.fNFTSymbol' } },
      { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
      { $match: { 'users.fnftBalance': { $nin: ['0', null] } } },
      { $unwind: { path: '$FNFTPool', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          fnftSymbol: { $first: '$FNFTSymbol' },
          users: { $push: '$users' },
        },
      },
    ]);
    const fnftSymbol = purchased[0].fnftSymbol;
    const analysis = purchased[0].users;
    let users = [];
    for (const user of analysis) {
      users.push({
        _id: await this.getIdUser(user.address),
        address: user.address,
        fnftSymbol: fnftSymbol,
        purchased: parseFloat(user.fnftBalance),
        claimed: null,
        claimable: null,
        unclaimed: null,
      });
    }

    const { page, pageSize } = query;
    if (users.length === 0)
      return {
        items: 0,
        pageCurrent: page,
        totalDocs: 0,
        total: 0,
        hasPrevPage: false,
        hasNextPage: false,
      };
    const { sortType, sortField } = query;
    if (sortField && sortType) {
      users = _.orderBy(users, [sortField], [sortType]);
    }
    if (query.textSearch) {
      if (query.textSearch.trim()) {
        users = users.filter((user) =>
          user.address
            .toLowerCase()
            .includes(query.textSearch.trim().toLowerCase()),
        );
      }
    }
    const totalItem = users.length;
    const totalPages = Math.ceil(totalItem / pageSize);
    return {
      items: users.slice(pageSize * (page - 1), pageSize * page),
      pageCurrent: page,
      totalDocs: totalItem,
      total: users.length,
      hasPrevPage: page > 1 && totalItem > 0,
      hasNextPage: page < totalPages,
    };
  }

  async getIdUser(address: string) {
    return await (
      await this.userModel.findOne({ address: address }).lean()
    )._id;
  }
}
