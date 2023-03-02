import { ApiProperty } from '@nestjs/swagger';
import {
  API_ERROR,
  API_SUCCESS,
  CommonCode,
} from '~/common/constants';
import { Pagination } from '~/common/interface';
import { HttpValidationError } from '~/common/responses/api-errors';
import { ApiSuccessResponse } from '~/common/responses/api-success';
import { RewardPool } from '~/schemas';

export class RewardPoolsResult extends ApiSuccessResponse<
  Pagination<RewardPool[]>
> {
  @ApiProperty({ example: API_SUCCESS })
  code: string;

  @ApiProperty({
    type: Pagination,
    properties: {
      items: {
        type: 'array',
        items: { type: 'object', $ref: '#/components/schemas/RewardPool' },
      },
    },
  })
  data: Pagination<RewardPool[]>;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(items: Pagination<RewardPool[]>) {
    const result = new RewardPoolsResult();
    result.success(items);

    return result;
  }
}

export class RewardPoolDetail extends ApiSuccessResponse<RewardPool> {
  @ApiProperty({ example: API_SUCCESS })
  code: string;

  @ApiProperty({
    type: RewardPool,
  })
  data: RewardPool;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(item: any) {
    const result = new RewardPoolDetail();
    result.success(item);

    return result;
  }
}

export class RewardPoolNotFound extends HttpValidationError {
  @ApiProperty({ example: API_ERROR })
  code: string;

  @ApiProperty({ example: 'Reward not found' })
  message: string;

  @ApiProperty({ example: 'Reward not found' })
  errors: string;

  public static error(
    code: CommonCode.E0,
    message: CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
    errors: [],
  ): HttpValidationError {
    return RewardPoolNotFound.error(code, message, errors);
  }
}
