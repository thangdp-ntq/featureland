import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { WALLET_TYPE } from '~/schemas/system-wallet.schema';

export class SystemWalletDto {
  @ApiProperty({ type: Number, example: '', enum: WALLET_TYPE })
  @IsNumber()
  type: number;

  @ApiProperty({ required: true })
  @IsString()
  secretKey: string;
}

export class SearchSystemWalletDto {
  @ApiProperty({
    type: Number,
    example: '',
    enum: [WALLET_TYPE.PURCHASE, WALLET_TYPE.CLAIM],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsNumber()
  type: number;
}
