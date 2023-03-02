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
      'if you send this params up, will return about nfts same id,params not required',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  textSearch: string;

  @ApiProperty({
    example: 'F',
    required: false,
    description:
      'if you send this params up, will return about nfts same status,params not required',
  })
  @IsOptional()
  @IsString()
  status: string;

  @ApiProperty({
    required: false,
    description: 'if hasFNFTPool is true, will return NFTs has FNFTPool',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  hasFNFTPool: boolean;

  @ApiProperty({
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  isDeleted: boolean;

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
    example: 'NFTname',
    enum: [
      '_id',
      'createdAt',
      'NFTname',
      'fractionalizeOn',
      'deletedOn',
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
