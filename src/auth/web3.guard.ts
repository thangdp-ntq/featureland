import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  CACHE_MANAGER,
  Inject,
} from '@nestjs/common';
import { ApiError } from '../common/responses/api-error';
import { HttpError } from '../common/responses/api-errors';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { CommonService } from '~/common-service/common.service';
import { UserRole } from '~/schemas';
import { EventsGateway } from '~/socket/socket.gateway';
import { EVENT_SOCKET } from '~/common/constants';
@Injectable()
export class Web3Guard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
   // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly commonService: CommonService,
    private readonly eventsGateway: EventsGateway,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    if (!headers.token) {
      throw HttpError.error(HttpStatus.UNAUTHORIZED, 'Invalid token', {});
    }
    try {
      const token = headers.token;
      const payload = await this.jwtService.verify(token);
      const { address, exp } = payload;

      if (exp * 1000 < Date.now()) {
        throw HttpError.error(HttpStatus.UNAUTHORIZED, 'Expired token', {});
      }

      request.address = address;
      request.user = payload;
      const checkTime = await this.commonService.checkTimeAllowLogin(address);
      if (checkTime === false && request.user.role === UserRole.ADMIN) {
        this.eventsGateway.sendMessage(
          EVENT_SOCKET.UPDATE_ADMIN,
          'Admin not allowed to login in time',
        );
        throw HttpError.error(HttpStatus.UNAUTHORIZED, 'E10000', ['E10000']);
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.error(HttpStatus.UNAUTHORIZED, 'Invalid token', {});
    }
  }
}
