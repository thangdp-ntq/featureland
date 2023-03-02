import {
  Catch,
  ArgumentsHost,
  InternalServerErrorException,
  HttpStatus,
  UnsupportedMediaTypeException,
  ForbiddenException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { API_ERROR, CommonCode } from '../constants';
import { HttpError, HttpValidationError } from '../responses/api-errors';

@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);
  constructor() {
    super();
  }
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // const status = exception.getStatus();
    if (exception instanceof HttpException) {
      this.logger.debug(`Error ${request.method} ${request.originalUrl}`);
      this.logger.debug(exception.message, exception.stack);
    }
    if (exception instanceof HttpError) {
      response.status(+exception.code).json({
        code: API_ERROR,
        message: exception.message,
        errors: exception.errors,
      });
    } else if (exception instanceof UnsupportedMediaTypeException) {
      const res = exception.getResponse() as Record<string, any>;
      response.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).json({
        code: res.code,
        message: exception.message,
        errors: res.errors,
      });
    } else if (exception instanceof HttpValidationError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        code: CommonCode.E0,
        message: exception.message,
        errors: exception.errors,
      });
    } else if (exception instanceof ForbiddenException) {
      response.status(HttpStatus.FORBIDDEN).json({
        code: API_ERROR,
        message: exception.message,
        errors: [exception.message],
      });
    } else if (
      exception instanceof InternalServerErrorException ||
      exception instanceof Error
    ) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: API_ERROR,
        message: exception.message,
        errors: {},
      });
    } else {
      super.catch(exception, host);
    }
  }
}
