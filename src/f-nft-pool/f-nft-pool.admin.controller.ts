import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnsupportedMediaTypeException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Utils } from '../common/utils';
import { Web3Guard } from '../auth/web3.guard';
import { CreateFNFTPoolDTO } from './dto/create-f-nft-pool.dto';
import { GetFNFTPoolDTO } from './dto/get-f-nft-pool.dto';
import {
  CreateFNFTPoolError,
  CreateFNFTPoolResponse,
  FNFTPoolNotFoundError,
  FNFTPoolSchema,
  GetFNFTPoolDetailError,
  GetFNFTPoolDetailResponse,
  GetFNFTPoolResponse,
  responseErrorAddressWrongFormat,
  responseErrorCalcWhitelist,
} from './dto/response.dto';
import { FNftPoolService } from './f-nft-pool.service';
import {
  responseCalculateWhitelist,
  responseErrorFileWrongFormat,
  responseErrorInvalidToken,
  responseImportWhiteList,
} from './dto/response.dto';
import {
  CalculateWhitelist,
  ImportWhiteListDto,
} from '../f-nft-pool/dto/whitelist.dto';
import {
  VerifyConfigureWhitelistDTO,
  VerifyConfigureWhitelistError,
  VerifyGeneralInfoDTO,
  VerifyGeneralInfoError,
  VerifySelectNFTDTO,
  VerifySelectNFTError,
  VerifyStageDto,
} from './dto/verify-f-nft-pool.dto';
import { ErrorDetail } from '../common/responses/api-error';
import {
  API_ERROR,
  API_SUCCESS,
  CommonCode,
  messsage,
  NFT_RESPOND_MESSAGE,
  POOL_NFT_MESSAGE,
} from '../common/constants';
import { HttpError } from '../common/responses/api-errors';
import {
  UpdateAllocationSettingDTO,
  UpdateFNFTPoolDTO,
  UpdateFNFTPoolOnChainDTO,
} from './dto/update-f-nft-pool.dto';
import mongoose from 'mongoose';
import { RolesGuard } from '~/auth/roles.guard';
import { UserRole } from '~/schemas';
import { Roles } from '~/auth/roles.decorator';
import { Request } from 'express';
import { FilterPurchasedUserDetails } from './dto/analysis-fnft-pool.dto';

