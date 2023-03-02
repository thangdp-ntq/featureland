import { JwtAuthGuard } from '~/auth/jwt-auth.guard';
import { ClaimRewardService } from './../claim-reward/claim-reward.service';
import { CommonCode, messsage } from './../common/constants';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { API_SUCCESS, POOL_NFT_MESSAGE } from '../common/constants';
import { HttpError } from '../common/responses/api-errors';
import { GetWhiteListDTO } from './dto/get-f-nft-pool.dto';
import { FNFTPoolNotFoundError, ResponseUserGetPool } from './dto/response.dto';
import { FNftPoolService } from './f-nft-pool.service';
import { UpdateRemainDto } from '~/purchase-f-nft/dto/purchase-f-nft.dto';
import { Web3Guard } from '~/auth/web3.guard';
import mongoose from 'mongoose';
import { ErrorDetail } from '~/common/responses/api-error';
import { UpdateClaimWorkerDto } from '~/claim-reward/dto/update-claim-reward.dto';

@Controller('user/f-nft-pool')
@ApiTags('Users')
export class FNFTPoolUserController {
  private readonly logger = new Logger(FNFTPoolUserController.name);
  constructor(
    private readonly fNFTPoolService: FNftPoolService,
    private readonly claimRewardService: ClaimRewardService,
  ) {}

  @Get('whitelist/:poolId')
  @ApiResponse({ status: HttpStatus.OK, type: ResponseUserGetPool })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: FNFTPoolNotFoundError })
  @ApiOperation({ summary: 'Get whitelist f-nft pool' })
  async getWhiteList(
    @Param('poolId') poolId: number,
    @Query() query: GetWhiteListDTO,
  ) {
    const whiteList = await this.fNFTPoolService.getWhiteList(poolId, query);
    if (whiteList === POOL_NFT_MESSAGE.POOL_NOT_FOUND)
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        POOL_NFT_MESSAGE.POOL_NOT_FOUND,
        {},
      );
    if (whiteList === POOL_NFT_MESSAGE.WHITELIST_NOT_OPEN_YET)
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        POOL_NFT_MESSAGE.WHITELIST_NOT_OPEN_YET,
        {},
      );
    return {
      code: API_SUCCESS,
      data: whiteList,
    };
  }

  @Get('/:poolId')
  @ApiResponse({ status: HttpStatus.OK, type: ResponseUserGetPool })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: FNFTPoolNotFoundError })
  @ApiOperation({ summary: 'Get f-nft pool detail' })
  async getTieringStructure(@Param('poolId') poolId: number, @Req() req) {
    const pool = await this.fNFTPoolService.getPoolDetail(poolId, req);
    if (pool === POOL_NFT_MESSAGE.POOL_NOT_FOUND)
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        POOL_NFT_MESSAGE.POOL_NOT_FOUND,
        {},
      );
    return {
      code: API_SUCCESS,
      data: pool,
    };
  }

  @ApiSecurity('token')
  @UseGuards(Web3Guard)
  @Put('/updateRemain')
  @ApiResponse({ status: HttpStatus.OK, type: ResponseUserGetPool })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: FNFTPoolNotFoundError })
  @ApiOperation({ summary: 'Handle after purchase FNFT' })
  async processPurchaseFNFT(@Body() data: UpdateRemainDto) {
    try {
      this.logger.log(
        'data update pool after user purchase FNFT',
        JSON.stringify(data),
      );
      await this.fNFTPoolService.updateRemain(
        data.poolId,
        data.account,
        data.purchasedFNFT,
        data.purchaseId,
      );
      return {
        code: API_SUCCESS,
        messsage: CommonCode.DEFAULT_SUCCESS_MESSAGE,
        data: [],
      };
    } catch (error) {
      if (
        error instanceof mongoose.Error.CastError &&
        error.kind === 'ObjectId'
      ) {
        throw HttpError.error(HttpStatus.BAD_REQUEST, messsage.ID_INVALID, {});
      }
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

  @ApiSecurity('token')
  @UseGuards(Web3Guard)
  @Put('/updateClaim')
  @ApiOperation({ summary: 'api user claim reward' })
  async handleClaim(@Body() data: UpdateClaimWorkerDto) {
    try {
      this.logger.log(
        'data update pool after user claim',
        JSON.stringify(data),
      );
      await this.claimRewardService.updateClaim(data);
      return {
        code: API_SUCCESS,
        messsage: CommonCode.DEFAULT_SUCCESS_MESSAGE,
        data: [],
      };
    } catch (error) {
      if (
        error instanceof mongoose.Error.CastError &&
        error.kind === 'ObjectId'
      ) {
        throw HttpError.error(HttpStatus.BAD_REQUEST, messsage.ID_INVALID, {});
      }
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

  @Put('/updateClaim2434')
  @ApiOperation({ summary: 'api user claim reward' })
  async oooo() {
    try {
      await this.fNFTPoolService.updateRemain1();
      return {
        code: API_SUCCESS,
        messsage: CommonCode.DEFAULT_SUCCESS_MESSAGE,
        data: [],
      };
    } catch (error) {
      console.log(error);
    }
  }
}
