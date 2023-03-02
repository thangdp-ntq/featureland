import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { LANGUAGE } from '../../common/constants';

export class CreateHistoryReportDto {
  @ApiProperty({
    required: true,
    type: 'file',
    format: 'binary',
    description: 'File attach pdf',
  })
  file: Express.Multer.File;

  @ApiProperty({
    required: true,
    description: 'language of history report , enum language [en,jp,cn]',
    enum:LANGUAGE
  })
  @IsEnum(LANGUAGE)
  language: string;
}
