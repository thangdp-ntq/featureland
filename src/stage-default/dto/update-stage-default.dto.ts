import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TimelineMultipleLanguage {
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
}

export class UpdateStageDefaultDto {
  @ApiProperty({
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
  @Type(() => TimelineMultipleLanguage)
  timelines: TimelineMultipleLanguage[];
}
