import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Req,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '~/auth/jwt-auth.guard';
import {
  HistoryStakingResult,
  HomeFNFTPoolsResult,
  HomeHistoryReportResult,
  HomePathResult,
  HomeSectionResult,
} from './responses/api-response';
import { HomeFNFTSearchDto, HomeUserSearchDto } from './dto/home-user.dto';
import { HistoryReportService } from '~/history-report/history-report.service';
import { JwtFracTokenGuard } from '~/auth/jwt-frac-token.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly historyReportService: HistoryReportService,
  ) {}

  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  findByAddress(@Request() req) {
    return this.usersService.findByAddress(req.user.address);
  }

  @Get('/home')
  @ApiOperation({ summary: 'Get Pool by Stages' })
  @ApiResponse({ type: HomeSectionResult })
  async home(@Query() params: HomeUserSearchDto) {
    const data = await this.usersService.home(params);
    return HomeSectionResult.success(data);
  }

  @Get('/paths')
  @ApiOperation({ summary: 'Get Paths Users' })
  @ApiResponse({ type: HomePathResult })
  async getPaths() {
    const data = await this.usersService.getPaths();
    return HomePathResult.success(data);
  }

  @Get('/fnft-pools')
  @ApiOperation({ summary: 'Get All FNFT Pool Users' })
  @ApiResponse({ type: HomeFNFTPoolsResult })
  async getAllFNFTPools(@Query() params: HomeFNFTSearchDto, @Req() req) {
    const data = await this.usersService.getAllFNFTPools(params, req);
    return HomeFNFTPoolsResult.success(data);
  }

  @Get('/history-report')
  @ApiOperation({ summary: 'Get History Report Users' })
  @ApiResponse({ type: HomeHistoryReportResult })
  async getHistoryReport() {
    const data = await this.historyReportService.getHistoryReport();
    return HomeHistoryReportResult.success(data);
  }

  @ApiExcludeEndpoint()
  @UseGuards(JwtFracTokenGuard)
  @Get('/history-staking/:userAddress')
  @ApiResponse({ type: HistoryStakingResult })
  @ApiOperation({ summary: 'Get History Staking Users' })
  async getStakingHistory(@Param('userAddress') userAddress: string) {
    const data = await this.usersService.getStakingHistory(userAddress);
    return HistoryStakingResult.success(data);
  }
}
