import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsEthereumAddress,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { POOL_TIERING_STATUS, sortType } from '../../common/constants';
import { Transform, TransformFnParams, Type } from 'class-transformer';
export class ParamTieringPool {
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
    example: 1,
    required: false,
    description:
      'if you send this params up, will return about f-nft pool same status,params not required. 0 is OFF, 1 is ON',
  })
  @IsEnum(POOL_TIERING_STATUS)
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsOptional()
  @IsNumber()
  status: number;

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
  })
  @IsOptional()
  sortField: string;
}

export class GetHistoryTransactionParams {
  @ApiProperty({
    example: '0x028E149dE3e2e257e5b8B4fdd7BE74af75a574b1',
  })
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress()
  userAddress: string;
}
