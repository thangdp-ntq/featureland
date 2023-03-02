import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  Query,
  Put,
  Req,
} from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { RewardPoolService } from './reward-pool.service';
import {
  CreateRewardPoolDto,
  FilterRewardUserDetails,
  RewardPoolFilterDto,
  RollbackRewardPool,
  UpdateRewardPoolDto,
} from './dto/reward-pool.dto';

import {
  API_ERROR,
  POOL_NFT_MESSAGE,
  CommonCode,
  messsage,
  RewardPoolMintStatus,
  API_SUCCESS,
} from '~/common/constants';
import {
  RewardPoolDetail,
  RewardPoolNotFound,
  RewardPoolsResult,
} from './dto/reponse.dto';
import { RewardPoolDocument } from '~/schemas';
import { Utils } from '~/common/utils';
import { Web3Guard } from '~/auth/web3.guard';
import { HttpError, HttpValidationError } from '~/common/responses/api-errors';
import { Web3Error } from '~/common/interface';
import BigNumber from 'bignumber.js';
import { ErrorDetail } from '~/common/responses/api-error';
import { Request } from 'express';

@Controller('admin/reward-pool')
@ApiTags('Admin reward-pool')
@ApiSecurity('token')
@UseGuards(Web3Guard)
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  schema: {
    properties: {
      code: { type: 'string', example: API_ERROR },
      message: { type: 'string', example: 'unauthorized' },
      errors: { type: 'array', example: ['You are unauthorized'] },
    },
  },
})
export class AdminRewardPoolController {
  constructor(private readonly rewardPoolService: RewardPoolService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.OK, type: RewardPoolDetail })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      properties: {
        code: { type: 'string', example: CommonCode.E0 },
        message: {
          type: 'string',
          example: CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        },
        errors: { type: 'array', example: [POOL_NFT_MESSAGE.POOL_NOT_FOUND] },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      properties: {
        code: { type: 'string', example: CommonCode.E0 },
        message: {
          type: 'string',
          example: CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        },
        errors: { type: 'array', example: [messsage.E14] },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      properties: {
        code: { type: 'string', example: CommonCode.E0 },
        message: {
          type: 'string',
          example: CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        },
        errors: { type: 'array', example: [POOL_NFT_MESSAGE.AMOUNT_IN_VALID] },
      },
    },
  })
  async create(@Body() params: CreateRewardPoolDto, @Req() req: Request) {
    if (new BigNumber(params.total).isLessThanOrEqualTo(0))
      throw HttpValidationError.error(
        CommonCode.E0,
        CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        [POOL_NFT_MESSAGE.TOTAL_REWARD_POOL_GREATER_ERROR],
      );
    const rewardPool = await this.rewardPoolService.create(params, req.user);
    if (
      rewardPool &&
      rewardPool === (POOL_NFT_MESSAGE.FNFT_POOL_EXIST_REWARD_POOL as string)
    ) {
      throw HttpValidationError.error(
        CommonCode.E0,
        CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        [POOL_NFT_MESSAGE.FNFT_POOL_EXIST_REWARD_POOL],
      );
    }
    if (
      rewardPool &&
      rewardPool === POOL_NFT_MESSAGE.REWARD_POOL_NOT_SALE_SUCCESS
    ) {
      throw HttpValidationError.error(
        CommonCode.E0,
        CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        [POOL_NFT_MESSAGE.REWARD_POOL_NOT_SALE_SUCCESS],
      );
    }
    if (
      rewardPool &&
      rewardPool === (POOL_NFT_MESSAGE.POOL_NOT_FOUND as string)
    ) {
      throw HttpValidationError.error(
        CommonCode.E0,
        CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        [POOL_NFT_MESSAGE.POOL_NOT_FOUND],
      );
    } else if (
      rewardPool &&
      [
        POOL_NFT_MESSAGE.E20,
        POOL_NFT_MESSAGE.E26,
        CommonCode.INVALID_TOKEN,
      ].includes(rewardPool as string)
    ) {
      const message = {
        [POOL_NFT_MESSAGE.E20]:
          'You can only select the pools with Purchase End Time < Current Time',
        [POOL_NFT_MESSAGE.E26]:
          'The Pool Open Time must be later than Purchase End Time',
        [CommonCode.INVALID_TOKEN]: POOL_NFT_MESSAGE[CommonCode.INVALID_TOKEN],
      };
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        CommonCode.DEFAULT_ERROR_MESSAGE,
        [message[rewardPool as string]],
      );
    } else if (
      rewardPool &&
      rewardPool instanceof Web3Error &&
      rewardPool.code === CommonCode.WEB3_ERROR
    ) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        CommonCode.DEFAULT_ERROR_MESSAGE,
        [rewardPool?.message],
      );
    } else {
      return RewardPoolDetail.success(rewardPool);
    }
  }

  @Get('/analysis')
  @ApiResponse({ status: HttpStatus.OK, type: RewardPoolsResult })
  async analysisReward() {
    const response = await this.rewardPoolService.analysisReward();
    return {
      code: API_SUCCESS,
      message: CommonCode.DEFAULT_SUCCESS_MESSAGE,
      data: response,
      error: {},
    };
  }

  @Get('/analysis/:id')
  @ApiResponse({ status: HttpStatus.OK, type: RewardPoolsResult })
  async analysisUserReward(
    @Param('id') id: string,
    @Query() query: FilterRewardUserDetails,
  ) {
    const response = await this.rewardPoolService.analysisUsers(id, query);
    return {
      code: API_SUCCESS,
      message: CommonCode.DEFAULT_SUCCESS_MESSAGE,
      data: response,
      error: {},
    };
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: RewardPoolsResult })
  async getRewardPools(@Query() params: RewardPoolFilterDto) {
    const pagination = await this.rewardPoolService.getRewardPools(params);
    return RewardPoolsResult.success(pagination);
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, type: RewardPoolDetail })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: RewardPoolNotFound })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      properties: {
        code: { type: 'string', example: CommonCode.E0 },
        message: {
          type: 'string',
          example: CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        },
        errors: { type: 'array', example: ['ID in invalid'] },
      },
    },
  })
  async findOne(@Param('id') id: string) {
    if (!Utils.isObjectId(id)) {
      throw HttpValidationError.error(
        CommonCode.E0,
        CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        ['ID is invalid'],
      );
    }
    const rewardPool = await this.rewardPoolService.findOne(id);
    return rewardPool;
  }

  @Put(':id')
  @ApiResponse({ status: HttpStatus.OK, type: RewardPoolDetail })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: RewardPoolNotFound })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      properties: {
        code: { type: 'string', example: CommonCode.E0 },
        message: {
          type: 'string',
          example: CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        },
        errors: { type: 'array', example: ['ID in invalid'] },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() params: UpdateRewardPoolDto,
    @Req() req: Request,
  ) {
    if (!Utils.isObjectId(id)) {
      throw HttpValidationError.error(
        CommonCode.E0,
        CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        ['ID is invalid'],
      );
    }
    const rewardPool = await this.rewardPoolService.findOne(id);
    if (!rewardPool) {
      throw HttpError.error(HttpStatus.NOT_FOUND, 'Reward pool not found', []);
    }

    const updateRwPool = await this.rewardPoolService.update(
      id,
      params,
      req.user,
    );
    if (
      updateRwPool &&
      updateRwPool === (POOL_NFT_MESSAGE.POOL_NOT_FOUND as string)
    ) {
      throw HttpValidationError.error(
        CommonCode.E0,
        CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        [POOL_NFT_MESSAGE.POOL_NOT_FOUND],
      );
    } else if (
      updateRwPool &&
      [
        POOL_NFT_MESSAGE.E20,
        POOL_NFT_MESSAGE.E26,
        CommonCode.INVALID_TOKEN,
      ].includes(updateRwPool as string)
    ) {
      const message = {
        [POOL_NFT_MESSAGE.E20]:
          'You can only select the pools with Purchase End Time < Current Time',
        [POOL_NFT_MESSAGE.E26]:
          'The Pool Open Time must be later than Purchase End Time',
        [CommonCode.INVALID_TOKEN]: POOL_NFT_MESSAGE[CommonCode.INVALID_TOKEN],
      };
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        CommonCode.DEFAULT_ERROR_MESSAGE,
        [message[updateRwPool as string]],
      );
    } else if (
      rewardPool &&
      updateRwPool instanceof Web3Error &&
      updateRwPool.code === CommonCode.WEB3_ERROR
    ) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        CommonCode.DEFAULT_ERROR_MESSAGE,
        [updateRwPool?.message],
      );
    } else {
      return RewardPoolDetail.success(updateRwPool as RewardPoolDocument);
    }
  }

  @Post('/rollbackRewardPool')
  @ApiResponse({ status: HttpStatus.OK, type: RewardPoolDetail })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: RewardPoolNotFound })
  async remove(@Body() params: RollbackRewardPool) {
    try {
      await this.rewardPoolService.deleteRewardPool(params);
      return {
        code: API_SUCCESS,
        data: {},
        message: 'Rollback reward pool successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Put('/mint/:rewardPoolId')
  @ApiResponse({ status: HttpStatus.OK, type: RewardPoolDetail })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: RewardPoolNotFound })
  async updateMintStatusWhenMintSuccess(
    @Param('rewardPoolId') rewardPoolId: number,
  ) {
    try {
      const data = { _rewardPoolId: rewardPoolId };
      await this.rewardPoolService.updateStatusPoolWhenMintSuccess(data);
      return {
        code: API_SUCCESS,
        data: {},
        message: 'Update reward pool successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/getPrice/:tokenAddress')
  async getPrice(@Param('tokenAddress') tokenAddress: string) {
    try {
      const price = await this.rewardPoolService.getPrice(tokenAddress);
      return {
        code: API_SUCCESS,
        data: price,
        message: 'Get Price Successfully',
      };
    } catch (error) {
      if (error instanceof ErrorDetail) {
        throw HttpError.error(
          HttpStatus.BAD_REQUEST,
          error.message,
          error.errors,
        );
      } else if (typeof error === 'string') {
        throw HttpError.error(HttpStatus.NOT_FOUND, error, {});
      }
      throw error;
    }
  }
}
