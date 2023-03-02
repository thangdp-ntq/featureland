import { ApiProperty } from '@nestjs/swagger';
import {
  API_ERROR,
  API_SUCCESS,
  CommonCode,
  POOL_TIERING_MESSAGE,
} from '../../common/constants';
import { Pagination } from '../../common/interface';
import { ApiSuccessResponse } from '../../common/responses/api-success';
import { HistoryStaking } from '../../schemas';
import { TieringPool } from '../../schemas/pool-tiering.schema';

export class ResponseGetTieringPoolOk extends ApiSuccessResponse<
  Pagination<TieringPool[]>
> {
  @ApiProperty({ example: API_SUCCESS })
  code: string;

  @ApiProperty({
    type: Pagination,
    properties: {
      items: {
        type: 'array',
        items: { type: 'object', $ref: '#/components/schemas/TieringPool' },
      },
    },
  })
  data: Pagination<TieringPool[]>;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(items: Pagination<TieringPool[]>) {
    const result = new ResponseGetTieringPoolOk();
    result.success(items);

    return result;
  }
}

export class ResponseGetHistoryOk extends ApiSuccessResponse<
  Pagination<HistoryStaking[]>
> {
  @ApiProperty({ example: API_SUCCESS })
  code: string;

  @ApiProperty({
    type: Pagination,
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          $ref: '#/components/schemas/HistoryStaking',
          example: [
            {
              _id: '6269f8d996f49dbdf715d332',
              userAddress: '0x028E149dE3e2e257e5b8B4fdd7BE74af75a574b1',
              value: 1000,
              type: 1,
              balance: 1000,
              createdAt: '2022-04-28T02:15:53.477Z',
            },
            {
              _id: '626768fba43b02c70d78914d',
              userAddress: '0x028E149dE3e2e257e5b8B4fdd7BE74af75a574b1',
              value: 2,
              type: 1,
              balance: 100,
              createdAt: '2022-04-25T03:37:31.279Z',
            },
          ],
        },
      },
    },
  })
  data: Pagination<HistoryStaking[]>;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(items: Pagination<HistoryStaking[]>) {
    const result = new ResponseGetHistoryOk();
    result.success(items);

    return result;
  }
}

export class ResponseGetDetailsPool {
  @ApiProperty({ example: API_SUCCESS })
  code: string;

  @ApiProperty({
    type: TieringPool,
  })
  data: TieringPool;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;
}

export class PoolTieringNotFound {
  @ApiProperty({ example: API_ERROR })
  code: string;

  @ApiProperty({ example: POOL_TIERING_MESSAGE.POOL_NOT_FOUND })
  message: string;
}

export class ValidateError {
  @ApiProperty({ example: CommonCode.E0 })
  code: string;

  @ApiProperty({ example: CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE })
  message: string;

  @ApiProperty({ example: [] })
  errors;
}
