import {
  Controller,
  Get,
  Body,
  Put,
  UseGuards,
  Post,
  Query,
} from '@nestjs/common';
import { SystemWalletService } from './system-wallet.service';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { API_SUCCESS, COMMON_MESSAGE } from '~/common/constants';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../schemas';
import { Roles } from '../auth/roles.decorator';
import { Web3Guard } from '../auth/web3.guard';
import {
  SearchSystemWalletDto,
  SystemWalletDto,
} from './dto/system-wallet.dto';

@Controller('admin/system-wallet')
@ApiTags('SUPPER ADMIN system-wallet')
export class SystemWalletController {
  constructor(private readonly systemWalletService: SystemWalletService) {}

  @ApiSecurity('token')
  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN, UserRole.ADMIN])
  @Get()
  @ApiOperation({ summary: 'Get All Wallet System' })
  async findWallet(@Query() query: SearchSystemWalletDto) {
    const wallets = await this.systemWalletService.findAllAndGetBalance(query);
    return {
      code: API_SUCCESS,
      data: wallets || '',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create wallet system' })
  async createWallet(@Body() body: SystemWalletDto) {
    const systemWallet = await this.systemWalletService.createWallet(body);
    return {
      code: API_SUCCESS,
      data: systemWallet || '',
    };
  }
}