@Controller('admin/f-nft-pool')
@ApiTags('Admin F-NFT pool')
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
export class FNftPoolController {
  private readonly logger = new Logger(FNftPoolController.name);
  constructor(private readonly fNFTPoolService: FNftPoolService) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: GetFNFTPoolResponse })
  @ApiExtraModels(FNFTPoolSchema)
  @ApiOperation({ summary: 'Get f-nft pool list' })
  async getFNFTPoolList(@Query() params: GetFNFTPoolDTO) {
    this.logger.debug(`Get f-nft pool list: ${params}`);
    const listFNFTPool = await this.fNFTPoolService.getListFNFTPool(params);
    return GetFNFTPoolResponse.success(listFNFTPool);
  }

  @Get('/detail/:fNFTPoolId')
  @ApiResponse({ status: HttpStatus.OK, type: GetFNFTPoolDetailResponse })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: GetFNFTPoolDetailError })
  @ApiOperation({ summary: 'Get f-nft pool detail' })
  async getFNFTPoolDetail(@Param('fNFTPoolId') id: number) {
    try {
      this.logger.debug(`Get FNFT detail:: poolId ${id}`);
      const fNFTPool = await this.fNFTPoolService.getFNFTPoolDetail(id);
      return fNFTPool;
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
      } else if (typeof error === 'string') {
        if (error === POOL_NFT_MESSAGE.POOL_NOT_EXIST) {
          throw HttpError.error(HttpStatus.NOT_FOUND, error, {});
        }
      }
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create f-nft pool draft' })
  @ApiResponse({ status: HttpStatus.CREATED, type: GetFNFTPoolDetailResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: CreateFNFTPoolError })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'poolImage', maxCount: 1 },
        { name: 'poolVideo', maxCount: 1 },
      ],
      {
        fileFilter: (req, file: Express.Multer.File, cb) => {
          switch (file.fieldname) {
            case 'poolVideo':
              return Utils.fileFilterVideo(req, file, cb);
            case 'poolImage':
              return Utils.fileFilterImage(req, file, cb);
          }
          return cb(null, true);
        },
      },
    ),
  )
  async createDraftFNFTPool(
    @Body() fNFTPool: CreateFNFTPoolDTO,
    @Req() req: Request,
    @UploadedFiles()
    files: { poolImage?: Express.Multer.File; poolVideo?: Express.Multer.File },
  ) {
    try {
      const fNFTPoolRes = await this.fNFTPoolService.createFNFTPool(
        fNFTPool,
        req.user,
        files.poolImage[0],
        files.poolVideo ? files.poolVideo[0] : null,
      );
      return CreateFNFTPoolResponse.success(fNFTPoolRes);
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

  @Post('/:poolId/import-whitelist')
  @HttpCode(200)
  @ApiOperation({ summary: 'Import whitelist' })
  @ApiResponse({ status: HttpStatus.OK, type: responseImportWhiteList }) // import success
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: Utils.fileFilterCsv,
    }),
  )
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: responseErrorInvalidToken,
    description: 'response when invalid token',
  }) // invalid token
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: responseErrorFileWrongFormat,
  }) // File format error
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    type: responseErrorAddressWrongFormat,
  }) // address wrong format
  async importWhiteList(
    @Param('poolId') poolId: number,
    @Body() createPoolDto: ImportWhiteListDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file)
      throw new UnsupportedMediaTypeException({
        code: CommonCode.E5,
        message: POOL_NFT_MESSAGE.IMPORT_WHITE_LIST_FAIL,
        errors: [NFT_RESPOND_MESSAGE.FILE_IS_REQUIRE],
      });
    const data = await this.fNFTPoolService.importWhitelist(file, poolId);
    if (data === POOL_NFT_MESSAGE.IMPORT_WHITE_LIST_FAIL)
      return { code: API_ERROR, data };
    if (data === POOL_NFT_MESSAGE.POOL_NOT_FOUND)
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        POOL_NFT_MESSAGE.POOL_NOT_FOUND,
        [POOL_NFT_MESSAGE.POOL_NOT_FOUND],
      );
    if (data === POOL_NFT_MESSAGE.POOL_IS_PURCHASE)
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        POOL_NFT_MESSAGE.POOL_IS_PURCHASE,
        [POOL_NFT_MESSAGE.POOL_IS_PURCHASE],
      );
    return {
      code: API_SUCCESS,
      data,
    };
  }

  @Post('/:poolId/calculate-whitelist')
  @ApiOperation({ summary: 'Calculate whitelist' })
  @ApiResponse({ status: HttpStatus.OK, type: responseCalculateWhitelist }) // response chuan
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: responseErrorCalcWhitelist,
  }) // address wrong format
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: responseErrorInvalidToken,
  }) // invalid token
  async calculate(
    @Param('poolId') poolId: number,
    @Body() calculateWhitelist: CalculateWhitelist,
  ) {
    const result = await this.fNFTPoolService.calculator(
      calculateWhitelist,
      poolId,
    );
    if (result === POOL_NFT_MESSAGE.POOL_NOT_FOUND)
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        POOL_NFT_MESSAGE.POOL_NOT_FOUND,
        {},
      );

    if (result === POOL_NFT_MESSAGE.POOL_IS_PURCHASE)
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        POOL_NFT_MESSAGE.POOL_IS_PURCHASE,
        {},
      );
    if (result === POOL_NFT_MESSAGE.POOL_FCFS)
      return {
        code: API_SUCCESS,
        data: { calculateWhitelist, poolId, result },
        message: POOL_NFT_MESSAGE.IMPORT_USER_FCFS_SUCCESS,
      };

    return {
      code: API_SUCCESS,
      data: { calculateWhitelist, poolId, result },
      message: POOL_NFT_MESSAGE.CALCULATE_SUCCESS,
    };
  }

  @Put('/draft/:poolId')
  @ApiOperation({ summary: 'update pool draft' })
  @ApiResponse({ status: HttpStatus.OK, type: GetFNFTPoolDetailResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: CreateFNFTPoolError })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: FNFTPoolNotFoundError })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'poolImage', maxCount: 1 },
        { name: 'poolVideo', maxCount: 1 },
      ],
      {
        fileFilter: (req, file: Express.Multer.File, cb) => {
          switch (file.fieldname) {
            case 'poolVideo':
              return Utils.fileFilterVideo(req, file, cb);
            case 'poolImage':
              return Utils.fileFilterImage(req, file, cb);
          }
          return cb(null, true);
        },
      },
    ),
  )
  async updateFNFTPoolDraft(
    @Param('poolId') poolId: string,
    @Req() req: Request,
    @Body() data: UpdateFNFTPoolDTO,
    @UploadedFiles()
    files: { poolImage?: Express.Multer.File; poolVideo?: Express.Multer.File },
  ) {
    try {
      const fNFTPoolRes = await this.fNFTPoolService.updateFNFTPoolDraft(
        poolId,
        req.user,
        data,
        files.poolImage ? files.poolImage[0] : null,
        files.poolVideo ? files.poolVideo[0] : null,
      );
      return CreateFNFTPoolResponse.success(fNFTPoolRes, true);
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
      } else if (typeof error === 'string') {
        if (error === POOL_NFT_MESSAGE.POOL_NOT_EXIST) {
          throw HttpError.error(HttpStatus.NOT_FOUND, error, {});
        }
      }
      throw error;
    }
  }
  @Put('/allocationSetting/:poolId')
  @ApiOperation({ summary: 'update allocation Settings' })
  @ApiResponse({ status: HttpStatus.OK, type: GetFNFTPoolDetailResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: CreateFNFTPoolError })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: FNFTPoolNotFoundError })
  async updateAllocationSettings(
    @Param('poolId') poolId: string,
    @Body() data: UpdateAllocationSettingDTO,
  ) {
    try {
      const fNFTPoolRes = await this.fNFTPoolService.updateAllocationSetting(
        poolId,
        data,
      );
      return CreateFNFTPoolResponse.success(fNFTPoolRes, true);
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
      } else if (typeof error === 'string') {
        if (error === POOL_NFT_MESSAGE.POOL_NOT_EXIST) {
          throw HttpError.error(HttpStatus.NOT_FOUND, error, {});
        }
      }
      throw error;
    }
  }

  @Put('/onChain/:poolId')
  @ApiOperation({ summary: 'update pool on chain' })
  @ApiResponse({ status: HttpStatus.OK, type: GetFNFTPoolDetailResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: CreateFNFTPoolError })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: FNFTPoolNotFoundError })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'poolImage', maxCount: 1 },
        { name: 'poolVideo', maxCount: 1 },
      ],
      {
        fileFilter: (req, file: Express.Multer.File, cb) => {
          switch (file.fieldname) {
            case 'poolVideo':
              return Utils.fileFilterVideo(req, file, cb);
            case 'poolImage':
              return Utils.fileFilterImage(req, file, cb);
          }
          return cb(null, true);
        },
      },
    ),
  )
  async updateFNFTPoolOnChain(
    @Param('poolId') poolId: string,
    @Req() req: Request,
    @Body() data: UpdateFNFTPoolOnChainDTO,
    @UploadedFiles()
    files: { poolImage?: Express.Multer.File; poolVideo?: Express.Multer.File },
  ) {
    try {
      const fNFTPoolRes = await this.fNFTPoolService.updateFNFTPoolOnChain(
        poolId,
        req.user,
        data,
        files.poolImage ? files.poolImage[0] : null,
        files.poolVideo ? files.poolVideo[0] : null,
      );
      return CreateFNFTPoolResponse.success(fNFTPoolRes, true);
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
      } else if (typeof error === 'string') {
        if (error === POOL_NFT_MESSAGE.POOL_NOT_EXIST) {
          throw HttpError.error(HttpStatus.NOT_FOUND, error, {});
        }
      }
      throw error;
    }
  }

  @Post('/verifySelectNFT')
  @ApiOperation({ summary: 'Verify data in step select NFT' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: VerifySelectNFTError,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      properties: {
        code: { type: 'string', example: API_SUCCESS },
        message: {
          type: 'string',
          example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
        },
        data: { type: 'object', example: {} },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async verifySelectNFT(@Body() verifySelectNFTDTO: VerifySelectNFTDTO) {
    try {
      return await this.fNFTPoolService.verifySelectNFT(verifySelectNFTDTO);
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

  @Post('/verifyProductionStage')
  async verifyProductionStage(@Body() verifyProductionStage: VerifyStageDto) {
    try {
      return await this.fNFTPoolService.verifyProductionStage(
        verifyProductionStage,
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

  @Post('/verifyGeneralInfo')
  @ApiOperation({ summary: 'Verify data in step general info' })
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      properties: {
        code: { type: 'string', example: API_SUCCESS },
        message: {
          type: 'string',
          example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
        },
        data: { type: 'object', example: {} },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: VerifyGeneralInfoError,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'poolImage', maxCount: 1 },
        { name: 'poolVideo', maxCount: 1 },
      ],
      {
        fileFilter: (req, file: Express.Multer.File, cb) => {
          switch (file.fieldname) {
            case 'poolVideo':
              return Utils.fileFilterVideo(req, file, cb);
            case 'poolImage':
              return Utils.fileFilterImage(req, file, cb);
          }
          return cb(null, true);
        },
      },
    ),
  )
  async verifyGeneralInfo(
    @Body() data: VerifyGeneralInfoDTO,
    @UploadedFiles()
    files: { poolImage?: Express.Multer.File; poolVideo?: Express.Multer.File },
  ) {
    try {
      return await this.fNFTPoolService.verifyGeneralInfoWhenEdit(
        data,
        files.poolImage ? files.poolImage[0] : null,
        files.poolVideo ? files.poolVideo[0] : null,
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

  @Post('/verifyConfigureWhitelist')
  @ApiOperation({ summary: 'Verify data in step configure whitelist' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      properties: {
        code: { type: 'string', example: API_SUCCESS },
        message: {
          type: 'string',
          example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
        },
        data: { type: 'object', example: {} },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: VerifyConfigureWhitelistError,
  })
  async verifyConfigureWhitelist(
    @Body() verifyConfigureWhitelistDTO: VerifyConfigureWhitelistDTO,
  ) {
    try {
      return await this.fNFTPoolService.verifyConfigureWhitelist(
        verifyConfigureWhitelistDTO,
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

  @Put('/updateFNFT/:poolId')
  @ApiOperation({ summary: 'update pool when mint success' })
  @ApiResponse({ status: HttpStatus.OK, type: GetFNFTPoolDetailResponse })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: FNFTPoolNotFoundError })
  async updateFNFTPoolWhenMintSuccess(
    @Param('poolId') poolId: string,
    @Req() req: Request,
  ) {
    try {
      const fNFTPoolRes =
        await this.fNFTPoolService.updateFNFTPoolWhenMintSuccessAPI(
          {
            _poolId: poolId,
          },
          req.user,
        );
      return CreateFNFTPoolResponse.success(fNFTPoolRes, true);
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

  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @Put('/withdraw/:poolId')
  @ApiOperation({ summary: 'update pool when withdraw success' })
  @ApiResponse({ status: HttpStatus.OK, type: GetFNFTPoolDetailResponse })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: FNFTPoolNotFoundError })
  async updateFNFTPoolAfterWithdraw(@Param('poolId') poolId: number) {
    try {
      const fNFTPoolRes = await this.fNFTPoolService.withdrawFun(poolId);
      return CreateFNFTPoolResponse.success(fNFTPoolRes, true);
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

  @Get('/analysis/:poolId')
  async analysisUserPurchased(
    @Param('poolId') poolId: number,
    @Query() query: FilterPurchasedUserDetails,
  ) {
    const response = await this.fNFTPoolService.analysisUsersPurchased(
      poolId,
      query,
    );
    return {
      code: API_SUCCESS,
      message: CommonCode.DEFAULT_SUCCESS_MESSAGE,
      data: response,
      error: {},
    };
  }

  // @Post('test/staking')
  // async staking(@Body() stakingInfo: StakingInfo) {
  //   return await this.fNFTPoolService.staking(stakingInfo);
  // }
  // @Post('test/unStaking')
  // async unStaking(@Body() stakingInfo: StakingInfo) {
  //   return await this.fNFTPoolService.unStaking(stakingInfo);
  // }
}
