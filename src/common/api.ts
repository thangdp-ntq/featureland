import { HttpException } from '@nestjs/common';

export function ApiError(code = -1, message: any) {
  return new HttpException(
    {
      code,
      message,
    },
    400,
  );
}
