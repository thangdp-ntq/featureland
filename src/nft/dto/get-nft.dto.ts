import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { sortType } from '../../common/constants';

export class GetNFT {
  @ApiProperty({
    required: false,
    description:
      'if you send this params up, will return about nfts same ownerAddress,params not required',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  ownerAddress: string;

  @ApiProperty({
    example: '',
    required: false,
    description:
      'if you send this params up, will return about nfts same landId,params not required',
  })
  @IsOptional()
  @IsString()
  landId: string;

  @ApiProperty({
    required: false,
    description: 'if tokenId, will return about nfts same tokenId,params not required',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => Number(value))
  tokenId: string;

  @ApiProperty({
    required: false,
    description: 'the page, params not required default page=1,',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  canAddNft: number;


  @ApiProperty({
    required: false,
    description: 'the page, params not required default page=1,',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  tab: number;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'the page, params not required default page=1,',
  })
  @IsOptional()
  @IsInt()
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
    enum: sortType,
    default: sortType.asc,
    description: 'sort type asc or desc',
  })
  @IsOptional()
  @IsEnum(sortType)
  @IsIn(Object.values(sortType))
  sortType: sortType;

  @ApiProperty({
    example: 'createdAt',
    enum: [
      'createdAt',
      'tokenId',
    ],
    required: false,
    description:
      'sort field name . sortField maybe equals NFTname,id,createdAt',
  })
  @IsOptional()
  @IsEnum([
    '_id',
    'createdAt',
    'NFTname',
    'fractionalizeOn',
    'deletedOn',
    'tokenId',
  ])
  @IsIn([
    '_id',
    'createdAt',
    'NFTname',
    'fractionalizeOn',
    'deletedOn',
    'tokenId',
  ])
  sortField: string;
}

export class SortType {
  createdAt: string;
  _id: string;
  NFTname: string;
}
