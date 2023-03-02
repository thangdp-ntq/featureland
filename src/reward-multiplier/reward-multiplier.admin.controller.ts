import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { RewardMultiplierService } from './reward-multiplier.service';
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
import { RewardMultiplierDto } from './dto/reward-multiplier.dto';

@Controller('admin/reward-multiplier')
@ApiSecurity('token')
@ApiTags('SUPPER ADMIN Reward Multiplier')
export class RewardMultiplierController {
  constructor(
    private readonly rewardMultiplierService: RewardMultiplierService,
  ) {}
  @Get()
  @ApiOperation({ summary: 'Get Reward Multiplier' })
  async findWallet() {
    const rewardMultiplier = await this.rewardMultiplierService.findOne();
    return {
      code: API_SUCCESS,
      data: rewardMultiplier || '',
    };
  }

  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @Put('')
  @ApiOperation({ summary: 'Update Reward Multiplier' })
  @ApiResponse({ type: RewardMultiplierDto })
  async update(@Body() updateRewardMultiplierDto: RewardMultiplierDto) {
    const rewardMultiplier = await this.rewardMultiplierService.update(
      updateRewardMultiplierDto,
    );
    return {
      code: API_SUCCESS,
      data: rewardMultiplier,
      message: COMMON_MESSAGE.UPDATE_SUCCESS_TXT,
    };
  }
}
