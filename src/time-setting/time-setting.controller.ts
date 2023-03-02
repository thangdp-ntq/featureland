import {
  Controller,
  Get,
  Body,
  Put,
  UseGuards,
  Post,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { TimeSettingService } from './time-setting.service';
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
import {
  TimeSettingDto,
  UpdateTimeSettingDto,
  GetTimeSettingDto,
} from './dto/time-setting.dto';

@Controller('admin/time-setting')
@ApiSecurity('token')
@ApiTags('SUPPER ADMIN Time Setting')
export class TimeSettingController {
  constructor(private readonly timeSettingService: TimeSettingService) {}
  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN, UserRole.ADMIN])
  @Get()
  @ApiOperation({ summary: 'Get Time Setting' })
  async getTimeSetting(@Query() query: GetTimeSettingDto) {
    const timeSetting = await this.timeSettingService.find(query);
    return {
      code: API_SUCCESS,
      data: timeSetting || '',
    };
  }

  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @Put(':id')
  @ApiOperation({ summary: 'Update Time Setting' })
  async update(@Param('id') id: string, @Body() data: UpdateTimeSettingDto) {
    const timeSetting = await this.timeSettingService.update(id, data);
    return {
      code: API_SUCCESS,
      data: timeSetting,
      message: COMMON_MESSAGE.UPDATE_SUCCESS_TXT,
    };
  }

  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @Post('')
  @ApiOperation({ summary: 'Create Time Setting' })
  async create(@Body() updateTimeSettingrDto: TimeSettingDto) {
    const timeSetting = await this.timeSettingService.create(
      updateTimeSettingrDto,
    );
    return {
      code: API_SUCCESS,
      data: timeSetting,
      message: COMMON_MESSAGE.UPDATE_SUCCESS_TXT,
    };
  }

  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Time Setting' })
  async delete(@Param('id') id: string) {
    const timeSetting = await this.timeSettingService.delete(id);
    return {
      code: API_SUCCESS,
      data: timeSetting,
      message: COMMON_MESSAGE.DELETE_SUCCESS_TXT,
    };
  }
}
