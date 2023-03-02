import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CommonCode } from '../constants';

@Injectable()
export class ApiErrorResponse {
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  public code: unknown;

  @ApiProperty({ example: CommonCode.DEFAULT_ERROR_MESSAGE })
  public message: string;

  @ApiProperty()
  public errors: unknown;

  public async error(code: unknown, message: string, errors: unknown) {
    this.message = message;
    this.code = code;
    this.errors = errors;
    return this;
  }
}

export class HttpError extends ApiErrorResponse {
  @ApiProperty({ type: String })
  message: string;

  public static error(code: unknown, message: string, errors: any) {
    const result = new HttpError();
    result.error(code, message, errors);

    return result;
  }
}


export class HttpValidationError extends ApiErrorResponse {
  @ApiProperty({ example: CommonCode.E0 })
  public code: string;

  @ApiProperty({ type: String, example: CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE })
  message: string;

  public static error(code: string, message: string, errors: any) {
    const result = new HttpValidationError();
    result.error(code, message, errors);

    return result;
  }
}

export  class UnsupportedMediaTypeException extends ApiErrorResponse{
  @ApiProperty({ example: CommonCode.E5 })
  public code: string;

  @ApiProperty({ type: String })
  message: string;

  public static error(code: string, message: string, errors: any) {
    const result = new HttpValidationError();
    result.error(code, message, errors);

    return result;
  }
}
