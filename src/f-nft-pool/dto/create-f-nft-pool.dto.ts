import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  BLOCKCHAIN_NETWORK,
  F_NFT_POOL_STATUS,
  messsage,
} from '../../common/constants';

export class CreateFNFTPoolDTO {
  @ApiProperty({
    required: true,
    example: '{"en": "Leo pool", "jp": "Leo pool", "cn": "Leo pool"}',
    description: 'String of object poolName',
  })
  @IsNotEmpty()
  @IsString()
  poolName: string;

  @ApiProperty({
    required: true,
    description: 'File attach image',
    type: 'file',
    format: 'binary',
  })
  poolImage: Express.Multer.File;

  @ApiProperty({
    required: false,
    description: 'File attach video',
    type: 'file',
    format: 'binary',
  })
  @IsOptional()
  poolVideo: Express.Multer.File;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: '{"en": "Leo pool", "jp": "Leo pool", "cn": "Leo pool"}',
    description: 'String of object poolDescription',
  })
  poolDescription: string;

  @ApiProperty({
    example: F_NFT_POOL_STATUS.OFF,
    description: '1 is ON, 0 is OFF',
    type: Number,
  })
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsEnum(F_NFT_POOL_STATUS)
  @IsNumber()
  status: number;

  @ApiProperty({
    example: '624bf460c3b4b87f82838ddb',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'You must select Series' })
  seriesId: string;

  @ApiProperty({
    example: '624bf460c3b4b87f82838ddb',
    required: false,
  })
  @IsString()
  @IsOptional()
  pathId: string;

  @ApiProperty({
    example: BLOCKCHAIN_NETWORK.BSC,
  })
  @IsEnum(BLOCKCHAIN_NETWORK)
  @IsString()
  blockchainNetwork: string;

  @ApiProperty({
    example: '0x743a09ae70d3d4e28590741507907e94c4775133',
  })
  @IsString()
  @IsEthereumAddress({
    message: messsage.E19,
  })
  acceptedCurrencyAddress: string;

  @ApiProperty({
    example: 'USDT',
  })
  @IsString()
  acceptedCurrencySymbol: string;

  @ApiProperty({
    example: '18',
  })
  @IsString()
  acceptedCurrencyDecimals: string;

  @ApiProperty({
    example: '0xa75B0c39daf791d9C956BBFfEE2842c6b4dFe0C6',
  })
  @IsString()
  @IsEthereumAddress({
    message: messsage.E19,
  })
  receiveWalletAddress: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  @IsDateString()
  registrationStartTime: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  @IsDateString('')
  registrationEndTime: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  @IsDateString('')
  purchaseStartTime: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  @IsDateString('')
  purchaseEndTime: string;

  @ApiProperty({
    example: 4000,
    minItems: 1,
  })
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsNumber()
  @Min(1)
  nftId: number;

  @ApiProperty({
    example: '1',
    type: String,
    description: 'This value must be greater than 0',
  })
  @IsString({ message: 'totalSold must be number' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'totalSold must be number',
  })
  totalSold: string;

  @ApiProperty({
    example: '1',
    type: String,
    description: 'This value must be greater than 0',
  })
  @IsString({ message: 'exchangeRates must be number' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'exchangeRates must be number',
  })
  exchangeRates: string;

  @ApiProperty({
    example: 'https://example.com',
    maxLength: 5000,
    type: String,
    required: false,
  })
  @MaxLength(5000)
  @IsOptional()
  @ValidateIf((e) => e.whitelistURL !== '')
  @IsUrl(
    {
      require_protocol: true,
      require_valid_protocol: true,
    },
    { message: messsage.E21 },
  )
  whitelistURL: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsDateString()
  whitelistAnnouncementTime: string;

  @ApiProperty({
    required: false,
    example: '[{"tierNumber": 1, "allocationPercent": 1}]',
    description: 'String of array allocation setting',
  })
  @IsOptional()
  @IsString()
  allocationSettings: string;

  @ApiProperty()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  isFCFS?: boolean;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  bePaidGasFee?: boolean;

  @ApiProperty({
    example: 10,
  })
  @IsOptional()
  @ValidateIf((o) => o.bePaidGasFee)
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsNumber()
  @Min(1)
  limitPurchase: number;

  @ApiProperty({
    required: false,
    example: '1000000',
    description: 'allocation F C F S',
  })
  @IsOptional()
  @Matches(/^\d*\.?\d+$/, {
    message: 'Allocation FCFS must be number',
  })
  @IsString()
  allocationFCFS?: string;
}

export class StakingInfo {
  @ApiProperty({
    description: '0xabc',
  })
  @IsString()
  userAddress: string;

  @ApiProperty({
    description: '10000',
    type: String,
  })
  @IsString()
  balance: string;
}
