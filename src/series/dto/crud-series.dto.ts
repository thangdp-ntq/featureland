import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PaginationQuery } from '../../common/interface';
import { sortType } from '../../common/constants';
import { SerialStatus } from '../../schemas/serial.schema';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { LanguageDescription, LanguageEnRequired } from '~/common/language.dto';

export class CreateSeriesDto {
  @ApiProperty({
    required: true,
    type: LanguageEnRequired,
    description: 'Serial name',
    example: { en: 'Serial name', cn: '', jp: '' },
  })
  @IsNotEmpty({ each: true })
  @IsNotEmptyObject({ nullable: false })
  @Type(() => LanguageEnRequired)
  @ValidateNested({ each: true })
  name: LanguageEnRequired;

  @ApiProperty({
    type: LanguageDescription,
    description: 'Serial description',
    example: { en: 'Serial description', cn: '', jp: '' },
  })
  @IsNotEmpty({ each: true })
  @IsNotEmptyObject({ nullable: false })
  @Type(() => LanguageDescription)
  @ValidateNested({ each: true })
  description: LanguageDescription;

  @ApiProperty({
    enum: SerialStatus,
    default: SerialStatus.ON,
    description: 'Serial status',
  })
  @IsString()
  @IsEnum(SerialStatus)
  status: SerialStatus;
}

export class UpdateSeriesDto extends PartialType(CreateSeriesDto) {}

export class SeriesFilterDto extends PaginationQuery {
  @ApiProperty({
    required: false,
    default: '',
    description: 'Serial name to search',
    maxLength: 256,
  })
  @IsString()
  @IsOptional()
  @MaxLength(256)
  name: string;

  @ApiProperty({
    required: false,
    enum: SerialStatus,
    default: SerialStatus.ON,
    description: 'Serial status',
  })
  @IsString()
  @IsOptional()
  status: SerialStatus;

  @ApiProperty({
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  isDeleted: boolean;

  @ApiProperty({
    required: false,
    enum: ['name', 'createdAt', 'deletedOn'],
    default: 'name',
    description: 'Serial sort by createdAt',
  })
  @IsString()
  @ValidateIf((o) => o.sortType)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsEnum(['name', 'createdAt', 'deletedOn'])
  @IsIn(['name', 'createdAt', 'deletedOn'])
  sortField: string;

  @ApiProperty({
    required: false,
    enum: sortType,
    default: sortType.asc,
    description: 'Serial sort by name',
  })
  @IsString()
  @ValidateIf((o) => o.sortField)
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsEnum(sortType)
  @IsIn(Object.values(sortType))
  sortType: string;
}

export class SeriesAllFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  getAllSeries?: boolean;
  //   @ApiProperty({
  //     required: false,
  //     default: '',
  //     description: 'Serial name to search',
  //     maxLength: 256,
  //   })
  //   @IsString()
  //   @IsOptional()
  //   @MaxLength(256)
  //   name: string;

  //   @ApiProperty({
  //     required: false,
  //     enum: SerialStatus,
  //     default: SerialStatus.ON,
  //     description: 'Serial status',
  //   })
  //   @IsString()
  //   @IsOptional()
  //   status: SerialStatus;

  //   @ApiProperty({
  //     required: false,
  //     enum: ['createdAt'],
  //     default: 'createdAt',
  //     description: 'Serial sort by createdAt',
  //   })
  //   @IsString()
  //   @ValidateIf((o) => o.sortType)
  //   @Transform(({ value }: TransformFnParams) => value.trim())
  //   @IsEnum(['createdAt'])
  //   @IsIn(['createdAt'])
  //   sortField: string;

  //   @ApiProperty({
  //     required: false,
  //     enum: sortType,
  //     default: sortType.asc,
  //     description: 'Serial sort by name',
  //   })
  //   @IsString()
  //   @ValidateIf((o) => o.sortField)
  //   @Transform(({ value }: TransformFnParams) => value.trim())
  //   @IsEnum(sortType)
  //   @IsIn(Object.values(sortType))
  //   sortType: string;
}
