import { ApiProperty } from '@nestjs/swagger';
import { ApiErrorResponse } from '../../common/responses/api-errors';
import {
  API_ERROR,
  API_SUCCESS,
  CommonCode,
  TieringStructureResponse,
} from '../../common/constants';
import { ApiSuccessResponse } from '../../common/responses/api-success';
import { TieringStructureDto } from './update-tiering-structure.dto';

export class TiersResponse extends ApiSuccessResponse<[TieringStructureDto]> {
  @ApiProperty({ example: API_SUCCESS })
  code: string;

  @ApiProperty({ type: [TieringStructureDto] })
  data: [TieringStructureDto];

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(tiers: [TieringStructureDto]) {
    const result = new TiersResponse();
    result.success(tiers);

    return result;
  }
}

export class TiersErrorDoneNotExist extends ApiErrorResponse {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({
    type: String,
    example: `Tier 1 ${TieringStructureResponse.NOT_EXIST}`,
  })
  message: string;

  public static error(code: number, message: string, errors: any) {
    const result = new TiersErrorDoneNotExist();
    result.error(code, message, errors);

    return result;
  }
}

export class TiersErrorDuplicate extends ApiErrorResponse {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({
    type: String,
    example: `Tier 1 ${TieringStructureResponse.DUPLICATE_NAME}`,
  })
  message: string;

  public static error(code: number, message: string, errors: any) {
    const result = new TiersErrorDoneNotExist();
    result.error(code, message, errors);

    return result;
  }
}
