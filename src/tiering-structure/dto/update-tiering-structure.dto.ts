import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  MaxLength,
  IsNumber,
  Min,
  IsNotEmpty,
  Max,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsInt,
  IsNotEmptyObject
} from 'class-validator';
import { TieringStructureResponse } from '../../common/constants';
import { Language } from '../../common/language.dto';

export class TieringStructureDto {
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
}

export class TiersDto {
  @ApiProperty({
    required: true,
    type: TieringStructureDto,
    isArray: true,
    minLength: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => TieringStructureDto)
  @ValidateNested({ each: true })
  items: TieringStructureDto[];
}
