import { TOKEN_STATUS } from './../common/constants';
import { IsDateStringFormatConstraint } from './../common/validate.decorator';
import { PriceToken, PriceTokenDocument } from '~/schemas/price-token.schema';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel } from 'mongoose';
import {
  CreateTokenDto,
  TokenFilterDto,
  UpdateTokenDto,
} from './dto/create-token.dto';
import { HttpError } from '~/common/responses/api-errors';
import { SORT_AGGREGATE, TOKEN_MESSAGE } from '~/common/constants';
import { ErrorDetail } from '~/common/responses/api-error';
import { Utils } from '~/common/utils';
import ObjectID from 'bson-objectid';
import {
  FNFTPool,
  FNFTPoolDocument,
  RewardPool,
  RewardPoolDocument,
} from '~/schemas';

@Injectable()
export class PriceTokenService {
  constructor(
    @InjectModel(PriceToken.name)
    private tokenModel: PaginateModel<PriceTokenDocument>,
    @InjectModel(FNFTPool.name)
    private fnftPoolModel: Model<FNFTPoolDocument>,
    @InjectModel(RewardPool.name)
    private rewardPoolModel: Model<RewardPoolDocument>,
  ) {}

  async getList(filter: TokenFilterDto) {
    const { page, pageSize } = filter;
    const match: Record<string, any> = {
      isDeleted: false,
      contractSymbol: { $exists: true },
      contractDecimals: { $exists: true },
    };
    if (filter.status) {
      match.status = TOKEN_STATUS.TOKEN_ON;
    }
    const sort: Record<string, any> = {};
    if (filter.contractAddress) {
      match.contractAddress = Utils.queryInsensitive(
        filter.contractAddress.trim(),
      );
    }
    if (filter.contractSymbol) {
      match.contractSymbol = Utils.queryInsensitive(
        filter.contractSymbol.trim(),
      );
    }
    if (filter.contractDecimals) {
      match.contractDecimals = Utils.queryInsensitive(
        filter.contractDecimals.trim(),
      );
    }
    sort['createdAt'] = SORT_AGGREGATE.DESC;
    const listToken = await this.tokenModel.paginate(match, {
      page,
      limit: pageSize,
      projection: {
        createdAt: 0,
        updatedAt: 0,
        isDeleted: 0,
      },
      sort,
      collation: { locale: 'en_US', strength: 1 },
    });
    return {
      items: listToken.docs,
      pageCurrent: page,
      totalDocs: listToken.totalDocs,
      hasPrevPage: listToken.hasPrevPage,
      hasNextPage: listToken.hasNextPage,
    };
  }

  async findByContract(contractAddress: string): Promise<PriceTokenDocument> {
    return await this.tokenModel.findOne({
      contractAddress: contractAddress.toLowerCase().trim(),
    });
  }

  async findOne(id: string) {
    return await this.tokenModel.findOne({ _id: new ObjectID(id) });
  }

  async create(data: CreateTokenDto) {
    try {
      const tokenExist = await this.findByContract(data.contractAddress);
      if (
        tokenExist &&
        tokenExist.contractDecimals &&
        tokenExist.contractSymbol
      ) {
        throw HttpError.error(
          HttpStatus.BAD_REQUEST,
          TOKEN_MESSAGE.TOKEN_ADDRESS_IS_EXISTS,
          [TOKEN_MESSAGE.TOKEN_ADDRESS_IS_EXISTS],
        );
      }
      data.contractAddress = data.contractAddress.toLowerCase().trim();
      return await this.tokenModel.findOneAndUpdate(
        {
          contractAddress: data.contractAddress,
        },
        data,
        { upsert: true },
      );
    } catch (error) {
      if (error instanceof ErrorDetail) {
        throw HttpError.error(
          HttpStatus.BAD_REQUEST,
          error.message,
          error.errors,
        );
      }
      throw error;
    }
  }

  async delete(_id: string) {
    try {
      const token = await this.tokenModel.findOne({ _id });
      if (!token) {
        throw HttpError.error(
          HttpStatus.NOT_FOUND,
          TOKEN_MESSAGE.TOKEN_ADDRESS_NOT_FOUND,
          [TOKEN_MESSAGE.TOKEN_ADDRESS_NOT_FOUND],
        );
      }
      const checkToken =
        (await this.checkTokenAddressInPool(token.contractAddress)) ||
        (await this.checkTokenAddressInRewardPool(token.contractAddress));
      if (checkToken) {
        throw HttpError.error(
          HttpStatus.BAD_REQUEST,
          TOKEN_MESSAGE.TOKEN_ADDRESS_ALREADY_IN_POOL,
          [TOKEN_MESSAGE.TOKEN_ADDRESS_ALREADY_IN_POOL],
        );
      }
      return await this.tokenModel.deleteOne({ _id });
    } catch (error) {
      if (error instanceof ErrorDetail) {
        throw HttpError.error(
          HttpStatus.BAD_REQUEST,
          error.message,
          error.errors,
        );
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateTokenDto) {
    try {
      const token = await this.tokenModel.findOne({ _id: new ObjectID(id) });
      if (!token) {
        throw HttpError.error(
          HttpStatus.NOT_FOUND,
          TOKEN_MESSAGE.TOKEN_ADDRESS_NOT_FOUND,
          [TOKEN_MESSAGE.TOKEN_ADDRESS_NOT_FOUND],
        );
      }
      return await this.tokenModel.findOneAndUpdate(
        {
          _id: id,
        },
        data,
        { new: true },
      );
    } catch (error) {
      if (error instanceof ErrorDetail) {
        throw HttpError.error(
          HttpStatus.BAD_REQUEST,
          error.message,
          error.errors,
        );
      }
      throw error;
    }
  }

  async checkTokenAddressInPool(contractAddress: string) {
    return (
      (await this.fnftPoolModel
        .findOne({
          acceptedCurrencyAddress: Utils.queryInsensitive(contractAddress),
        })
        .count()) > 0
    );
  }

  async checkTokenAddressInRewardPool(contractAddress: string) {
    return (
      (await this.rewardPoolModel
        .findOne({
          tokenContractAddress: Utils.queryInsensitive(contractAddress),
        })
        .count()) > 0
    );
  }
}
