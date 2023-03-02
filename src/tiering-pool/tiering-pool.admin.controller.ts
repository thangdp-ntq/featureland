import { RolesGuard } from '~/auth/roles.guard';
import {
  Controller,
  Get,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { TieringPoolService } from './tiering-pool.service';
import { UpdateTieringPoolDto } from './dto/update-tiering-pool.dto';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Web3Guard } from '../auth/web3.guard';
import {
  API_ERROR,
  API_SUCCESS,
  CommonCode,
  POOL_TIERING_MESSAGE,
} from '../common/constants';
import { PoolTieringNotFound, ResponseGetDetailsPool } from './dto/reponse.dto';
import { HttpError } from '../common/responses/api-errors';
import { UserRole } from '~/schemas';
import { Roles } from '~/auth/roles.decorator';

@Controller('admin/tiering-pool')
@ApiTags('Admin tiering-pool')
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
export class TieringPoolController {
  constructor(private readonly tieringPoolService: TieringPoolService) {}

  @Get('')
  @ApiResponse({ status: HttpStatus.OK, type: ResponseGetDetailsPool })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: PoolTieringNotFound })
  async findOne() {
    const poolTiering = await this.tieringPoolService.findOne();
    if (!poolTiering)
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        POOL_TIERING_MESSAGE.TIER_POOL_NOT_CREATE,
        [],
      );
    return {
      code: API_SUCCESS,
      data: poolTiering,
    };
  }

  @UseGuards(RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @Put(':id')
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: PoolTieringNotFound })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      properties: {
        code: { type: 'string', example: API_ERROR },
        message: {
          type: 'string',
          example: CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        },
        errors: {
          example: ['Start Join Time must be later than the End Join Time'],
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateTieringPoolDto: UpdateTieringPoolDto,
  ) {
    const updatePool = await this.tieringPoolService.update(
      id,
      updateTieringPoolDto,
    );
    if (updatePool === POOL_TIERING_MESSAGE.POOL_NOT_FOUND)
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        POOL_TIERING_MESSAGE.POOL_NOT_FOUND,
        [],
      );
    return {
      code: API_SUCCESS,
      data: POOL_TIERING_MESSAGE.UPDATE_POOL_SUCCESS,
    };
  }
}
