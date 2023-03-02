import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { messsage } from '../../common/constants';

export class PurchaseFNFTDto {
  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress({
    message: messsage.E19,
  })
  @ApiProperty({
    required: true,
    example: '0xa75B0c39daf791d9C956BBFfEE2842c6b4dFe0C6',
    description: 'Wallet address of user purchase',
  })
  userWalletAddress: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    required: true,
    example: 1,
    description: 'Pool Id of F-NFT pool',
  })
  poolId: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    required: true,
    example: '1000000',
    description: 'Amount of token swap to F-NFT',
  })
  amount: string;
}
export class UpdateRemainDto {
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
    example: '250000000',
    description: 'number FNFT user has purchased',
  })
  @IsString()
  purchasedFNFT: string;

  @ApiProperty({
    required: true,
    example: '63299045f8163dae0db064df',
    description: 'id of purchase record',
  })
  @IsString()
  purchaseId: string;
}
