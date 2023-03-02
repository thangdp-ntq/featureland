import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
export class UpdateNftDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  NFTname: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  status: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  FNFTname: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  numberFNFT: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  transactionId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  batchId: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  seedDiameter: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  seedCircumference: number;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  seedBatchDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  metadata_url: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  attributes: [];
}
export class Language {
  @ApiProperty({
    example: 'Diamond',
    required: true,
    maxLength: 256,
    description: 'Name en',
  })
  @IsString()
  @MaxLength(256)
  @IsNotEmpty()
  en: string;

  @ApiProperty({
    example: 'Diamond',
    required: true,
    maxLength: 256,
    description: 'Name cn',
  })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  @IsNotEmpty()
  cn: string;

  @ApiProperty({
    example: 'Diamond',
    required: true,
    maxLength: 256,
    description: 'Name jp',
  })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  @IsNotEmpty()
  jp: string;
}
export class LabelNft {
  @ApiProperty()
  @IsNumber()
  @Max(4)
  @Min(1)
  index: number;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => Language)
  label: Language;
}

export class UpdateLabelNFT {
  @ApiProperty({
    required: true,
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
  @Type(() => MetaDataField)
  metaDataFields: MetaDataField[];
}

export class MetaDataField {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @Transform(({ value }: TransformFnParams) => value.trim())
  en: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @Transform(({ value }: TransformFnParams) => value.trim())
  cn: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @Transform(({ value }: TransformFnParams) => value.trim())
  jp: string;
}
export class LabelAttributeNFT {
  @IsNumber()
  index: number;

  @IsString()
  label: string;
}
export class FractionalizeNFT {
  @ApiProperty({ required: true, example: 'seedDiameter1' })
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  FNFTname: string;

  @ApiProperty({ required: true, example: 'seedDiameter1' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  @MaxLength(9)
  @Matches(/^[ A-Za-z0-9]*$/, {
    message: 'Symbol does not include Special character',
  })
  symbol: string;

  @ApiProperty({ required: true, example: '10000000' })
  @IsString({ message: 'F-NFT number must be number' })
  @IsNotEmpty()
  @Matches(/^[0-9]*$/, {
    message: 'F-NFT number must be number',
  })
  @MaxLength(18)
  numberFNFT: string;
}
