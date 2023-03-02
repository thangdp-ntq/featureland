import { ApiProperty } from '@nestjs/swagger';
import { API_SUCCESS, CommonCode } from '../../common/constants';
import { Pagination } from '../../common/interface';
import { ApiSuccessResponse } from '../../common/responses/api-success';
import { User } from '../../schemas';

export class ResponseGetUser extends ApiSuccessResponse<Pagination<User[]>> {
  @ApiProperty({ example: API_SUCCESS })
  code: string;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  @ApiProperty({
    type: Pagination,
    properties: {
      items: {
        type: 'array',
        items: { type: 'object', $ref: '#/components/schemas/User' },
      },
    },
  })
  data: Pagination<User[]>;

  public static success(items: Pagination<User[]>) {
    const result = new ResponseGetUser();
    result.success(items);

    return result;
  }
}
