import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsEthereumAddress,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Language } from '~/schemas/language.schema';
import {
  API_ERROR,
  BLOCKCHAIN_NETWORK,
  F_NFT_POOL_STATUS,
  messsage,
  POOL_NFT_MESSAGE,
  TieringStructureResponse,
} from '../../common/constants';
import { ApiErrorResponse } from '../../common/responses/api-errors';

export class VerifySelectNFTDTO {
  @ApiProperty({
    example: BLOCKCHAIN_NETWORK.BSC,
  })
  @IsEnum(BLOCKCHAIN_NETWORK)
  @IsString()
  @ValidateIf((o) => o.blockchainNetwork)
  blockchainNetwork: string;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  @Min(1)
  @IsNumber()
  @IsNotEmpty({
    message: 'nftId is required',
  })
  nftId: number;

  @ApiProperty({
    example: '1',
    description: 'This value must be greater than 0',
  })
  @IsString({ message: 'totalSold must be number' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'totalSold must be number',
  })
  @ValidateIf((o) => o.totalSold)
  totalSold: string;

  @ApiProperty({
    example: '0x743a09ae70d3d4e28590741507907e94c4775133',
  })
  @IsString()
  @IsEthereumAddress({
    message: messsage.E19,
  })
  @ValidateIf((o) => o.acceptedCurrencyAddress)
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
  @ValidateIf((o) => o.receiveWalletAddress)
  receiveWalletAddress: string;
}

export class VerifySelectNFTError extends ApiErrorResponse {
  @ApiProperty({ example: API_ERROR, type: String })
  code: string;

  @ApiProperty({
    type: String,
    example: POOL_NFT_MESSAGE.VALIDATE_SELECT_NFT_ERROR,
  })
  message: string;

  @ApiProperty({
    example: [],
  })
  errors: any;

  public static error(code: number, message: string, errors: any) {
    const result = new VerifySelectNFTError();
    result.error(code, message, errors);

    return result;
  }
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

export class VerifyStageDto {
  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
    required: false,
  })
  @IsOptional()
  @IsString()
  productionPeriodEndTime: string;

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
  @IsString()
  @IsOptional()
  @IsDateString()
  purchaseEndTime: string;

  @ApiProperty({
    example: 1,
    description: 'Step of timeline',
    minItems: 1,
    type: Number,
  })
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelineMultipleLanguage)
  timelines: TimelineMultipleLanguage[];
}

export class VerifyGeneralInfoDTO {
  @ApiProperty({
    required: true,
    example: '{"en": "Leo pool", "jp": "Leo pool", "cn": "Leo pool"}',
    description: 'String of object poolName',
  })
  @IsNotEmpty()
  @IsString()
  poolName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: '{"en": "Leo pool", "jp": "Leo pool", "cn": "Leo pool"}',
    description: 'String of object poolDescription',
  })
  poolDescription: string;

  @ApiProperty({
    required: true,
    description: 'File attach image',
    type: 'file',
    format: 'binary',
  })
  @IsOptional()
  poolImage?: Express.Multer.File;

  @ApiProperty({
    required: false,
    description: 'File attach image',
    type: 'file',
    format: 'binary',
  })
  @IsOptional()
  poolVideo?: Express.Multer.File;

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
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  @IsDateString()
  registrationStartTime?: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  @IsDateString()
  registrationEndTime?: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  purchaseStartTime?: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsDateString()
  @IsString()
  purchaseEndTime?: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
    required: false,
  })
  @IsOptional()
  @IsString()
  productionPeriodStartTime?: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
    required: false,
  })
  @IsOptional()
  @IsString()
  productionPeriodEndTime?: string;

  @ApiProperty({
    example: '1',
    type: String,
    description: 'This value must be greater than 0',
  })
  @IsString({ message: 'exchangeRates must be number' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'exchangeRates must be number',
  })
  exchangeRates?: string;
}

export class VerifyGeneralInfoError extends ApiErrorResponse {
  @ApiProperty({ example: API_ERROR, type: String })
  code: string;

  @ApiProperty({
    type: String,
    example: POOL_NFT_MESSAGE.VALIDATE_GENERAL_INFO_ERROR,
  })
  message: string;

  @ApiProperty({
    example: [],
  })
  errors: any;

  public static error(code: number, message: string, errors: any) {
    const result = new VerifyGeneralInfoError();
    result.error(code, message, errors);

    return result;
  }
}

export class AllocationSettingDTO {
  @ApiProperty({
    example: '6244331149ad0cd307ba7d65',
    required: true,
    maxLength: 256,
    description: '_id of tier',
  })
  @IsString()
  @MaxLength(256)
  @IsNotEmpty()
  _id: string;

  @ApiProperty({
    example: 1,
    required: true,
    minItems: 1,
    description: 'Number of tier',
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  tierNumber: number;

  @ApiProperty({
    required: true,
    description: 'Name of tier',
    type: Language,
  })
  @IsNotEmpty({ each: true })
  @IsNotEmptyObject({ nullable: false })
  @Type(() => Language)
  @ValidateNested({ each: true })
  name: Language;

  @ApiProperty({
    example: 30,
    required: true,
    maxLength: 3,
    minItems: 1,
    description: 'Staking period of tier',
  })
  @IsInt({ message: TieringStructureResponse.INVALID_TYPE_PERIOD })
  @Max(90, {
    message: TieringStructureResponse.INVALID_LENGTH_PERIOD,
  })
  @Min(0)
  @IsNotEmpty()
  stakingPeriod: number;

  @ApiProperty({
    example: 100000,
    required: true,
    maxLength: 9,
    minItems: 1,
    description: 'Staking quantity of tier',
  })
  @IsNumber({}, { message: TieringStructureResponse.INVALID_TYPE_QUANTITY })
  @Max(999999999, {
    message: TieringStructureResponse.INVALID_LENGTH_QUANTITY,
  })
  @Min(1)
  @IsNotEmpty()
  stakingQuantity: number;

  @ApiProperty({
    type: Number,
    example: 1,
    minItems: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  allocationPercent: number;
}

export class VerifyConfigureWhitelistDTO {
  @ApiProperty({
    example: 'https://example.com',
    maxLength: 5000,
    type: String,
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
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  @IsDateString()
  purchaseStartTime: string;

  @ApiProperty({
    example: '2022-06-27T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  @IsDateString()
  registrationEndTime: string;

  @ApiProperty()
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
    example: '1000000',
    description: 'total sold nft',
  })
  @IsOptional()
  @IsString()
  totalSold?: string;

  @ApiProperty({
    required: false,
    type: AllocationSettingDTO,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @Type(() => AllocationSettingDTO)
  allocationSettings?: AllocationSettingDTO[];
}

export class VerifyConfigureWhitelistError extends ApiErrorResponse {
  @ApiProperty({ example: API_ERROR, type: String })
  code: string;

  @ApiProperty({
    type: String,
    example: POOL_NFT_MESSAGE.VALIDATE_CONFIGURE_WHITELIST_ERROR,
  })
  message: string;

  @ApiProperty({
    example: [],
  })
  errors: any;

  public static error(code: number, message: string, errors: any) {
    const result = new VerifyConfigureWhitelistError();
    result.error(code, message, errors);

    return result;
  }
}
