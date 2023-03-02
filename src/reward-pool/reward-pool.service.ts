import mongoose, { Model, PipelineStage } from 'mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import BigNumber from 'bignumber.js';
import {
  FNFTPool,
  FNFTPoolDocument,
  RewardPool,
  RewardPoolDocument,
  User,
  UserDocument,
} from '~/schemas';
import {
  CreateRewardPoolDto,
  FilterRewardUserDetails,
  RewardPoolFilterDto,
  UpdateRewardPoolDto,
} from './dto/reward-pool.dto';
import {
  API_SUCCESS,
  CommonCode,
  POOL_NFT_MESSAGE,
  RewardPoolMintStatus,
  SORT_AGGREGATE,
} from '~/common/constants';
import { Utils } from '~/common/utils';
import { ValidateAddressWalletService } from '~/common/services/validate-wallet-address.service';
import { Web3Error } from '~/common/interface';
import { IdPool, IdPoolDocument } from '../schemas/idPool.schema';
import { CommonService } from '~/common-service/common.service';
import ObjectID from 'bson-objectid';
import { HttpError } from '~/common/responses/api-errors';
const _ = require('lodash');

@Injectable()
export class RewardPoolService {
  constructor(
    @InjectModel(RewardPool.name)
    private rewardPoolModel: Model<RewardPoolDocument>,
    @InjectModel(FNFTPool.name)
    private fNFTPoolDocument: Model<FNFTPoolDocument>,
    private validateAddressWalletService: ValidateAddressWalletService,
    @InjectModel(IdPool.name)
    private idPoolModel: Model<IdPoolDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private commonService: CommonService,
  ) {}
  async create(params: CreateRewardPoolDto, admin: any) {
    const { FNFTPoolId } = params;
    const fNFTPool = await this.fNFTPoolDocument.findOne({
      poolId: FNFTPoolId,
    });
    if (
      new BigNumber(fNFTPool.fNFT.totalSold).isLessThanOrEqualTo(
        new BigNumber(fNFTPool.fNFT.availableAmount),
      )
    )
      return POOL_NFT_MESSAGE.REWARD_POOL_NOT_SALE_SUCCESS;
    if (!fNFTPool) {
      return POOL_NFT_MESSAGE.POOL_NOT_FOUND;
    }
    const isReward = await this.rewardPoolModel.findOne({
      FNFTPoolId: FNFTPoolId,
      mintStatus: RewardPoolMintStatus.DONE,
    });
    if (isReward) return POOL_NFT_MESSAGE.FNFT_POOL_EXIST_REWARD_POOL;
    if (new Date(fNFTPool.purchaseEndTime) >= new Date(params.poolOpenTime)) {
      return POOL_NFT_MESSAGE.E26;
    }

    try {
      const { tokenContractAddress, currencySymbol } = params;
      const { message } =
        await this.validateAddressWalletService.isTokenAddress(
          tokenContractAddress,
          currencySymbol,
        );
      if (message) {
        return message;
      }
    } catch (error) {
      if (error?.message) {
        const web3Error = new Web3Error();
        web3Error.message = error?.message || '';
        web3Error.code = CommonCode.WEB3_ERROR;
        return web3Error;
      }

      throw error;
    }
    const data = {
      name: params.name,
      total: params.total,
      status: params.status,
      tokenContractAddress: params.tokenContractAddress,
      currencySymbol: params.currencySymbol,
      currencyDecimals: params.currencyDecimals,
      FNFTPoolId: fNFTPool.poolId,
      totalSupply: new BigNumber(fNFTPool.fNFT.totalSold || 0), // so FNFT trong pool ay
      soldAmountUSD: params.soldAmountUSD,
      rewardMultiplier: params.rewardMultiplier,
      contractFNFTPoolUSD: params.contractFNFTPoolUSD,
      contractRewardPoolUSD: params.contractRewardPoolUSD,
      isInputFNFTPoolPrice: params.isInputFNFTPoolPrice,
      isInputRewardPrice: params.isInputRewardPrice,
      availableAmount: new BigNumber(
        fNFTPool.fNFT.availableAmount || 0,
      ).toString(), //so con lai sau khi ban
      // luong FNFT da ban = totalSupply - availableAmount
      FNFTPool: fNFTPool,
      mintStatus: RewardPoolMintStatus.PROCESSING,
      poolOpenTime: params.poolOpenTime,
      exchangeRates: new BigNumber(params.total)
        .dividedBy(
          new BigNumber(
            new BigNumber(fNFTPool.fNFT.totalSold).minus(
              new BigNumber(fNFTPool.fNFT.availableAmount || 0).toString(),
            ),
          ),
        )
        .toString(),
      createdBy: admin.address,
      bePaidGasFee: params.bePaidGasFee,
    };
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const id = await this.idPoolModel.findOne({});
      if (id) {
        Object.assign(data, { rewardPoolId: id.id + 1 });
        const rewardPool = await this.rewardPoolModel.create([data], {
          session: session,
        });
        const poolAfter = await this.fNFTPoolDocument.updateOne(
          {
            poolId: FNFTPoolId,
          },
          {
            rewardId: rewardPool[0].rewardPoolId,
          },
          { session: session },
        );
        const idAfter = await this.idPoolModel.updateOne(
          { _id: id._id },
          { id: id.id + 1 },
          { session: session },
        );
        if (poolAfter && idAfter) {
          await session.commitTransaction();
          return rewardPool[0];
        }
      } else {
        const id = await this.idPoolModel.create(
          { id: 1 },
          { session: session },
        );
        Object.assign(data, { rewardPoolId: id[0].id });
        const rewardPool = await this.rewardPoolModel.create(
          { data },
          {
            session: session,
          },
        );
        return rewardPool[0];
      }
    } catch (error) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string) {
    const rewardPool = await this.rewardPoolModel
      .findById(id)
      .populate(FNFTPool.name);

    if (!rewardPool) {
      throw HttpError.error(HttpStatus.BAD_REQUEST, 'Reward not found', [
        'Reward not found',
      ]);
    }
    if (
      rewardPool &&
      rewardPool.mintStatus === RewardPoolMintStatus.PROCESSING
    ) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        'Reward pool in processing',
        {},
      );
    }
    const admins = await this.userModel.find({
      address: {
        $in: [rewardPool.createdBy, rewardPool.updatedBy],
      },
    });
    const createdBy = admins.find(
      (admin) => admin.address === rewardPool.createdBy,
    );
    const updatedBy = admins.find(
      (admin) => admin.address === rewardPool.updatedBy,
    );
    const adminCreated = {
      address: createdBy?.address,
      username: createdBy?.username,
    };
    const adminUpdated = {
      address: updatedBy?.address,
      username: updatedBy?.username,
    };
    return {
      code: API_SUCCESS,
      data: rewardPool,
      adminCreated: {
        address: adminCreated.address,
        username: adminCreated.username,
      },
      adminUpdated: {
        address: adminUpdated.address,
        username: adminUpdated.username,
      },
      message: 'Get Detail Reward Successfully',
    };
  }

  async analysisUsers(id: string, query: FilterRewardUserDetails) {
    const reward = await this.rewardPoolModel.aggregate([
      {
        $match: { _id: new ObjectID(id) },
      },
      {
        $lookup: {
          from: FNFTPool.name,
          let: { id: '$rewardPoolId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$rewardId', '$$id'] },
              },
            },
          ],
          as: 'FNFTPool',
        },
      },

      { $addFields: { users: '$FNFTPool.users' } },
      { $addFields: { FNFTSymbol: '$FNFTPool.fNFT.fNFTSymbol' } },
      { $addFields: { currencySymbol: '$currencySymbol' } },
      { $addFields: { exchangeRates: '$exchangeRates' } },
      { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
      { $match: { 'users.fnftBalance': { $nin: ['0', null] } } },
      // { $project: { 'FNFTPool.users': 0 } },
      { $unwind: { path: '$FNFTPool', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$FNFTSymbol', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          users: { $push: '$users' },
          exchangeRates: { $first: '$exchangeRates' },
          fnftSymbol: { $first: '$FNFTSymbol' },
          currencySymbol: { $first: '$currencySymbol' },
        },
      },
    ]);
    const analysis = reward[0].users;
    const exchangeRates = reward[0].exchangeRates;
    const fnftSymbol = reward[0].fnftSymbol;
    const currencySymbol = reward[0].currencySymbol;
    let users = [];
    for (const user of analysis) {
      users.push({
        _id: await this.getIdUser(user.address),
        address: user.address,
        fnftSymbol: fnftSymbol,
        currencySymbol: currencySymbol,
        purchased: parseFloat(user.fnftBalance),
        claimed: parseFloat(user.claim),
        claimable: parseFloat(
          new BigNumber(user.fnftBalance)
            .multipliedBy(new BigNumber(exchangeRates))
            .toString(),
        ),
        unclaimed: parseFloat(
          new BigNumber(
            new BigNumber(user.fnftBalance).multipliedBy(
              new BigNumber(exchangeRates),
            ),
          )
            .minus(new BigNumber(user.claim))
            .toString(),
        ),
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

  async analysisReward() {
    const analysisReward = await this.rewardPoolModel.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $divide: [
                {
                  $sum: {
                    $multiply: [
                      {
                        $multiply: [
                          { $toDouble: '$total' },
                          { $toDouble: '$contractRewardPoolUSD' },
                        ],
                      },
                      10 ** 18,
                    ],
                  },
                },
                10 ** 18,
              ],
            },
          },
          totalClaim: {
            $sum: {
              $divide: [
                {
                  $sum: {
                    $multiply: [
                      {
                        $multiply: [
                          { $toDouble: '$claim' },
                          { $toDouble: '$contractRewardPoolUSD' },
                        ],
                      },
                      10 ** 18,
                    ],
                  },
                },
                10 ** 18,
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          totalClaim: 1,
          totalUnClaim: {
            $subtract: ['$total', '$totalClaim'],
          },
          count: 1,
        },
      },
    ]);
    return analysisReward[0];
  }

  async getRewardPools(filter: RewardPoolFilterDto) {
    const { page, pageSize: limit } = filter;
    const match: Record<string, any> = {};
    const sort: Record<string, any> = {};

    if (filter?.keyword) {
      const textSearch = filter.keyword.trim();
      Object.assign(match, {
        ...match,
        $or: [
          {
            'name.en': { $regex: Utils.escapeRegex(textSearch), $options: 'i' },
          },
          {
            'name.jp': { $regex: Utils.escapeRegex(textSearch), $options: 'i' },
          },
          {
            'name.cn': { $regex: Utils.escapeRegex(textSearch), $options: 'i' },
          },
          {
            'FNFTPool.poolName.en': {
              $regex: Utils.escapeRegex(textSearch),
              $options: 'i',
            },
          },
          {
            'FNFTPool.poolName.jp': {
              $regex: Utils.escapeRegex(textSearch),
              $options: 'i',
            },
          },
          {
            'FNFTPool.poolName.cn': {
              $regex: Utils.escapeRegex(textSearch),
              $options: 'i',
            },
          },
        ],
      });

      if (Number.isSafeInteger(+textSearch)) {
        match.$or.push({ 'FNFTPool.poolId': +textSearch });
        match.$or.push({ rewardPoolId: +textSearch });
      }
    }

    Object.assign(match, {
      ...match,
      mintStatus: RewardPoolMintStatus.DONE,
    });

    if (filter.hasOwnProperty('status')) {
      Object.assign(match, {
        ...match,
        status: { $in: [filter.status] },
      });
    }

    if (filter.sortField && filter.sortType) {
      sort[filter.sortField] = SORT_AGGREGATE[filter.sortType.toUpperCase()];
    } else {
      sort['createdAt'] = SORT_AGGREGATE.DESC;
    }
    const piline: PipelineStage[] = [
      {
        $addFields: { totalRw: { $toDouble: '$total' } },
      },
      {
        $addFields: { claimRw: { $toDouble: '$claim' } },
      },
      {
        $addFields: { unclaim: { $subtract: ['$totalRw', '$claimRw'] } },
      },
      {
        $lookup: {
          from: FNFTPool.name,
          as: FNFTPool.name,
          localField: 'FNFTPoolId',
          foreignField: 'poolId',
        },
      },
      {
        $lookup: {
          from: 'User',
          let: { id: '$createdBy' },
          pipeline: [
            { $match: { $expr: { $eq: ['$address', '$$id'] } } },
            {
              $project: {
                username: 1,
                address: 1,
              },
            },
          ],
          as: 'createdBy',
        },
      },
      {
        $lookup: {
          from: 'User',
          let: { id: '$updatedBy' },
          pipeline: [
            { $match: { $expr: { $eq: ['$address', '$$id'] } } },
            {
              $project: {
                username: 1,
                address: 1,
              },
            },
          ],
          as: 'updatedBy',
        },
      },
      { $unwind: { path: '$FNFTPool', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$updatedBy', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          ...match,
          FNFTPool: { $ne: null },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          status: 1,
          createdAt: 1,
          createdBy: 1,
          updatedAt: 1,
          updatedBy: 1,
          rewardPoolId: 1,
          mintStatus: 1,
          poolOpenTime: 1,
          total: 1,
          claim: 1,
          unclaim: 1,
          currencySymbol: 1,
          FNFTPool: {
            poolName: 1,
            poolId: 1,
            _id: 1,
          },
          bePaidGasFee: 1,
        },
      },
    ];
    const $facet: any = {
      pageInfo: [{ $count: 'totalItem' }],
      items: [
        // { $sort: sort },
        { $skip: page <= 1 ? 0 : (page - 1) * limit },
        { $limit: limit },
      ],
    };
    if (Object.values(sort).length) {
      piline.push({ $sort: sort });
      $facet.items.push({ $sort: sort });
      piline.push({ $facet });
    } else {
      piline.push({ $facet });
    }

    const items = await this.rewardPoolModel
      .aggregate(piline)
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
      const {
        pageInfo: [pageInfo],
      } = result;

      const totalItem = pageInfo?.totalItem;
      const totalPages = Math.ceil(totalItem / limit);
      return {
        items: result.items,
        pageCurrent: page,
        totalDocs: totalItem,
        hasPrevPage: page > 1 && totalItem > 0,
        hasNextPage: page < totalPages,
      };
    }
  }

  async deleteRewardPool(data) {
    try {
      const id = await this.rewardPoolModel.findOne({
        rewardPoolId: data.rewardPoolId,
      });
      if (id) {
        await this.rewardPoolModel.deleteOne({
          rewardPoolId: data.rewardPoolId,
        });
        await this.fNFTPoolDocument.updateOne(
          {
            poolId: data.fnftPoolId,
          },
          { $unset: { rewardId: '' } },
        );
      }
    } catch (error) {
      throw error;
    }
  }
  async updateStatusPoolWhenMintSuccess(data) {
    const pool = await this.rewardPoolModel.findOne({
      rewardPoolId: data._rewardPoolId,
    });
    pool.mintStatus = RewardPoolMintStatus.DONE;
    await pool.save();
  }

  async update(id: string, params: UpdateRewardPoolDto, admin: any) {
    try {
      const { tokenContractAddress, currencySymbol } = params;
      const { message } =
        await this.validateAddressWalletService.isTokenAddress(
          tokenContractAddress,
          currencySymbol,
        );
      if (message) {
        return message;
      }
    } catch (error) {
      if (error?.message) {
        const web3Error = new Web3Error();
        web3Error.message = error?.message || '';
        web3Error.code = CommonCode.WEB3_ERROR;
        return web3Error;
      }

      throw error;
    }
    const data = {
      name: params.name,
      status: params.status,
      updatedBy: admin.address,
    };
    // const checkClaim = (function hasUserClaim() {
    //   let claim = 0;
    //   if (rewardPool?.FNFTPool?.users?.length) {
    //     rewardPool.FNFTPool.users.forEach((user) => {
    //       claim = claim + (+user.claim ?? 0);
    //     });
    //   }
    //   return claim;
    // })();
    // if (!checkClaim) {
    //   data['total'] = params.total;
    //   data['tokenContractAddress'] = params.tokenContractAddress;
    //   data['currencySymbol'] = params.currencySymbol;
    //   data['contractFNFTPoolUSD'] = params.contractFNFTPoolUSD;
    //   data['contractRewardPoolUSD'] = params.contractRewardPoolUSD;
    //   data['soldAmountUSD'] = params.soldAmountUSD;
    //   data['rewardMultiplier'] = params.rewardMultiplier;
    //   data['exchangeRates'] = new BigNumber(params.total)
    //     .dividedBy(
    //       new BigNumber(
    //         new BigNumber(rewardPool.totalSupply).minus(
    //           new BigNumber(rewardPool.availableAmount),
    //         ),
    //       ),
    //     )
    //     .toString();
    // }

    const reward = await this.rewardPoolModel.findOneAndUpdate(
      { _id: id },
      data,
      { new: true },
    );
    return reward;
  }

  async getPrice(tokenAddress: string): Promise<string> {
    tokenAddress = tokenAddress.toLowerCase().trim();
    return await this.commonService.getPriceUsdByContract(tokenAddress);
  }

  async getIdUser(address: string) {
    return await (
      await this.userModel.findOne({ address: address }).lean()
    )._id;
  }
}
