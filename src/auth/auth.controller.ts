import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { HttpError } from '~/common/responses/api-errors';
import { ApiSuccessResponse } from '~/common/responses/api-success';
import { UserRole } from '~/schemas';
import { API_ERROR, API_SUCCESS, CommonCode } from '../common/constants';
import { AuthService } from './auth.service';
import { ConnectWalletDto } from './dto/login.dto';
import { Roles } from './roles.decorator';
import { Web3Guard } from './web3.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('connect-wallet')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify wallet address' })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      properties: {
        code: { type: 'string', example: API_SUCCESS },
        message: {
          type: 'string',
          example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
        },
        data: { type: 'object', example: {} },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      properties: {
        code: { type: 'string', example: API_ERROR },
        message: { type: 'string', example: '' },
        errors: { type: 'object', example: {} },
        data: { type: 'object', example: {} },
      },
    },
  })
  async connectWallet(@Body() params: ConnectWalletDto) {
    try {
      const result = await this.authService.connectWallet(params);
      if (
        result &&
        typeof result !== 'object' &&
        result === HttpStatus.BAD_REQUEST
      ) {
        return HttpError.error(
          HttpStatus.BAD_REQUEST,
          'Can not connect to this wallet',
          [],
        );
      }
      return new ApiSuccessResponse<unknown>().success(result, '');
    } catch (error) {
      throw error;
    }
  }

  @Post('disconnect-wallet')
  @ApiSecurity('token')
  @UseGuards(Web3Guard)
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Logout function' })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      properties: {
        code: { type: 'string', example: API_SUCCESS },
        message: {
          type: 'string',
          example: CommonCode.DEFAULT_SUCCESS_MESSAGE,
        },
        data: { type: 'boolean', example: true },
      },
    },
  })
  async disconnectWallet(@Request() req) {
    try {
      const {
        user: { hashToken },
        headers: { token },
      } = req;
      return await this.authService.logout(
        token as string,
        hashToken as string,
      );
    } catch (error) {
      throw error;
    }
  }
}
