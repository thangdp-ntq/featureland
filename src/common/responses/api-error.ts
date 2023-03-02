import { HttpException, HttpStatus } from "@nestjs/common";
import { API_ERROR } from "../constants";

export class ApiError extends HttpException {
  constructor(data?: any, error?: any, message?: string) {
    const response = {
      message: message,
      data: data,
      error: error,
      code: API_ERROR,
    };
    super(response, HttpStatus.BAD_REQUEST);
  }
}

export class ErrorDetail {
  message: string;
  errors: string;
  constructor(message?: any, errors?: any) {
    this.message = message;
    this.errors = errors;
  }
}