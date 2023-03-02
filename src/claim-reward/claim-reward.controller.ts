import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import BigNumber from 'bignumber.js';
import {
  API_SUCCESS,
  CLAIM_RESPOND,
  CommonCode,
  POOL_NFT_MESSAGE,
  PURCHASE_F_NFT_RESPONSE,
} from '../common/constants';
import { HttpValidationError } from '../common/responses/api-errors';
import { ClaimRewardService } from './claim-reward.service';
import { CreateClaimRewardDto } from './dto/create-claim-reward.dto';

@Controller('claim-reward')
@ApiTags('Users')
export class ClaimRewardController {
  constructor(private readonly claimRewardService: ClaimRewardService) {}

  @Post()
  @ApiOperation({ summary: 'api user claim reward' })
  async create(@Body() createClaimRewardDto: CreateClaimRewardDto) {
    if (new BigNumber(createClaimRewardDto.amount).isLessThanOrEqualTo(0))
      throw HttpValidationError.error(
        CommonCode.E0,
        CLAIM_RESPOND.AMOUNT_GREATER_THAN_0,
        [CLAIM_RESPOND.AMOUNT_GREATER_THAN_0],
      );
    const resClaim = await this.claimRewardService.handleClaim(
      createClaimRewardDto,
    );
    if (resClaim === POOL_NFT_MESSAGE.REWARD_POOL_NOT_FOUND)
      throw HttpValidationError.error(
        CommonCode.E0,
        POOL_NFT_MESSAGE.REWARD_POOL_NOT_FOUND,
        [POOL_NFT_MESSAGE.REWARD_POOL_NOT_FOUND],
      );
    if (resClaim === CLAIM_RESPOND.REWARD_POOL_NOT_OPEN)
      throw HttpValidationError.error(
        CommonCode.E0,
        CLAIM_RESPOND.REWARD_POOL_NOT_OPEN,
        [CLAIM_RESPOND.REWARD_POOL_NOT_OPEN],
      );
    if (resClaim === POOL_NFT_MESSAGE.POOL_NOT_FOUND)
      throw HttpValidationError.error(
        CommonCode.E0,
        POOL_NFT_MESSAGE.POOL_NOT_FOUND,
        [POOL_NFT_MESSAGE.POOL_NOT_FOUND],
      );

    if (resClaim === PURCHASE_F_NFT_RESPONSE.USER_WALLET_NOT_EXIST)
      throw HttpValidationError.error(
        CommonCode.E0,
        PURCHASE_F_NFT_RESPONSE.USER_WALLET_NOT_EXIST,
        [PURCHASE_F_NFT_RESPONSE.USER_WALLET_NOT_EXIST],
      );

    if (resClaim === CLAIM_RESPOND.AMOUNT_GREATER_THAN_PURCHASE)
      throw HttpValidationError.error(CommonCode.E0, CommonCode.CER06, [
        CLAIM_RESPOND.AMOUNT_GREATER_THAN_PURCHASE,
      ]);
    return {
      code: API_SUCCESS,
      data: resClaim,
    };
  }
}
