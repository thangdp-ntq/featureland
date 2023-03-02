import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
export class CreateTieringPoolDto {
  @ApiProperty({ example: '0x179Ae85A91013Fa99e2e8f27e528614b7D2c9462' })
  @IsOptional()
  @IsEthereumAddress()
  @IsNotEmpty()
  @MaxLength(256)
  @IsString()
  poolContractAddress: string;

  @ApiProperty({ example: 'Stake DAD' })
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsNotEmpty()
  @MaxLength(256)
  @IsString()
  poolName: string;

  @ApiProperty({ example: '0x179Ae85A91013Fa99e2e8f27e528614b7D2c9462' })
  @IsEthereumAddress()
  @IsNotEmpty()
  @IsString()
  tieringTokenAddress: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Min(0)
  @Max(1000)
  @IsNumber()
  lockDuration: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Min(0)
  @Max(1000)
  @IsNumber()
  withdrawDelayDuration: number;

  @ApiProperty({
    required: false,
    example: '03/09/2022 11:00:00',
    description: 'Format: MM/DD/YYYY HH:mm:ss',

  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => new Date(value))
  @IsDate()
  timeStartJoin: Date;

  @ApiProperty({
    required: false,
    example: '03/09/2022 11:00:00',
    description: 'Format: MM/DD/YYYY HH:mm:ss',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => new Date(value))
  @IsDate()
  timeEndJoin: Date;
}
