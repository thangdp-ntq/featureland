import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { create } from 'ipfs-http-client';
import { FileInterceptor } from '@nestjs/platform-express';
import {  FileUpload, NFT_RESPOND_MESSAGE } from '../common/constants';
import { Utils } from '../common/utils';
import { ApiError } from '../common/responses/api-error';
import { UploadService } from './upload.service';

@ApiTags('Upload File')
@ApiConsumes('Upload File')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Post('ipfs')
  @ApiOperation({ summary: 'Upload file to ipfs ' })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: Utils.fileFilterImage,
      limits: {
        fileSize: FileUpload.limitFile,
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new ApiError(null, null, NFT_RESPOND_MESSAGE.FILE_FORMAT_NOT_SUPPORT);
    return this.uploadService.uploadFileIpfs(file)
  }

  @Post('s3')
  @ApiOperation({ summary: 'Upload file to s3' })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: Utils.fileFilterImage,
      limits: {
        fileSize: FileUpload.limitFile,
      },
    }),
  )
  async uploadS3(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new ApiError(null, null, NFT_RESPOND_MESSAGE.FILE_FORMAT_NOT_SUPPORT);
    return this.uploadService.uploadFileS3(file)
  }
  getIPFS() {
    const port = Number(process.env.IPFS_PORT);
    return create({ host: process.env.IPS_URI, port });
  }
}
