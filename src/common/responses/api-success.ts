import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { API_SUCCESS, CommonCode } from '../constants';

@Injectable()
export class ApiSuccessResponse<T> {
  @ApiProperty({ example: API_SUCCESS })
  public code: string;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  public message: string;

  @ApiProperty()
  public data: T;

  public async success(data?: T, message?: string) {
    this.code = API_SUCCESS;
    this.message = message || CommonCode.DEFAULT_SUCCESS_MESSAGE;
    this.data = data;

    return this;
  }
}

export class ApiSuccessBoolDataOnly extends ApiSuccessResponse<boolean> {
  @ApiProperty({ example: API_SUCCESS })
  public code: string;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  public message: string;

  @ApiProperty()
  public data: boolean;

  public static success(isSuccess: boolean) {
    const result = new ApiSuccessBoolDataOnly();
    result.success(isSuccess);

    return result;
  }
}
