import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { CreateClaimRewardDto } from './create-claim-reward.dto';

export class UpdateClaimRewardDto extends PartialType(CreateClaimRewardDto) {}

export class UpdateClaimWorkerDto {
  @ApiProperty({
    required: true,
    example: 301,
    description: 'Pool Id of F-NFT pool',
  })
  @IsNumber()
  poolId: number;

  @ApiProperty({
    required: true,
    example: '0x4e0fa954BCB04726C24B3ddA9EcC2cfDB184a6e2',
    description: 'Wallet address of user purchase',
  })
  @IsString()
  account: string;

  @ApiProperty({
    required: true,
    example: '405000000000000000000',
    description: 'number USDT user has claim',
  })
  @IsString()
  rewardUSDT: string;

  @ApiProperty({
    required: true,
    example: '63299045f8163dae0db064df',
    description: 'id of purchase record',
  })
  @IsString()
  claimId: string;
}
