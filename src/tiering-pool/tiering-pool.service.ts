import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pagination } from '../common/interface';
import {
  TieringPool,
  TieringPoolDocument,
} from '../schemas/pool-tiering.schema';
import { CreateTieringPoolDto } from './dto/create-tiering-pool.dto';
import {
  GetHistoryTransactionParams,
  ParamTieringPool,
} from './dto/get-tiering-pool.dto';
import { UpdateTieringPoolDto } from './dto/update-tiering-pool.dto';
import {
  ACTIVE_LOG_DAY,
  POOL_TIERING_MESSAGE,
  SORT_AGGREGATE,
  STAKING_TYPE,
  USERNAME_WEB_DEFAULT,
} from '../common/constants';
import { Utils } from '../common/utils';
import {
  HistoryStaking,
  HistoryStakingDocument,
} from '../schemas/staking-history.schema';
import { sub } from 'date-fns';
import { StakingInfo } from '../f-nft-pool/dto/create-f-nft-pool.dto';
import BigNumber from 'bignumber.js';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { IdPool, IdPoolDocument } from '../schemas/idPool.schema';
import { Web3Gateway } from '~/blockchain/web3.gateway';
import { CommonService } from '~/common-service/common.service';
@Injectable()
export class TieringPoolService {
  constructor(
    @InjectModel(TieringPool.name)
    private tieringPoolModel: Model<TieringPoolDocument>,
    @InjectModel(HistoryStaking.name)
    private historyTransactionModel: Model<HistoryStakingDocument>,
    @InjectModel(HistoryStaking.name)
    private stakingHistoryModel: Model<HistoryStakingDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(IdPool.name)
    private idPoolModel: Model<IdPoolDocument>,
    private readonly commonService: CommonService,
  ) {}
  async create(createTieringPoolDto: CreateTieringPoolDto) {
    return this.tieringPoolModel.create(createTieringPoolDto);
  }

  async findTieringPool(
    filter: ParamTieringPool,
  ): Promise<Pagination<TieringPool[]>> {
    const { page, pageSize } = filter;
    const match: Record<string, any> = {};
    const sort: Record<string, any> = {};
    if (filter.textSearch) {
      match.$or = [
        {
          poolName: Utils.queryInsensitive(filter.textSearch.trim()),
        },
        {
          tieringPoolId: Number(filter.textSearch)
            ? Number(filter.textSearch)
            : 0,
        },
      ];
    }

    if (filter.status) {
      match.status = { $in: [filter.status] };
    }

    if (filter.sortField && filter.sortType) {
      sort[filter.sortField] = SORT_AGGREGATE[filter.sortType.toUpperCase()];
    }

    const query = {
      limit: pageSize,
      page,
      projection: {
        _id: 1,
        name: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        tieringPoolId: 1,
        tieringTokenAddress: 1,
        lockDuration: 1,
        timeStartJoin: 1,
      },
      sort,
    };

    const series = await Utils.paginate(
      this.tieringPoolModel,
      { ...match },
      query,
    );

    return {
      items: series.docs,
      pageCurrent: page,
      totalDocs: series.totalDocs,
      hasPrevPage: series.hasPrevPage,
      hasNextPage: series.hasNextPage,
    };
  }

  async findOne() {
    const pool = await this.tieringPoolModel.findOne();
    return pool;
  }

  async update(id: string, updateTieringPoolDto: UpdateTieringPoolDto) {
    if (!Utils.isObjectId(id)) {
      return POOL_TIERING_MESSAGE.POOL_NOT_FOUND;
    }
    const pool = await this.tieringPoolModel.findById(id);
    if (!pool) return POOL_TIERING_MESSAGE.POOL_NOT_FOUND;
    await this.tieringPoolModel.updateOne({ _id: id }, updateTieringPoolDto);
    return POOL_TIERING_MESSAGE.UPDATE_POOL_SUCCESS;
  }

