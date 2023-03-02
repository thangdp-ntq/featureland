import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from '~/common/interface';

export class CreateTokenDto {
  @ApiProperty({
    required: false,
    default: 'bsc',
    description: 'BlockChain network',
  })
  @IsOptional()
  @IsString()
  blockchainNetwork: string;

  @ApiProperty({
    type: String,
    example: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  })
  @IsString()
  contractAddress: string;

  @ApiProperty({
    type: String,
    example: 'BUSD',
  })
  @IsString()
  contractSymbol: string;

  @ApiProperty({
    type: String,
    example: '18',
  })
  @IsString()
  contractDecimals: string;

  @ApiProperty({
    required: false,
    default: 1,
    description: '1 is ON, 2 is OFF',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsNumber()
  status: number;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  isInput: boolean;

  @ApiProperty({
    required: false,
    default: '1.0000',
    description: 'USD price of admin input',
  })
  @IsOptional()
  @IsString()
  usdPriceInput: string;
}

export class UpdateTokenDto {
  @ApiProperty({
    required: false,
    default: 1,
    description: '1 is ON, 2 is OFF',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsNumber()
  status: number;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  isInput: boolean;

  @ApiProperty({
    required: false,
    default: '1.0000',
    description: 'USD price of admin input',
  })
  @IsOptional()
  @IsString()
  usdPriceInput: string;
}

export class TokenFilterDto extends PaginationQuery {
  @ApiProperty({
    required: false,
    default: '',
    description: 'Address Currency to search',
  })
  @IsOptional()
  @IsString()
  contractAddress: string;

  @ApiProperty({
    required: false,
    default: '',
    description: 'Symbol Symbol to search',
  })
  @IsOptional()
  @IsString()
  contractSymbol: string;

  @ApiProperty({
    required: false,
    default: '',
    description: 'Address Decimals to search',
  })
  @IsOptional()
  @IsString()
  contractDecimals: string;

  @ApiProperty({
    required: false,
    default: 1,
    description: '1 is ON, 0 is OFF',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @IsNumber()
  status: number;
}
