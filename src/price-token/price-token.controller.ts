import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '~/auth/roles.decorator';
import { RolesGuard } from '~/auth/roles.guard';
import { Web3Guard } from '~/auth/web3.guard';
import { API_SUCCESS, CommonCode, COMMON_MESSAGE } from '~/common/constants';
import { UserRole } from '~/schemas';
import {
  CreateTokenDto,
  TokenFilterDto,
  UpdateTokenDto,
} from './dto/create-token.dto';
import { PriceTokenService } from './price-token.service';

@ApiSecurity('token')
@ApiTags('Admin Token Address')
@Controller('admin/token-address')
export class PriceTokenController {
  constructor(private readonly tokenService: PriceTokenService) {}
  @UseGuards(Web3Guard)
  @Get()
  @ApiOperation({ summary: 'Get List Token' })
  async findWallet(@Query() query: TokenFilterDto) {
    const listCurrency = await this.tokenService.getList(query);
    return {
      code: API_SUCCESS,
      messsages: CommonCode.DEFAULT_SUCCESS_MESSAGE,
      data: listCurrency || '',
    };
  }

  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @Post()
  @ApiOperation({ summary: 'Create New Currency' })
  async create(@Body() data: CreateTokenDto) {
    const currency = await this.tokenService.create(data);
    return {
      code: API_SUCCESS,
      data: currency,
      message: COMMON_MESSAGE.CREATE_SUCCESS_TXT,
    };
  }

  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @Put(':id')
  @ApiOperation({ summary: 'Update Status Currency' })
  async update(@Param('id') id: string, @Body() data: UpdateTokenDto) {
    const currency = await this.tokenService.update(id, data);
    return {
      code: API_SUCCESS,
      data: currency,
      message: COMMON_MESSAGE.UPDATE_SUCCESS_TXT,
    };
  }

  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN])
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Currency' })
  async delete(@Param('id') id: string) {
    const currency = await this.tokenService.delete(id);
    return {
      code: API_SUCCESS,
      data: currency,
      message: COMMON_MESSAGE.UPDATE_SUCCESS_TXT,
    };
  }

  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN, UserRole.ADMIN])
  @Get(':id')
  @ApiOperation({ summary: 'Get Currency' })
  async findOne(@Param('id') address: string) {
    const currency = await this.tokenService.findByContract(address);
    return {
      code: API_SUCCESS,
      data: currency,
      message: COMMON_MESSAGE.CREATE_SUCCESS_TXT,
    };
  }
}
