import { FNFTPool, FNFTPoolDocument } from '~/schemas';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pagination } from '../common/interface';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import {
  PURCHASE_STATUS,
  sortType,
  SORT_AGGREGATE,
  USER_NOT_FOUND,
} from '../common/constants';
import { Utils } from '../common/utils';
import {
  HistoryStaking,
  HistoryStakingDocument,
} from '../schemas/staking-history.schema';
import { sub } from 'date-fns';
import { isMongoId } from 'class-validator';
import { PurchaseFNFT, PurchaseFNFTDocument } from '../schemas';
import { PipelineStage } from 'mongoose';
import { AnalysisUserDetail } from './dto/get-user-management.dto';
@Injectable()
export class UserManagementService {
  constructor(
    @InjectModel(User.name)
    private userStakingPoolModel: Model<UserDocument>,
    @InjectModel(PurchaseFNFT.name)
    private historyPurchaseModel: Model<PurchaseFNFTDocument>,
    @InjectModel(HistoryStaking.name)
    private historyStakingModel: Model<HistoryStakingDocument>,
    @InjectModel(FNFTPool.name)
    private fnftPoolModel: Model<FNFTPoolDocument>,
  ) {}

  async findAll(getParams): Promise<Pagination<User[]>> {
    const { page, pageSize } = getParams;
    const sort: Record<string, any> = {};
    if (getParams.sortField) {
      sort[getParams.sortField] =
        SORT_AGGREGATE[
          getParams.sortType
            ? getParams.sortType.toUpperCase()
            : sortType.asc.toUpperCase()
        ];
    } else {
      sort.joinDate = SORT_AGGREGATE.DESC;
    }

    const match: Record<string, any> = {
      joinDate: { $ne: null },
      role: UserRole.USER,
    };
    if (getParams.textSearch) {
      if (getParams.textSearch.trim()) {
        match.$or = [
          { address: Utils.queryInsensitive(getParams.textSearch.trim()) },
          {
            _id: getParams.textSearch.trim(),
          },
        ];
      }
    }

    const pipeline: PipelineStage[] = [];
    pipeline.push({ $match: match });
    pipeline.push({
      $lookup: {
        from: 'PurchaseFNFT',
        let: { id: '$address' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$userWalletAddress', '$$id'] },
              status: PURCHASE_STATUS.PURCHASE_SUCCESS,
            },
          },
          { $group: { _id: '$poolId' } },
          {
            $project: {
              _id: 1,
            },
          },
        ],
        as: 'purchase',
      },
    });

    const $facet: any = {
      pageInfo: [{ $count: 'totalItem' }],
      items: [
        { $sort: sort },
        { $skip: page <= 1 ? 0 : (page - 1) * pageSize },
        { $limit: pageSize },
      ],
    };

    pipeline.push({
      $project: {
        _id: 1,
        balance: 1,
        joinDate: 1,
        address: 1,
        username: 1,
        status: 1,
        noOfPool: { $size: '$purchase' },
      },
    });
    if (Object.values(sort).length) {
      pipeline.push({ $sort: sort });
      $facet.items.push({ $sort: sort });
      pipeline.push({ $facet });
    } else {
      pipeline.push({ $facet });
    }
    const items = await this.userStakingPoolModel
      .aggregate(pipeline)
      .collation({ locale: 'en_US', strength: 1 });
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
      const [pageInfo] = result.pageInfo;

      const totalItem = pageInfo?.totalItem;
      const totalPages = Math.ceil(totalItem / pageSize);
      return {
        items: result.items,
        pageCurrent: page,
        totalDocs: totalItem,
        hasPrevPage: page > 1 && totalItem > 0,
        hasNextPage: page < totalPages,
      };
    }
  }

  async findOne(id: string) {
    const user = await this.userStakingPoolModel.findOne({
      _id: id,
      role: UserRole.USER,
    });
    if (user == null) return USER_NOT_FOUND;
    const activeLogs = await this.historyStakingModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sub(new Date(), { days: 90 }),
          },
          userAddress: user.address,
        },
      },
    ]);
    const purchaseLogs = await this.historyPurchaseModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sub(new Date(), { days: 90 }),
          },
          userWalletAddress: user.address,
          status: PURCHASE_STATUS.PURCHASE_SUCCESS,
        },
      },
      {
        $lookup: {
          from: 'FNFTPool',
          let: { id: '$poolId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$poolId', '$$id'] } } },
            { $addFields: { fNFTSymbol: '$fNFT.fNFTSymbol' } },
            { $addFields: { exchangeRates: '$fNFT.exchangeRates' } },
            {
              $project: {
                _id: 0,
                fNFTSymbol: 1,
                exchangeRates: 1,
                acceptedCurrencySymbol: 1,
              },
            },
          ],
          as: 'FNFTPool',
        },
      },
      { $unwind: '$FNFTPool' },
      { $addFields: { fNFTSymbol: '$FNFTPool.fNFTSymbol' } },
      {
        $addFields: {
          acceptedCurrencySymbol: '$FNFTPool.acceptedCurrencySymbol',
        },
      },
      { $addFields: { exchageRates: '$FNFTPool.exchangeRates' } },
      {
        $addFields: {
          amountUSDT: {
            $divide: [
              {
                $toDouble: '$amount',
              },
              { $pow: [10, { $toDouble: '$decimals' }] },
            ],
          },
        },
      },
      {
        $addFields: {
          allocationUSDT: {
            $multiply: [
              { $toDouble: '$allocation' },
              { $toDouble: '$exchageRates' },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          userWalletAddress: 1,
          poolId: 1,
          poolName: 1,
          allocation: 1, // fnft toi da co the mua
          allocationUSDT: 1, // so tien toi da mua fnt do
          createdAt: 1,
          amountUSDT: 1, // so tien bo ra mua FNFT
          acceptedCurrencySymbol: 1,
        },
      },
    ]);
    const totalPool = await this.historyPurchaseModel.aggregate([
      { $match: { userWalletAddress: user.address } },
      {
        $group: {
          _id: '$poolId',
        },
      },
    ]);
    return {
      activeLogs,
      purchaseLogs,
      address: user.address,
      balance: user.balance ? user.balance : 0,
      joinDate: user.joinDate ? user.joinDate : null,
      participatedIn: totalPool.length,
    };
  }

  async analysisUser(id: string, query: AnalysisUserDetail) {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const user = await this.userStakingPoolModel.findOne({
      _id: id,
      role: UserRole.USER,
    });
    const poolUserPurchase = await this.historyPurchaseModel.aggregate([
      {
        $match: {
          userWalletAddress: user.address,
          status: PURCHASE_STATUS.PURCHASE_SUCCESS,
        },
      },
      {
        $group: {
          _id: '$poolId',
        },
      },
      { $project: { _id: 1 } },
    ]);

    const poolParticipatedIn = poolUserPurchase.map((pool) => pool._id);

    const pool = await this.fnftPoolModel.aggregate([
      {
        $match: {
          'users.address': user.address,
          poolId: { $in: poolParticipatedIn },
        },
      },
      {
        $set: {
          user: {
            $filter: {
              input: '$users',
              as: 'users',
              cond: { $eq: ['$$users.address', user.address] },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'RewardPool',
          let: { id: '$poolId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$FNFTPoolId', '$$id'] } } },
            {
              $project: {
                currencySymbol: 1,
                exchangeRates: 1,
                _id: 1,
                name: 1,
              },
            },
          ],
          as: 'rewardPool',
        },
      },
      { $unwind: { path: '$rewardPool', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          fNFTSymbol: '$fNFT.fNFTSymbol',
          exchangeRates: '$fNFT.exchangeRates',
          purchased: { $toDouble: '$user.fnftBalance' },
          claimed: { $toDouble: '$user.claim' },
          exchangeRatesReward: { $toDouble: '$rewardPool.exchangeRates' },
          currencySymbol: {
            $cond: {
              if: {
                $ne: ['$exchangeRatesReward', null],
              },
              then: '$rewardPool.currencySymbol',
              else: null,
            },
          },
        },
      },
      {
        $addFields: {
          purchasedUSDT: {
            $multiply: ['$purchased', { $toDouble: '$exchangeRates' }],
          },
        },
      },
      {
        $addFields: {
          claimable: {
            $cond: {
              if: {
                $ne: ['$exchangeRatesReward', null],
              },
              then: { $multiply: ['$purchased', '$exchangeRatesReward'] },
              else: null,
            },
          },
        },
      },
      {
        $addFields: {
          unclaimed: {
            $cond: {
              if: {
                $ne: ['$exchangeRatesReward', null],
              },
              then: { $subtract: ['$claimable', '$claimed'] },
              else: null,
            },
          },
        },
      },
      {
        $project: {
          poolId: 1,
          poolName: 1,
          rewardPool: 1,
          acceptedCurrencySymbol: 1,
          currencySymbol: 1,
          purchased: 1,
          purchasedUSDT: 1,
          claimed: 1,
          claimable: 1,
          unclaimed: 1,
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ]);
    const data = { participatedId: poolParticipatedIn.length, docs: pool };
    return data;
  }
}
