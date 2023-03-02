import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { HttpError } from '../common/responses/api-errors';
import jwt_decode from 'jwt-decode';

@Injectable()
export class JwtFracTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    if (!headers.authorization) {
      throw HttpError.error(HttpStatus.UNAUTHORIZED, 'Invalid token', {});
    }
    if (headers.authorization.split(' ').length !== 2) {
      throw HttpError.error(HttpStatus.UNAUTHORIZED, 'Invalid token', {});
    }
    if (headers.authorization.split(' ')[0] !== 'Bearer') {
      throw HttpError.error(HttpStatus.UNAUTHORIZED, 'Invalid token', {});
    }
    const decodeJwt: any = jwt_decode(headers.authorization.split(' ')[1]);
    if (!decodeJwt.key || decodeJwt.key !== 'frac-api-key') {
      throw HttpError.error(HttpStatus.UNAUTHORIZED, 'Invalid token', {});
    }
    return true;
  }
}
