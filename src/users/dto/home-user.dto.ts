import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { PaginationQuery } from '~/common/interface';
import { Stages } from '~/schemas';

export class HomeUserSearchDto {
  @ApiProperty({
    type: String,
    example: '',
    description: 'Serial ID',
    required: false,
  })
  @ValidateIf((e) => e.serialId !== '')
  @IsMongoId()
  @IsOptional()
  serialId: string;

  @ApiProperty({
    type: String,
    example: '',
    description: 'Path ID',
    required: false,
  })
  @ValidateIf((e) => e.pathId !== '')
  @IsMongoId()
  @IsOptional()
  pathId: string;
}

export class HomeFNFTSearchDto extends PaginationQuery {
  @ApiProperty({
    type: String,
    example: '',
    description: 'Search by Pool name, Pool Id',
    required: false,
  })
  @IsOptional()
  keyword: string;

  @ApiProperty({
    type: String,
    example: '',
    description: 'Serial ID',
    required: false,
  })
  @ValidateIf((e) => e.serialId !== '')
  @IsMongoId()
  @IsOptional()
  seriesId: string;

  @ApiProperty({
    type: String,
    example: '',
    description: 'Path ID',
    required: false,
  })
  @ValidateIf((e) => e.pathId !== '')
  @IsMongoId()
  @IsOptional()
  pathId: string;

  @ApiProperty({
    type: Stages,
    enum: Stages,
    example: '',
    description: 'Stages',
    required: false,
  })
  @IsOptional()
  @IsEnum(Stages)
  stage: Stages;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  isFCFS?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  isMyFNFTPool?: boolean;
}
