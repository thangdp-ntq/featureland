import {
  Controller,
  Get,
  Body,
  UseInterceptors,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  Headers,
  HttpStatus,
  Put,
  Req,
} from '@nestjs/common';
import { HistoryReportService } from './history-report.service';
import { CreateHistoryReportDto } from './dto/create-history-report.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Utils } from '../common/utils';
import {
  ADMIN_NOT_FOUND,
  API_SUCCESS,
  CommonCode,
  FileUpload,
  NFT_RESPOND_MESSAGE,
} from '../common/constants';
import { ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Web3Guard } from '../auth/web3.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '~/schemas';
import { HttpError } from '../common/responses/api-errors';

@Controller('admin/history-report')
@ApiTags('History report')
@ApiSecurity('token')
export class HistoryReportController {
  constructor(
    private readonly historyReportService: HistoryReportService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @ApiConsumes('multipart/form-data')
  @UseGuards(Web3Guard)
  @Put()
  @ApiOperation({ summary: 'update history report' })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: Utils.fileFilterPdf,
    }),
  )
  async create(
    @Req() req,
    @Headers() headers,
    @Body() createHistory: CreateHistoryReportDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new UnsupportedMediaTypeException({
        code: CommonCode.E5,
        message: NFT_RESPOND_MESSAGE.FILE_IS_REQUIRE,
        errors: {},
      });
    }
    if (FileUpload.limitFilePdf < file.size) {
      throw new UnsupportedMediaTypeException({
        code: CommonCode.E3,
        message: NFT_RESPOND_MESSAGE.FILE_SIZE_LIMIT_10MB_ERROR,
        errors: {},
      });
    }
    
    const user = await this.userModel.findOne({
      address: req.address,
    });
    if (!user) {
      throw HttpError.error(HttpStatus.NOT_FOUND, ADMIN_NOT_FOUND, {});
    }

    const report = await this.historyReportService.create(file, user.id,createHistory.language);

    return {
      code: API_SUCCESS,
      data: report,
      message: '',
      error: {},
    };
  }

  @Get('')
  @ApiOperation({ summary: 'get history report' })
  async findOne() {
    const reportHistory = await this.historyReportService.getHistoryReport();
    return {
      code: API_SUCCESS,
      data: reportHistory,
      message: '',
      error: {},
    };
  }
}
