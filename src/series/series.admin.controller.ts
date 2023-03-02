import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  Put,
  Param,
  Query,
  Delete,
  Req,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { SeriesService } from './series.service';
import {
  CreateSeriesDto,
  SeriesFilterDto,
  UpdateSeriesDto,
} from './dto/crud-series.dto';
import {
  ADMIN_NOT_FOUND,
  API_ERROR,
  CommonCode,
  SERIAL_RESPONSE_MESSAGE,
} from '../common/constants';
import { Web3Guard } from '../auth/web3.guard';
import { HttpError, HttpValidationError } from '../common/responses/api-errors';
import {
  SerialSuccessRes,
  SerialValidattionRes,
  SeriesSuccessRes,
} from './responses/api-response';
import { isMongoId } from 'class-validator';
import {
  ResponseDeleteSerialSuccess,
  SerialNotFound,
  UnAuthorized,
} from './dto/response.dto';
import { Request } from 'express';
import { RolesGuard } from '~/auth/roles.guard';
import { UserRole } from '~/schemas';
import { Roles } from '~/auth/roles.decorator';

@ApiTags('Admin series')
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
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  schema: {
    properties: {
      code: { type: 'string', example: API_ERROR },
      message: { type: 'string', example: ADMIN_NOT_FOUND },
      errors: { type: 'array', example: [ADMIN_NOT_FOUND] },
    },
  },
})
@Controller('admin/series')
export class SeriesAdminController {
  constructor(private readonly seriesService: SeriesService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.OK, type: SerialSuccessRes })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: SerialValidattionRes })
  async create(@Body() params: CreateSeriesDto, @Req() req: Request) {
    const exists = await this.seriesService.findOne({
      'name.en': params.name.en,
    });
    const existsCn = await this.seriesService.findOne({
      'name.cn': params.name.cn,
    });
    const existsJp = await this.seriesService.findOne({
      'name.jp': params.name.jp,
    });
    if (exists || existsCn || existsJp) {
      throw HttpValidationError.error(
        CommonCode.E0,
        CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        ['The names of the series cannot be the same'],
      );
    }
    const serial = await this.seriesService.create(params, req.user);

    return SerialSuccessRes.success(serial);
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, type: SerialSuccessRes })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: API_ERROR },
        message: { type: 'string', example: CommonCode.DEFAULT_ERROR_MESSAGE },
        errors: { type: 'array', example: ['Serial not found or deleted'] },
      },
    },
  })
  async getDetail(@Param('id') id: string) {
    if (!isMongoId(id)) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        CommonCode.DEFAULT_ERROR_MESSAGE,
        ['ID is invalid'],
      );
    }
    const serial = await this.seriesService.findById(id);
    if (!serial) {
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        CommonCode.DEFAULT_ERROR_MESSAGE,
        ['Serial not found or deleted'],
      );
    }

    return serial;
  }

  @Put('delete/:id')
  @UseGuards(Web3Guard)
  @ApiResponse({ status: HttpStatus.OK, type: ResponseDeleteSerialSuccess })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnAuthorized })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: SerialNotFound })
  async delete(@Param('id') id: string, @Req() req: Request) {
    const serial = await this.seriesService.findOne({ _id: id });
    if (!serial)
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        SERIAL_RESPONSE_MESSAGE.SERIAL_NOT_FOUND,
        {},
      );
    const serialExistsInPools = await this.seriesService.existInPools(id);
    if (serialExistsInPools) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        SERIAL_RESPONSE_MESSAGE.SERIAL_EXIST_IN_POOL,
        {},
      );
    }
    return this.seriesService.delete(id, req.user);
  }

  @Put('restore/:id')
  @UseGuards(Web3Guard)
  @ApiResponse({ status: HttpStatus.OK, type: ResponseDeleteSerialSuccess })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnAuthorized })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: SerialNotFound })
  async restore(@Param('id') id: string) {
    const serial = await this.seriesService.findOne({ _id: id });
    if (!serial)
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        SERIAL_RESPONSE_MESSAGE.SERIAL_NOT_FOUND,
        {},
      );
    return this.seriesService.restore(id);
  }

  @Put('restore-all')
  @UseGuards(Web3Guard)
  @ApiResponse({ status: HttpStatus.OK, type: ResponseDeleteSerialSuccess })
  async restoreAll() {
    const response = await this.seriesService.restoreAll();
    return response;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Seri' })
  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @ApiResponse({ status: HttpStatus.OK, type: ResponseDeleteSerialSuccess })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnAuthorized })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: SerialNotFound })
  async remove(@Param('id') id: string) {
    const serial = await this.seriesService.findOne({ _id: id });
    if (!serial)
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        SERIAL_RESPONSE_MESSAGE.SERIAL_NOT_FOUND,
        {},
      );
    const serialExistsInPools = await this.seriesService.existInPools(id);
    if (serialExistsInPools) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        SERIAL_RESPONSE_MESSAGE.SERIAL_EXIST_IN_POOL,
        {},
      );
    }
    return this.seriesService.remove(id);
  }

  @Put(':id')
  @ApiResponse({ status: HttpStatus.OK, type: SerialSuccessRes })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: SerialValidattionRes })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: API_ERROR },
        message: { type: 'string', example: CommonCode.DEFAULT_ERROR_MESSAGE },
        errors: { type: 'array', example: ['Serial not found'] },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: API_ERROR },
        message: { type: 'string', example: CommonCode.DEFAULT_ERROR_MESSAGE },
        errors: { type: 'array', example: ['Update serial error'] },
      },
    },
  })
  async update(@Param('id') id: string, @Body() params: UpdateSeriesDto) {
    if (!isMongoId(id)) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        CommonCode.DEFAULT_ERROR_MESSAGE,
        ['ID is invalid'],
      );
    }

    const exists = await this.seriesService.findOne({
      'name.en': params.name.en,
    });
    const existsCn = await this.seriesService.findOne({
      'name.cn': params.name.cn,
    });
    const existsJp = await this.seriesService.findOne({
      'name.jp': params.name.jp,
    });
    if (
      (exists && exists.id !== id) ||
      (existsCn && existsCn.id !== id) ||
      (existsJp && existsJp.id !== id)
    ) {
      throw HttpValidationError.error(
        CommonCode.E0,
        CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        ['The names of the series cannot be the same'],
      );
    }

    const data = await this.seriesService.findById(id);
    if (!data) {
      throw HttpError.error(
        HttpStatus.NOT_FOUND,
        CommonCode.DEFAULT_ERROR_MESSAGE,
        ['Serial not found'],
      );
    }

    const update = await this.seriesService.update(id, params);
    if (!update) {
      throw HttpError.error(
        HttpStatus.UNPROCESSABLE_ENTITY,
        CommonCode.DEFAULT_ERROR_MESSAGE,
        ['Update serial error'],
      );
    }

    return SerialSuccessRes.success(update);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: SeriesSuccessRes })
  async getListSeries(@Query() query: SeriesFilterDto) {
    const series = await this.seriesService.getList(query);
    return SeriesSuccessRes.success(series);
  }
}
