import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { F_NFT_POOL_STATUS, sortType, TYPE_POOL } from '../../common/constants';

export class GetFNFTPoolDTO {
  @ApiProperty({
    example: 'Leo pool',
    required: false,
    description:
      'if you send this params up, will return about f-nft pool same pool name,params not required',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  textSearch: string;

  @ApiProperty({
    example: true,
    required: false,
    description:
      'If canCreateReward is true, will return FNFTPool can create rewardPool',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  canCreateReward: boolean;

  @ApiProperty({
    example: 1,
    required: false,
    description:
      'if you send this params up, will return about f-nft pool same status,params not required. 0 is OFF, 1 is ON',
  })
  @IsEnum(F_NFT_POOL_STATUS)
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsOptional()
  @IsNumber()
  status: number;

  @ApiProperty({
    example: 1,
    required: false,
    description:
      'if you send this params up, will return about f-nft pool same pool type,params not required. 0 is DRAFT, 1 is ON CHAIN',
  })
  @IsEnum(TYPE_POOL)
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsOptional()
  @IsNumber()
  poolType: number;

  @ApiProperty({
    example: 1,
    required: true,
    description: 'the page, params not required default page=1,',
    minItems: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;

  @ApiProperty({
    example: 10,
    required: true,
    description: 'the page size , params not required default pageSize=10',
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  pageSize: number;

  @ApiProperty({
    example: sortType.desc,
    required: false,
    description: 'sort type asc or desc',
  })
  @IsOptional()
  @IsEnum(sortType)
  sortType: sortType;

  @ApiProperty({
    example: 'poolName',
    required: false,
    description: 'sort field name',
    enum: [
      'poolId',
      'poolName',
      'createdAt',
      'nftId',
      'nftName',
      'fNFTName',
      'fNFTSymbol',
    ],
  })
  @IsString()
  @ValidateIf((o) => o.sortType)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsEnum([
    'poolId',
    'poolName',
    'createdAt',
    'nftId',
    'nftName',
    'fNFTName',
    'fNFTSymbol',
  ])
  @IsIn([
    'poolId',
    'poolName',
    'createdAt',
    'nftId',
    'nftName',
    'fNFTName',
    'fNFTSymbol',
  ])
  sortField: string;

  @ApiProperty({
    example: 1,
    required: false,
    description:
      'if you send this params up, will return about f-nft pool same status,params not required. 0 is OFF, 1 is ON',
  })
  @IsOptional()
  nameOId: string;
}

export class GetWhiteListDTO {
  @ApiProperty({
    example: '0xsadasd',
    required: false,
    description:
      'if you send this params up, will return user ,params not required',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  textSearch: string;

  @ApiProperty({
    example: 1,
    required: true,
    description: 'the page, params not required default page=1,',
    minItems: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;

  @ApiProperty({
    example: 10,
    required: true,
    description: 'the page size , params not required default pageSize=10',
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  pageSize: number;
}
