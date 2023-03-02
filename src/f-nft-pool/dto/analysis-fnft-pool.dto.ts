import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { sortType } from '~/common/constants';

export const SORT_FIELDS_USERS_PURCHASED = ['purchased'];

export class FilterPurchasedUserDetails {
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
    enum: SORT_FIELDS_USERS_PURCHASED,
    default: 'name',
    description: 'Reward sort',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.sortType)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsEnum(SORT_FIELDS_USERS_PURCHASED)
  @IsIn(SORT_FIELDS_USERS_PURCHASED)
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
