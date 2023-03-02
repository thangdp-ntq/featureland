import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SearchDto {
  @ApiProperty()
  keyword = '';

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  page = 1;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  limit = 10;

  @ApiProperty()
  sort: object;

  @ApiProperty()
  projection: object;
}
