import { Serial } from '../../schemas/serial.schema';
import { ApiSuccessResponse } from '../../common/responses/api-success';
import { ApiProperty } from '@nestjs/swagger';
import { HttpValidationError } from '../../common/responses/api-errors';
import { API_SUCCESS, CommonCode } from '../../common/constants';
import { Pagination } from '../../common/interface';

export class SerialSuccessRes extends ApiSuccessResponse<Serial> {
  @ApiProperty({ type: Serial })
  data: Serial;
  public static success(item: Serial) {
    const result = new SerialSuccessRes();
    result.success(item);

    return result;
  }
}

export class SerialValidattionRes extends HttpValidationError {
  public static error(
    code: CommonCode.E0,
    message: CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
    errors: [],
  ): HttpValidationError {
    return SerialValidattionRes.error(code, message, errors);
  }
}

export class SeriesSuccessRes extends ApiSuccessResponse<Pagination<Serial[]>> {
  @ApiProperty({ example: API_SUCCESS })
  code: string;

  @ApiProperty({
    type: Pagination,
    properties: {
      items: {
        type: 'array',
        items: { type: 'object', $ref: '#/components/schemas/Serial' },
      },
    },
  })
  data: Pagination<Serial[]>;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(items: Pagination<Serial[]>) {
    const result = new SeriesSuccessRes();
    result.success(items);

    return result;
  }
}
