import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  API_ERROR,
  API_SUCCESS,
  CommonCode,
  NFT_RESPOND_MESSAGE,
} from '../../common/constants';
import { Pagination } from '../../common/interface';
import { ApiErrorResponse } from '../../common/responses/api-errors';
import { ApiSuccessResponse } from '../../common/responses/api-success';
import { NFT } from '../../schemas/NFT.schema';

export class NFTResponse extends ApiSuccessResponse<NFT> {
  @ApiProperty({ example: HttpStatus.CREATED })
  code: string;

  @ApiProperty({ type: Object })
  data;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(nft: NFT) {
    const result = new NFTResponse();
    result.success(nft);

    return result;
  }
}

export class RespondNotFound {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({ example: NFT_RESPOND_MESSAGE.LABEL_NFT_NOT_FOUND })
  message: string;
}

export class ResponseNftDuplicateName {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({ example: NFT_RESPOND_MESSAGE.NFT_NAME_DUPLICATE_NAME })
  message: string;
}

export class NFTErrorResponse extends ApiErrorResponse {
  @ApiProperty({ example: CommonCode.E4 })
  code: number;

  @ApiProperty({
    type: String,
    example: NFT_RESPOND_MESSAGE.FILE_FORMAT_NOT_SUPPORT,
  })
  message: string;

  public static error(code: number, message: string, errors: any) {
    const result = new NFTErrorResponse();
    result.error(code, message, errors);

    return result;
  }
}

export class NFTErrorResponseFIleLangue extends ApiErrorResponse {
  @ApiProperty({ example: CommonCode.E3 })
  code: number;

  @ApiProperty({ type: String, example: NFT_RESPOND_MESSAGE.FILE_SIZE_ERROR })
  message: string;

  public static error(code: number, message: string, errors: any) {
    const result = new NFTErrorResponse();
    result.error(code, message, errors);

    return result;
  }
}

export class DataGetNfts {
  @ApiProperty({ example: 123 })
  _id: string;

  @ApiProperty({ example: 'Leo' })
  NFTname: string;

  @ApiProperty({ example: 'UF' })
  status: string;

  @ApiProperty({})
  createdAt: Date;
}
export class GetNFTSResponse extends ApiSuccessResponse<Pagination<NFT[]>> {
  @ApiProperty({ example: HttpStatus.OK })
  code: string;

  @ApiProperty({
    type: Pagination,
    properties: {
      items: {
        type: 'array',
        items: { type: 'object' },
      },
    },
  })
  data: Pagination<[]>;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(items: Pagination<[]>) {
    const result = new GetNFTSResponse();
    result.success(items);

    return result;
  }
}

export class DeleteSuccess {}

export class UnAuthorized {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({ example: 'Invalid token' })
  message: string;
}

export class NFTNotFound {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  code: number;

  @ApiProperty({ example: 'NFT not found' })
  message: string;
}

export class UpdateLabelNFTResponse {
  @ApiProperty({ example: HttpStatus.OK })
  code: number;

  @ApiProperty({ example: 'Update success' })
  message: string;
}

export class ResponseDeleteNftSuccess {
  @ApiProperty({ example: API_SUCCESS })
  code: number;

  @ApiProperty({ example: NFT_RESPOND_MESSAGE.NFT_DELETE_SUCCESS })
  message: string;
}

export class NftValidateFail {
  @ApiProperty({ example: CommonCode.E0 })
  code: number;

  @ApiProperty({ example: CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE })
  message: string;

  @ApiProperty({
    example: [
      'field name must be shorter than or equal to 256 characters',
      'field name must be a string',
      'field name should not be empty',
    ],
  })
  errors;
}

export class NftIsFractionalized {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({ example: NFT_RESPOND_MESSAGE.NFT_IS_FRACTIONALIZED })
  message: string;
}

export class ResponseServerError {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({ example: NFT_RESPOND_MESSAGE.NFT_SERVER_ERROR })
  message: string;
}
