import { HttpStatus, Injectable } from '@nestjs/common';
import { Model, PipelineStage } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { Utils } from 'src/common/utils';
import {
  FNFTPool,
  FNFTPoolDocument,
  HistoryReport,
  HistoryReportDocument,
  HistoryStaking,
  HistoryStakingDocument,
  Path,
  PathDocument,
  Serial,
  Stages,
  User,
  UserDocument,
  UserRole,
} from '~/schemas';
import {
  F_NFT_POOL_STATUS,
  RewardPoolStatus,
  SORT_AGGREGATE,
  SORT_DESC,
} from '~/common/constants';
import { HomeFNFTSearchDto, HomeUserSearchDto } from './dto/home-user.dto';
import ObjectID from 'bson-objectid';
import BigNumber from 'bignumber.js';
import { JwtService } from '@nestjs/jwt';
import { SeriesService } from '~/series/series.service';
import { HttpError } from '~/common/responses/api-errors';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Path.name) private path: Model<PathDocument>,
    @InjectModel(HistoryReport.name)
    private historyReport: Model<HistoryReportDocument>,
    @InjectModel(FNFTPool.name)
    private fNFTPoolModel: Model<FNFTPoolDocument>,
    private readonly jwtService: JwtService,
    private readonly seriesService: SeriesService,
    @InjectModel(HistoryStaking.name)
    private historyStakingModel: Model<HistoryStakingDocument>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  findAll(requestData: SearchUserDto) {
    const match = {};
    if (requestData.keyword) {
      match['$or'] = [
        { address: { $regex: requestData.keyword, $options: 'i' } },
      ];
    }
    return Utils.paginate(this.userModel, match, requestData);
  }

  findByAddress(address: string) {
    return this.userModel.findOne({ address });
  }

  async home(params: HomeUserSearchDto) {
    const { serialId, pathId } = params;
    let idSeriesOn = await this.seriesService.findAllSeriesUser({});
    idSeriesOn = idSeriesOn.map(({ _id }) => _id);
    const filterCommon = {
      status: F_NFT_POOL_STATUS.ON,
      ...(serialId
        ? { seriesId: { $in: [new ObjectID(serialId)] } }
        : { seriesId: { $in: [...idSeriesOn] } }),
      ...(pathId ? { pathId: { $in: [new ObjectID(pathId)] } } : {}),
    };
    const sectionRN = await this.fNFTPoolModel
      .find({
        registrationStartTime: { $lte: new Date() },
        registrationEndTime: { $gt: new Date() },
        ...filterCommon,
      })
      .sort({ registrationEndTime: SORT_DESC });
    const sectionOS = await this.fNFTPoolModel
      .find({
        purchaseEndTime: { $gte: new Date() },
        purchaseStartTime: { $lte: new Date() },
        ...filterCommon,
      })
      .sort({ purchaseEndTime: SORT_DESC });
    const sectionCS = await this.fNFTPoolModel
      .find({
        registrationStartTime: { $gte: new Date() },
        ...filterCommon,
      })
      .sort({ registrationStartTime: SORT_DESC });

    const sectionOSS = await this.fNFTPoolModel
      .find({
        registrationEndTime: { $lte: new Date() },
        purchaseStartTime: { $gte: new Date() },
        ...filterCommon,
      })
      .sort({ purchaseStartTime: SORT_DESC });

    const sectionCompleted = await this.fNFTPoolModel
      .aggregate([
        {
          $lookup: {
            from: 'RewardPool',
            as: 'rewardPool',
            localField: 'rewardId',
            foreignField: 'rewardPoolId',
          },
        },
        { $unwind: { path: '$rewardPool', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            rewardStatus: '$rewardPool.status',
            rewardOpenTime: '$rewardPool.poolOpenTime',
          },
        },
        {
          $match: {
            purchaseEndTime: { $lt: new Date() },
            ...filterCommon,
          },
        },
      ])
      .sort({ purchaseEndTime: SORT_DESC })
      .limit(10);
    return {
      registerNow: sectionRN,
      onSale: sectionOS,
      onSaleSoon: sectionOSS,
      comingSoon: sectionCS,
      completed: this.filterStage(sectionCompleted),
    };
  }

  async getPaths() {
    return this.path.find();
  }

  private _getConditionByStage(stage: Stages) {
    switch (stage) {
      case Stages.OPENED_FOR_REGISTRATION:
        return {
          registrationStartTime: { $lte: new Date() },
          registrationEndTime: { $gt: new Date() },
        };
      case Stages.ON_SALE:
        return {
          purchaseStartTime: { $lte: new Date() },
          purchaseEndTime: { $gt: new Date() },
        };
      case Stages.COMING_SOON:
        return {
          registrationStartTime: { $gte: new Date() },
        };
      case Stages.ON_SALE_SOON:
        return {
          registrationEndTime: { $lte: new Date() },
          purchaseStartTime: { $gt: new Date() },
        };
      case Stages.PRODUCTION:
        return {
          $and: [
            {
              $or: [
                {
                  rewardStatus: RewardPoolStatus.ON,
                  rewardOpenTime: { $gt: new Date() },
                  purchaseEndTime: { $lt: new Date() },
                },
                {
                  rewardStatus: RewardPoolStatus.OFF,
                  purchaseEndTime: { $lt: new Date() },
                },
                {
                  rewardStatus: RewardPoolStatus.OFF,
                  purchaseEndTime: { $lt: new Date() },
                  rewardOpenTime: { $lt: new Date() },
                },
                {
                  rewardOpenTime: null,
                  purchaseEndTime: { $lt: new Date() },
                },
              ],
            },
          ],
        };
      case Stages.OPENED_FOR_REWARD:
        return {
          rewardStatus: RewardPoolStatus.ON,
          rewardOpenTime: { $lt: new Date() },
        };
    }
  }

  async _getConditionsFNFTPools(filter: HomeFNFTSearchDto, req) {
    const { page, pageSize: limit } = filter;
    let match: Record<string, any> = { status: F_NFT_POOL_STATUS.ON };
    let idSeriesOn = await this.seriesService.findAllSeriesUser({});
    idSeriesOn = idSeriesOn.map(({ _id }) => _id);
    // check if API get myFNFTPools, get all pools not in stage COMING_SOON, OPENED_FOR_REGISTRATION
    if (filter.isMyFNFTPool) {
      match = {
        registrationEndTime: { $lte: new Date() },
        whitelistAnnouncementTime: { $lte: new Date() },
      };
    }
    const sort: Record<string, any> = {};
    if (filter?.keyword) {
      const textSearch = filter.keyword.trim();
      if (!filter.isMyFNFTPool) {
        Object.assign(match, {
          ...match,
          $or: [
            {
              'poolName.en': {
                $regex: Utils.escapeRegex(textSearch),
                $options: 'i',
              },
            },
            {
              'poolName.jp': {
                $regex: Utils.escapeRegex(textSearch),
                $options: 'i',
              },
            },
            {
              'poolName.cn': {
                $regex: Utils.escapeRegex(textSearch),
                $options: 'i',
              },
            },
          ],
        });

        if (Number.isSafeInteger(+textSearch)) {
          match.$or.push({ poolId: +textSearch });
        }
      } else {
        Object.assign(match, {
          ...match,
          $and: [
            {
              $or: [
                {
                  'poolName.en': {
                    $regex: Utils.escapeRegex(textSearch),
                    $options: 'i',
                  },
                },
                {
                  'poolName.jp': {
                    $regex: Utils.escapeRegex(textSearch),
                    $options: 'i',
                  },
                },
                {
                  'poolName.cn': {
                    $regex: Utils.escapeRegex(textSearch),
                    $options: 'i',
                  },
                },
              ],
            },
          ],
        });
        if (Number.isSafeInteger(+textSearch)) {
          match['$and'][0]['$or'].push({ poolId: +textSearch });
        }
      }
    }
    const pipeline: PipelineStage[] = [];
    if (req.headers.token) {
      const { address } = await this.jwtService.verify(req.headers.token);
      Object.assign(match, {
        ...match,
        'users.address': address,
      });
      pipeline.push({
        $set: {
          users: {
            $filter: {
              input: '$users',
              as: 'users',
              cond: { $eq: ['$$users.address', address] },
            },
          },
        },
      });
      match['$or'] = [
        { purchaseEndTime: { $gte: new Date() } },
        {
          $and: [
            { purchaseEndTime: { $lte: new Date() } },
            { $expr: { $ne: [{ $first: '$users.fnftBalance' }, '0'] } },
          ],
        },
      ];
    }
    if (filter.hasOwnProperty('stage')) {
      Object.assign(match, {
        ...match,
        ...this._getConditionByStage(filter.stage),
      });
    }
    if (filter.pathId) {
      Object.assign(match, {
        ...match,
        pathId: { $in: [new ObjectID(filter.pathId)] },
      });
    }
    if (filter.isFCFS != null) {
      Object.assign(match, {
        ...match,
        isFCFS: filter.isFCFS,
      });
    }
    if (filter.seriesId) {
      Object.assign(match, {
        ...match,
        seriesId: { $in: [new ObjectID(filter.seriesId)] },
      });
    } else if (!filter.isMyFNFTPool) {
      Object.assign(match, {
        ...match,
        seriesId: { $in: [...idSeriesOn] },
      });
    }
    sort['createdAt'] = SORT_AGGREGATE.DESC;
    pipeline.push(
      {
        $lookup: {
          from: 'Series',
          as: Serial.name.toLowerCase(),
          localField: 'seriesId',
          foreignField: '_id',
        },
      },
      {
        $lookup: {
          from: 'Path',
          as: Path.name.toLowerCase(),
          localField: 'pathId',
          foreignField: '_id',
        },
      },
      {
        $lookup: {
          from: 'RewardPool',
          as: 'rewardPool',
          localField: 'rewardId',
          foreignField: 'rewardPoolId',
        },
      },
      { $unwind: { path: '$rewardPool', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$serial', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$path', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          rewardStatus: '$rewardPool.status',
          rewardOpenTime: '$rewardPool.poolOpenTime',
          poolTimeline: '$step',
        },
      },
      {
        $match: match,
      },
    );
    const $facet: any = {
      pageInfo: [{ $count: 'totalItem' }],
      items: [{ $skip: page <= 1 ? 0 : (page - 1) * limit }, { $limit: limit }],
    };
    if (Object.values(sort).length) {
      pipeline.push({ $sort: sort });
      $facet.items.push({ $sort: sort });
      pipeline.push({ $facet });
    } else {
      pipeline.push({ $facet });
    }
    return pipeline;
  }

  async getAllFNFTPools(filter: HomeFNFTSearchDto, req) {
    const { page, pageSize: limit } = filter;
    const pipeline = await this._getConditionsFNFTPools(filter, req);
    const items = await this.fNFTPoolModel.aggregate(pipeline);
    if (!items.length) {
      return {
        items: [],
        pageCurrent: page,
        totalDocs: 0,
        hasPrevPage: false,
        hasNextPage: false,
      };
    } else {
      const [result] = items;
      const {
        pageInfo: [pageInfo],
      } = result;

      const totalItem = pageInfo?.totalItem;
      const totalPages = Math.ceil(totalItem / limit);

      return {
        items: this.filterStage(result.items),
        pageCurrent: page,
        totalDocs: totalItem,
        hasPrevPage: page > 1 && totalItem > 0,
        hasNextPage: page < totalPages,
      };
    }
  }

  addClaimField(users, rewardPool, pool) {
    if (users) {
      return users.map((user) => {
        const myClaimableRewards = new BigNumber(user.fnftBalance)
          .multipliedBy(rewardPool?.exchangeRates)
          .toString();
        const funds = new BigNumber(user.fnftBalance)
          .multipliedBy(pool.fNFT?.exchangeRates)
          .toString();
        return {
          ...user,
          myClaimableRewards:
            myClaimableRewards == 'NaN' ? 0 : myClaimableRewards,
          funds: funds == 'NaN' ? 0 : funds,
        };
      });
    }
    return [];
  }

  async getHistoryReport() {
    return this.historyReport.find();
  }

  filterStage(items) {
    return items.map((item) => {
      return {
        ...item,
        users: this.addClaimField(item.users, item.rewardPool, item),
        stage: this.getStage(item),
        openDate: item.purchaseStartTime ? item.purchaseStartTime : 'TBA',
        target: new BigNumber(item.fNFT?.exchangeRates)
          .multipliedBy(new BigNumber(item.fNFT.totalSold))
          .toString(),
        price: item.fNFT?.exchangeRates || 0,
      };
    });
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
          new Date() < new Date(item.rewardOpenTime)
        )
          return Stages.PRODUCTION;
        if (new Date() >= new Date(item.rewardOpenTime))
          return Stages.OPENED_FOR_REWARD;
      } else {
        if (new Date() > new Date(item.purchaseEndTime))
          return Stages.PRODUCTION;
      }
    } else {
      if (new Date() > new Date(item.purchaseEndTime)) return Stages.PRODUCTION;
    }
  }

  async getStakingHistory(userAddress: string) {
    const user = await this.userModel.findOne({
      role: UserRole.USER,
      address: userAddress,
    });
    if (user == null) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        'User not found in staking history',
        ['User not found in staking history'],
      );
    }
    const activeLogs = await this.historyStakingModel.aggregate([
      {
        $match: {
          userAddress: user.address,
        },
      },
      {
        $group: {
          _id: userAddress,
          lastBalance: { $last: '$balance' },
          lastUpdate: { $last: '$updatedAt' },
          stakingHistory: { $push: '$$ROOT' },
        },
      },
    ]);
    return activeLogs;
  }
}