  async updateTierPoolWhenSubmitBlockchain(data) {
    const tierPool = await this.tieringPoolModel.findOne({
      tieringPoolId: data._poolId,
    });
    const id = await this.idPoolModel.findOne({});
    if (!id) {
      await this.idPoolModel.create({ id: data._poolId });
    } else {
      // await this.idPoolModel.updateOne({ _id: id._id }, { id: data._poolId });
    }
    if (!tierPool) {
      const tierPoolData: TieringPool = {
        poolContractAddress: process.env.CONTRACT_PROXY,
        tieringTokenAddress: data._stakingToken,
        lockDuration: data._lockDuration,
        withdrawDelayDuration: data._withdrawDelayDuration,
        tieringPoolId: data._poolId,
      };
      await this.tieringPoolModel.create(tierPoolData);
    } else {
      tierPool.poolContractAddress = process.env.CONTRACT_PROXY;
      tierPool.tieringTokenAddress = data._stakingToken;
      tierPool.lockDuration = data._lockDuration;
      tierPool.withdrawDelayDuration = data._withdrawDelayDuration;
      tierPool.tieringPoolId = data._poolId;
      await tierPool.save();
    }
  }

  async getHistoryTransaction(getParams: GetHistoryTransactionParams) {
    const histories = await this.historyTransactionModel.aggregate([
      {
        $match: {
          userAddress: getParams.userAddress,
          createdAt: {
            $gte: sub(new Date(), { days: ACTIVE_LOG_DAY }),
          },
        },
      },
      {
        $project: {
          userAddress: 1,
          value: 1,
          type: 1,
          balance: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return histories;
  }

  async getDecimalStakingTokens(): Promise<any> {
    const tieringPool = await this.tieringPoolModel.findOne();
    const web3Gateway = new Web3Gateway(+process.env.CHAIN_ID);
    const decimals = await this.commonService.getCacheDecimals(
      web3Gateway,
      tieringPool.tieringTokenAddress,
    );
    return decimals;
  }

  async unStaking(stakingInfo: StakingInfo) {
    const balance = await this.getCurrentBalance(stakingInfo.userAddress);
    const decimals = await this.getDecimalStakingTokens();
    let newBalance = '0';
    if (
      balance &&
      new BigNumber(balance)
        .minus(new BigNumber(stakingInfo.balance))
        .comparedTo(0)
    ) {
      newBalance = new BigNumber(balance)
        .minus(
          new BigNumber(stakingInfo.balance).dividedBy(Math.pow(10, decimals)),
        )
        .toString();
    }
    await this.userModel.updateOne(
      {
        address: stakingInfo.userAddress,
      },
      {
        balance: Utils.convertNumberToNoExponents(newBalance),
      },
    );
    return await this.stakingHistoryModel.create({
      userAddress: stakingInfo.userAddress,
      balance: Utils.convertNumberToNoExponents(newBalance),
      value: Utils.convertNumberToNoExponents(
        new BigNumber(stakingInfo.balance)
          .dividedBy(Math.pow(10, decimals))
          .toString(),
      ),
      type: STAKING_TYPE.UNSTAKING,
    });
  }

  async staking(stakingInfo: StakingInfo) {
    const decimals = await this.getDecimalStakingTokens();
    let user = await this.userModel.findOne({
      address: stakingInfo.userAddress,
    });
    if (!user) {
      const data = {
        address: stakingInfo.userAddress,
        role: UserRole.USER,
        username: USERNAME_WEB_DEFAULT + new Date().getTime(),
      };
      user = await this.userModel.create(data);
      await user.save();
    }

    let newBalance = new BigNumber(stakingInfo.balance)
      .dividedBy(Math.pow(10, decimals))
      .toString();
    if (user?.joinDate == null) {
      await this.userModel.updateOne(
        {
          address: user.address,
        },
        {
          joinDate: new Date(),
        },
      );
    }
    const balance = await this.getCurrentBalance(stakingInfo.userAddress);
    if (balance) {
      newBalance = new BigNumber(newBalance)
        .plus(new BigNumber(balance))
        .toString();
    }
    await this.userModel.updateOne(
      {
        address: stakingInfo.userAddress,
      },
      {
        balance: Utils.convertNumberToNoExponents(newBalance),
      },
    );
    return await this.stakingHistoryModel.create({
      userAddress: stakingInfo.userAddress,
      balance: Utils.convertNumberToNoExponents(newBalance),
      value: new BigNumber(
        new BigNumber(stakingInfo.balance).dividedBy(Math.pow(10, decimals)),
      ).toString(),
      type: STAKING_TYPE.STAKING,
    });
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
}
