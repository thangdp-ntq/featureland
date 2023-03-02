import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { API_ERROR, TieringStructureResponse } from '../common/constants';
import { Web3Guard } from '../auth/web3.guard';
import { HttpError } from '../common/responses/api-errors';
import {
  TiersErrorDoneNotExist,
  TiersErrorDuplicate,
  TiersResponse,
} from './dto/response.dto';
import {
  TieringStructureDto,
  TiersDto,
} from './dto/update-tiering-structure.dto';
import { TieringStructureService } from './tiering-structure.service';

@Controller('admin/tiering-structure')
@ApiTags('Admin tiering structure')
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
export class TieringStructureController {
  constructor(private readonly tiersService: TieringStructureService) {}

  @Get()
  @ApiOperation({ summary: 'Get tiering structure data' })
  @ApiResponse({ status: 200, type: TiersResponse })
  async getTieringStructure() {
    const res = await this.tiersService.getTiersData();
    return TiersResponse.success(res);
  }

  @Put()
  @ApiOperation({ summary: 'Update tiering structure data' })
  @ApiResponse({ status: 200, type: TiersResponse })
  @ApiResponse({ status: 400, type: TiersErrorDoneNotExist })
  @ApiResponse({ status: 400, type: TiersErrorDuplicate })
  async updateTieringStructure(
    @Body()
    tiersData: TiersDto,
  ) {
    try {
      const res = await this.tiersService.updateTiersData(tiersData.items);
      return TiersResponse.success(res);
    } catch (error) {
      if (typeof error === 'string') {
        if (
          error === TieringStructureResponse.DUPLICATE_NAME ||
          error === TieringStructureResponse.INVALID_TIER_NUMBER ||
          error === TieringStructureResponse.INVALID_STAKING_QUANTITY
        ) {
          throw HttpError.error(HttpStatus.BAD_REQUEST, error, {});
        } else if (error === TieringStructureResponse.NOT_EXIST) {
          throw HttpError.error(HttpStatus.NOT_FOUND, error, {});
        }
      }
      throw error;
    }
  }

  @Post()
  @ApiExcludeEndpoint()
  async addTieringStructure(@Body() tiersData: TieringStructureDto[]) {
    try {
      const res = await this.tiersService.addTiersData(tiersData);
      return TiersResponse.success(res);
    } catch (error) {
      throw error;
    }
  }
}
