import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  API_ERROR,
  API_SUCCESS,
  CommonCode,
  messsage,
} from '../common/constants';
import { HttpError } from '../common/responses/api-errors';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Web3Guard } from './web3.guard';

@ApiTags('Admin auth')
@Controller('admin/auth')
export class AuthAdminController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-admin')
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
  async login(@Body() requestData: LoginDto) {
    try {
    } catch (error) {
      if (typeof error === 'string' && error === CommonCode.NOT_ADMIN) {
        throw HttpError.error(HttpStatus.BAD_REQUEST, messsage.E2, {});
      }
      if (typeof error === 'string' && error === CommonCode.ADMIN_NOT_ACCESS) {
        throw HttpError.error(HttpStatus.UNAUTHORIZED, messsage.E10000, {});
      }
      throw error;
    }
  }

  @Post('logout')
  @ApiSecurity('token')
  @UseGuards(Web3Guard)
  @HttpCode(HttpStatus.OK)
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
  async logout(@Req() req) {
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
