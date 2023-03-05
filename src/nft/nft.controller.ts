import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  UnsupportedMediaTypeException,
  Inject,
  Req,
} from '@nestjs/common';
import { NftService } from './nft.service';
import { CreateNftDto } from './dto/create-nft.dto';
import { FractionalizeNFT, UpdateLabelNFT } from './dto/update-nft.dto';
import {
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { GetNFT } from './dto/get-nft.dto';
import {
  GetNFTSResponse,
  NFTErrorResponse,
  NFTErrorResponseFIleLangue,
  NFTNotFound,
  NFTResponse,
  UnAuthorized,
  UpdateLabelNFTResponse,
  ResponseDeleteNftSuccess,
  RespondNotFound,
  NftIsFractionalized,
  ResponseServerError,
  NftValidateFail,
} from './dto/response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Utils } from '../common/utils';
import { Web3Guard } from '../auth/web3.guard';
import {
  API_SUCCESS,
  CommonCode,
  FileUpload,
  NFT_Status,
  NFT_RESPOND_MESSAGE,
  API_ERROR,
} from '../common/constants';
import { InjectModel } from '@nestjs/mongoose';
import { NFT, NFTDocument } from '../schemas/NFT.schema';
import { Model } from 'mongoose';
import { HttpError, HttpValidationError } from '../common/responses/api-errors';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { isInt } from 'class-validator';
import { ErrorDetail } from '../common/responses/api-error';
import { Request } from 'express';
import { UserRole } from '~/schemas';
import { Roles } from '~/auth/roles.decorator';
import { RolesGuard } from '~/auth/roles.guard';

@ApiTags('NFT')
@ApiConsumes('Crud-nft')
@ApiSecurity('token')
@Controller('/nfts')
export class NftController {
  constructor(
    private readonly nftService: NftService,
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}


  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN, UserRole.ADMIN])
  @Get()
  @ApiOperation({
    summary:
      'Get All NFTs and search by name,id,tokenId,status and sort asc,desc by name,id,tokenId ',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetNFTSResponse })
  async getNfts(@Query() getParams: GetNFT) {
    try {
      const pagination = await this.nftService.getNfts({ ...getParams });
      return GetNFTSResponse.success(pagination);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(Web3Guard, RolesGuard)
  @Roles(...[UserRole.SUPPER_ADMIN, UserRole.ADMIN])
  @Get(':id')
  @ApiOperation({ summary: 'Get details NFT' })
  @ApiResponse({ status: HttpStatus.OK, type: NFTResponse })
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, type: NFTNotFound })
  async findOne(@Param('id') id: number) {
    if (!isInt(id)) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        NFT_RESPOND_MESSAGE.ID_INVALID,
        {},
      );
    }
    const nftResponse = await this.nftService.findOne(id);
    // if (nftResponse.code === HttpStatus.NOT_FOUND) {
    //   throw HttpError.error(
    //     HttpStatus.NOT_FOUND,
    //     NFT_RESPOND_MESSAGE.NFT_NOT_FOUND,
    //     {},
    //   );
    // }

    return nftResponse;
  }

}
