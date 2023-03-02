import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Web3Guard } from '../auth/web3.guard';
import {
  API_ERROR,
  CommonCode,
  PURCHASE_F_NFT_RESPONSE,
} from '../common/constants';
import { ErrorDetail } from '../common/responses/api-error';
import { HttpError, HttpValidationError } from '../common/responses/api-errors';
import { ApiSuccessResponse } from '../common/responses/api-success';
import { UserRole } from '../schemas';
import { PurchaseFNFTDto } from './dto/purchase-f-nft.dto';
import { PurchaseFNftService } from './purchase-f-nft.service';
import { BigNumber } from 'bignumber.js';

@Controller('purchase-f-nft')
@ApiTags('Users')
@ApiSecurity('token')
@UseGuards(Web3Guard)
@Roles(UserRole.USER)
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  schema: {
    properties: {
      code: { type: 'string', example: API_ERROR },
      message: { type: 'string', example: 'unauthorized' },
      errors: { type: 'array', example: ['You are unauthorized'] },
    },
  },
})
export class PurchaseFNftUserController {
  constructor(private readonly purchaseFNFTService: PurchaseFNftService) {}

  @Post()
  @ApiOperation({ summary: 'Purchase F-NFT' })
  async purchaseFNFT(@Body() purchaseData: PurchaseFNFTDto) {
    if (new BigNumber(purchaseData.amount).isLessThanOrEqualTo(0))
      throw HttpValidationError.error(
        CommonCode.E0,
        CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
        [PURCHASE_F_NFT_RESPONSE.AMOUNT_GREATER_0],
      );
    try {
      const purchaseDB = await this.purchaseFNFTService.handlePurchaseFNFT(
        purchaseData,
      );
      return new ApiSuccessResponse<unknown>().success(
        purchaseDB,
        'Purchase F-NFT success',
      );
    } catch (error) {
      if (error instanceof ErrorDetail) {
        throw HttpError.error(
          HttpStatus.BAD_REQUEST,
          error.message,
          error.errors,
        );
      }
      throw error;
    }
  }
}
