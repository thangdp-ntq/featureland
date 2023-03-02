import { Controller, Get, Body, Put, UseGuards, Post } from '@nestjs/common';
import { SettingWalletService } from './setting-wallet.service';
import {
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
import { GasLimitDto, SettingWalletDto } from './dto/setting-wallet.dto';

@Controller('admin/setting-wallet')
@ApiTags('SUPPER ADMIN Setting Wallet')
export class SettingWalletController {
  constructor(private readonly settingWalletService: SettingWalletService) {}
  @ApiSecurity('token')
  @Get()
  @ApiOperation({ summary: 'Get Setting Wallet' })
  async findWallet() {
    const settingWallet = await this.settingWalletService.findOne();
    return {
      code: API_SUCCESS,
      data: settingWallet || '',
    };
  }

  @ApiSecurity('token')
  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @Put('')
  @ApiOperation({ summary: 'Update Setting Wallet' })
  async update(@Body() body: SettingWalletDto) {
    const settingWallet = await this.settingWalletService.update(body);
    return {
      code: API_SUCCESS,
      data: settingWallet,
      message: COMMON_MESSAGE.UPDATE_SUCCESS_TXT,
    };
  }

  @Post('/gas-limit')
  @ApiOperation({ summary: 'Update Gas Limit' })
  async updateGasLimit(@Body() body: GasLimitDto) {
    const gasLimit = await this.settingWalletService.updateGasLimit(body);
    return {
      code: API_SUCCESS,
      data: gasLimit,
      message: COMMON_MESSAGE.UPDATE_SUCCESS_TXT,
    };
  }
}
