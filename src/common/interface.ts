import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class PaginationQuery {
  @ApiProperty({ example: 1, type: 'number', default: 1, required: true })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Transform(({ value }) => +value, { toClassOnly: true })
  page: number;

  @ApiProperty({ example: 10, type: 'number', default: 1, required: true })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Transform(({ value }) => +value, { toClassOnly: true })
  pageSize: number;
}
export class Pagination<T> {
  @ApiProperty({ type: Array, description: 'Array of inset T' })
  items: T;
  @ApiProperty({ example: 1, type: 'number' })
  pageCurrent: number;
  @ApiProperty({ example: 100, type: 'number' })
  totalDocs: number;
  @ApiProperty({ example: false, type: 'boolean' })
  hasPrevPage: boolean;
  @ApiProperty({ example: false, type: 'boolean' })
  hasNextPage: boolean;
}

export class Web3Error {
  message: string;
  code: string;
}
