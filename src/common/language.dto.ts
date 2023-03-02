import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

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
  @IsString()
  @MaxLength(256)
  @IsNotEmpty()
  jp: string;
}

export class LanguageEnRequired {
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
  @IsString()
  @MaxLength(256)
  @IsNotEmpty()
  jp: string;
}

export class LanguageDescription {
  @ApiProperty({
    example: 'Diamond',
    required: true,
    maxLength: 3000,
    description: 'Name en',
  })
  @IsString()
  @MaxLength(3000)
  en: string;

  @ApiProperty({
    example: 'Diamond',
    required: true,
    maxLength: 3000,
    description: 'Name cn',
  })
  @IsString()
  @MaxLength(3000)
  cn: string;

  @ApiProperty({
    example: 'Diamond',
    required: true,
    maxLength: 3000,
    description: 'Name jp',
  })
  @IsString()
  @MaxLength(3000)
  jp: string;
}