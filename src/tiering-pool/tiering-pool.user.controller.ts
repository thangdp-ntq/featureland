import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetHistoryTransactionParams } from './dto/get-tiering-pool.dto';
import { ResponseGetHistoryOk, ValidateError } from './dto/reponse.dto';
import { TieringPoolService } from './tiering-pool.service';
import { API_SUCCESS } from '~/common/constants';

@Controller('user/tiering-pool')
@ApiTags('Users')
export class TieringControllerUser {
  constructor(private readonly tieringPoolService: TieringPoolService) {}

  @Get('history')
  @ApiOperation({ summary: 'History TieringPool User' })
  @ApiResponse({ status: HttpStatus.OK, type: ResponseGetHistoryOk })
  @ApiResponse({ status: HttpStatus.OK, type: ValidateError })
  async getHistoryTransaction(@Query() getParams: GetHistoryTransactionParams) {
    const history = await this.tieringPoolService.getHistoryTransaction(
      getParams,
    );
    return {
      code: API_SUCCESS,
      data: history,
    };
  }
}
