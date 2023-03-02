import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsEthereumAddress,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNotIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { RewardPoolStatus, sortType } from '~/common/constants';
import { PaginationQuery } from '~/common/interface';
import { LanguageEnRequired } from '~/common/language.dto';

export enum sortFNFTFiedls {
  POOL_ID = 'FNFTPool.poolId',
  POOL_NAME = 'FNFTPool.poolName',
}

export const SORT_FIELDS = [
  'rewardPoolId',
  'name',
  'createdAt',
  ...Object.values(sortFNFTFiedls),
];

export class CreateRewardPoolDto {
  @ApiProperty({
    example: { en: 'Pool one', jp: '', cn: '' },
  })
  @IsNotEmpty()
  name: LanguageEnRequired;

  @ApiProperty({ example: 123, type: 'number', required: true })
  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  FNFTPoolId: number;

  @ApiProperty({ example: '0x179Ae85A91013Fa99e2e8f27e528614b7D2c9462' })
  @IsOptional()
  @IsEthereumAddress({
    message: 'This token address is not valid on the current network',
  })
  @IsNotEmpty()
  @MaxLength(256)
  @IsString()
  @Equals(process.env.CONTRACT_PROXY)
  poolContractAddress: string;

  @ApiProperty({
    example: '0x179Ae85A91013Fa99e2e8f27e528614b7D2c9462',
    type: 'string',
    maxLength: 256,
  })
  @IsEthereumAddress({
    message: 'This token address is not valid on the current network',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  @IsNotIn([process.env.CONTRACT_PROXY])
  tokenContractAddress: string;

  @ApiProperty({
    example: 'USDT',
  })
  @IsString()
  @IsNotEmpty()
  currencySymbol: string;

  @ApiProperty({
    example: '18',
  })
  @IsString()
  @IsNotEmpty()
  currencyDecimals: string;

  @ApiProperty({
    type: 'number',
    example: RewardPoolStatus.ON,
    default: RewardPoolStatus.ON,
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsIn(Object.values(RewardPoolStatus))
  status: number;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsString({ message: 'Total must be string' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'F-NFT number must be number',
  })
  @MaxLength(256)
  total: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsString({ message: 'F-NFT Sold Amount in USD' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'FNFT Sold Amount must be number',
  })
  @MaxLength(256)
  soldAmountUSD: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsString({ message: 'Reward Multiplier' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'Reward Multiplier must be number',
  })
  rewardMultiplier: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
    required: false,
  })
  @IsString()
  @IsDateString()
  @IsNotEmpty()
  poolOpenTime: Date;

  @ApiProperty({ example: '1' })
  @IsOptional()
  @IsString({ message: 'Contract FNFTPool usd price' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'Contract FNFTPool usd price must be number',
  })
  contractFNFTPoolUSD: string;

  @ApiProperty({ example: '1' })
  @IsOptional()
  @IsString({ message: 'Contract RewardPool usd price' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'Contract RewardPool usd price must be number',
  })
  contractRewardPoolUSD: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  isInputFNFTPoolPrice: boolean;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  isInputRewardPrice: boolean;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  bePaidGasFee?: boolean;
}

export class UpdateRewardPoolDto {
  @ApiProperty({
    example: { en: 'Pool one', jp: '', cn: '' },
  })
  @IsNotEmpty()
  name: LanguageEnRequired;

  @ApiProperty({
    example: '0x179Ae85A91013Fa99e2e8f27e528614b7D2c9462',
    type: 'string',
    maxLength: 256,
  })
  @IsEthereumAddress({
    message: 'This token address is not valid on the current network',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  @IsNotIn([process.env.CONTRACT_PROXY])
  tokenContractAddress: string;

  @ApiProperty({
    example: 'USDT',
  })
  @IsOptional()
  @IsString()
  currencySymbol: string;

  @ApiProperty({
    example: 'USDT',
  })
  @IsOptional()
  @IsString()
  currencyDecimals: string;

  @ApiProperty({
    type: 'number',
    example: RewardPoolStatus.ON,
    default: RewardPoolStatus.ON,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsIn(Object.values(RewardPoolStatus))
  status: number;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsString({ message: 'Total must be string' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'F-NFT number must be number',
  })
  @MaxLength(256)
  total: string;

  @ApiProperty({ example: '1' })
  @IsOptional()
  @IsString({ message: 'F-NFT Sold Amount in USD' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'FNFT Sold Amount must be number',
  })
  @MaxLength(256)
  soldAmountUSD: string;

  @ApiProperty({ example: '1' })
  @IsOptional()
  @IsString({ message: 'Reward Multiplier' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'Reward Multiplier must be number',
  })
  rewardMultiplier: string;

  @ApiProperty({ example: '1' })
  @IsOptional()
  @IsString({ message: 'Contract FNFTPool usd price' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'Contract FNFTPool usd price must be number',
  })
  contractFNFTPoolUSD: string;

  @ApiProperty({ example: '1' })
  @IsOptional()
  @IsString({ message: 'Contract RewardPool USD price' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'Contract RewardPool USD price must be number',
  })
  contractRewardPoolUSD: string;
}

export class RollbackRewardPool {
  @ApiProperty({ example: 123, type: 'number', required: true })
  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  fnftPoolId: number;

  @ApiProperty({ example: 123, type: 'number', required: true })
  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  rewardPoolId: number;
}
export class RewardPoolFilterDto extends PaginationQuery {
  @ApiProperty({
    required: false,
    default: '',
    description: 'Search by Pool name/ID, F-NFT Pool name/ID',
    maxLength: 256,
  })
  @IsString()
  @IsOptional()
  @MaxLength(256)
  keyword: string;

  @ApiProperty({
    required: false,
    enum: RewardPoolStatus,
    default: null,
    description: 'Reward status',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => RewardPoolStatus[value])
  status: RewardPoolStatus | null;

  @ApiProperty({
    required: false,
    enum: SORT_FIELDS,
    default: 'name',
    description: 'Reward sort by createdAt',
  })
  @IsString()
  @ValidateIf((o) => o.sortType)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsEnum(SORT_FIELDS)
  @IsIn(SORT_FIELDS)
  sortField: string;

  @ApiProperty({
    required: false,
    enum: sortType,
    default: sortType.asc,
    description: 'Reward sort by name',
  })
  @IsString()
  @ValidateIf((o) => o.sortField)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsEnum(sortType)
  @IsIn(Object.values(sortType))
  sortType: string;
}

export const SORT_FIELDS_USERS = [
  'purchased',
  'claimed',
  'claimable',
  'unclaimed',
];

export class FilterRewardUserDetails {
  @ApiProperty({
    required: false,
    default: '',
    description: 'Search wallet address',
    maxLength: 256,
  })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  textSearch: string;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'the page, params not required default page=1,',
    minItems: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;

  @ApiProperty({
    example: 10,
    required: false,
    description: 'the page size , params not required default pageSize=10',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize: number;

  @ApiProperty({
    required: false,
    enum: SORT_FIELDS_USERS,
    default: 'name',
    description: 'Reward sort',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.sortType)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsEnum(SORT_FIELDS_USERS)
  @IsIn(SORT_FIELDS_USERS)
  sortField: string;

  @ApiProperty({
    required: false,
    enum: sortType,
    default: sortType.asc,
    description: 'Reward user sort',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.sortField)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsEnum(sortType)
  @IsIn(Object.values(sortType))
  sortType: string;
}
