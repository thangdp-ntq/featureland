import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
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
  TYPE_POOL,
} from '../../common/constants';
import { AllocationSettingDTO } from './verify-f-nft-pool.dto';

export class UpdateAllocationSettingDTO {
  @ApiProperty({
    required: false,
    example: '[{"tierNumber": 1, "allocationPercent": 1}]',
    description: 'String of array allocation setting',
  })
  @IsOptional()
  @IsArray()
  allocationSettings?: AllocationSettingDTO[];
}
export class UpdateFNFTPoolDTO {
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
    example: 1,
    description: '1 is ON, 0 is OFF',
  })
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsEnum(F_NFT_POOL_STATUS)
  @IsNumber()
  status: number;

  @ApiProperty({
    example: '6304894b89e5bc514e19cc44',
    required: false,
  })
  @IsString()
  @IsOptional()
  seriesId: string;

  @ApiProperty({
    example: '6303070762d513136912ab92',
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
    example: '2022-06-28T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  @IsDateString()
  registrationEndTime: string;

  @ApiProperty({
    example: '2022-06-30T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  @IsDateString()
  purchaseStartTime: string;

  @ApiProperty({
    example: '2022-07-01T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  purchaseEndTime: string;

  @ApiProperty({
    example: 15,
    minItems: 1,
  })
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsNumber()
  @Min(1)
  nftId: number;

  @ApiProperty({
    example: 15,
    minItems: 1,
    description: 'id of nft before change in update pool draft to onChain',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsNumber()
  @Min(1)
  beforeChangeNFTId: number; // Id NFT before change update draft -> onchain

  @ApiProperty({
    example: '1',
    type: String,
    description: 'This value must be greater than 0',
  })
  @IsString()
  @Matches(/^\d*\.?\d+$/, {
    message: 'totalSold must be number',
  })
  totalSold: string;

  @ApiProperty({
    example: '1',
    type: String,
    description: 'This value must be greater than 0',
  })
  @IsString()
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

  @ApiProperty({
    example: 1,
    description: '1 is ON CHAIN, 0 is DRAFT',
  })
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsOptional()
  @IsEnum(TYPE_POOL)
  @IsNumber()
  poolType: number;

  @ApiProperty()
  @IsOptional()
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

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
    required: false,
  })
  @IsOptional()
  @IsString()
  productionPeriodStartTime: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
    required: false,
  })
  @IsOptional()
  @IsString()
  productionPeriodEndTime: string;

  @ApiProperty({
    example: 1,
    description: 'Step of timeline',
    minItems: 1,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @Min(1)
  @IsNumber()
  step: number;

  @ApiProperty({
    example: [
      {
        en: 'en',
        cn: 'cn',
        jp: 'jp',
      },
    ],
  })
  @IsString()
  timelines: string;

  @ApiProperty({
    example: [
      '2022-03-27T09:07:21+07:00',
      '2022-04-27T09:07:21+07:00',
      '2022-05-27T09:07:21+07:00',
    ],
  })
  @IsOptional()
  @IsString()
  startTimelines: string;

  @ApiProperty({
    example: [{}],
  })
  @IsString()
  users: string;

  @ApiProperty({
    example: [{}],
  })
  @IsOptional()
  @IsString()
  configWhitelist: string;
}
export class TimelineMultipleLanguage {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  en: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  cn: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  jp: string;
}
export class UpdateFNFTPoolOnChainDTO {
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
    example: 1,
    description: '1 is ON, 0 is OFF',
  })
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsEnum(F_NFT_POOL_STATUS)
  @IsNumber()
  status: number;

  @ApiProperty({
    example: '624bf460c3b4b87f82838ddb',
    required: false,
  })
  @IsString()
  @IsOptional()
  seriesId: string;

  @ApiProperty({
    example: '624bf460c3b4b87f82838ddb',
    required: false,
  })
  @IsString()
  @IsOptional()
  pathId: string;

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
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  registrationStartTime: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  registrationEndTime: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  purchaseStartTime: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsOptional()
  @IsString()
  purchaseEndTime: string;

  @ApiProperty()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  isFCFS?: boolean;

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

  @ApiProperty({
    required: false,
    example: '[{"tierNumber": 1, "allocationPercent": 1}]',
    description: 'String of array allocation setting',
  })
  @IsOptional()
  @IsString()
  allocationSettings: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  whitelistAnnouncementTime: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
    required: false,
  })
  @IsOptional()
  @IsString()
  productionPeriodStartTime: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
    required: false,
  })
  @IsOptional()
  @IsString()
  productionPeriodEndTime: string;

  @ApiProperty({
    example: 1,
    description: 'Step of timeline',
    minItems: 1,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @Min(1)
  @IsNumber()
  step: number;

  @ApiProperty({
    example: [
      {
        en: 'en',
        cn: 'cn',
        jp: 'jp',
      },
    ],
  })
  @IsString()
  timelines: string;

  @ApiProperty({
    example: [
      '2022-03-27T09:07:21+07:00',
      '2022-04-27T09:07:21+07:00',
      '2022-05-27T09:07:21+07:00',
    ],
  })
  @IsOptional()
  @IsString()
  startTimelines: string;

  @ApiProperty({
    example: [{}],
  })
  @IsString()
  users: string;

  @ApiProperty({
    example: [{}],
  })
  @IsOptional()
  @IsString()
  configWhitelist: string;
}
