import {
    Controller,
    Get,
    HttpStatus,
    Query,
  } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeriesAllFilterDto } from './dto/crud-series.dto';
import { SeriesSuccessRes } from './responses/api-response';
import { SeriesService } from './series.service';
import { API_SUCCESS } from '~/common/constants';

  @Controller('users/series')
  @ApiTags('Users')
  export class SeriesUserController {
    constructor(private readonly seriesService: SeriesService) {}
    @Get()
    @ApiOperation({ summary: 'Get Series for Users' })
    @ApiResponse({ status: HttpStatus.OK, type: SeriesSuccessRes })
    async getListSeries(@Query() query: SeriesAllFilterDto) {
      const series = await this.seriesService.findAllSeriesUser(query);
  
      return {
          code:API_SUCCESS,
          data:series
      }
    }
  }
  