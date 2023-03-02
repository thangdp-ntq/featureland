import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class SettingWalletDto {
  @ApiProperty({
    type: Number,
    example: 0.1,
  })
  @IsNotEmpty()
  @Min(0)
  limitPurchase: number;

  @ApiProperty({
    type: Number,
    example: 0.1,
  })
  @IsNotEmpty()
  @Min(0)
  limitClaim: number;

  @ApiProperty({
    type: Array,
    example: ['quang.bui@ekoios.vn', 'buiduyquang25@gmail.com'],
  })
  @IsOptional()
  @IsArray()
  receiver: Array<string>;
}

export class GasLimitDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  gasLimit: number;

  @ApiProperty({ required: true })
  @IsString()
  secretKey: string;
}
