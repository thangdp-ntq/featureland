import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { sortType } from '../../common/constants';
export class GetUserManagement {
  @ApiProperty({
    example: '0xsadasd',
    required: false,
    description:
      'if you send this params up, will return user,params not required',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  textSearch: string;

  @ApiProperty({
    example: 1,
    required: true,
    description: 'the page',
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
    description: 'the page size',
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
    enum: ['joinDate', 'balance'],
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.sortType)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsEnum(['joinDate', 'balance'])
  @IsIn(['joinDate', 'balance'])
  sortField: string;
}

export class AnalysisUserDetail {
  @ApiProperty({
    example: 1,
    required: true,
    description: 'the page',
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
    description: 'the page size',
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  pageSize: number;
}
