import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsString, MaxLength, IsNotEmpty } from 'class-validator';
export class CreateNftDto {
  @ApiProperty({
    example: 'Leo',
    required: true,
    maxLength: 256,
    description: 'name of nft',
  })
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  NFTname: string;

  @ApiProperty({
    example: '',
    required: false,
    maxLength: 3000,
    description: 'description nft',
  })
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsNotEmpty({ message: 'English Description of NFT is not empty' })
  @IsString()
  @MaxLength(3000)
  descriptionEn: string;

  @ApiProperty({
    example: '',
    required: false,
    maxLength: 3000,
    description: 'description nft',
  })
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsNotEmpty({ message: 'Chinese Description of NFT is not empty' })
  @IsString()
  @MaxLength(3000)
  descriptionCn: string;

  @ApiProperty({
    example: '',
    required: false,
    maxLength: 3000,
    description: 'description nft',
  })
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsNotEmpty({ message: 'Japanese Description of NFT is not empty' })
  @IsString()
  @MaxLength(3000)
  descriptionJp: string;

  @ApiProperty({
    required: true,
    description: 'File attach image',
    type: 'file',
    format: 'binary',
  })
  file: Express.Multer.File;

  @ApiProperty({
    required: true,
    example: [
      {
        en: 'en',
        cn: 'cn',
        jp: 'jp',
        value: '',
      },
    ],
  })
  @IsString()
  @IsNotEmpty()
  metaDataFields: string;
}
export class MetaDataField {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  en: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  cn: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  jp: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  value: string;
}
