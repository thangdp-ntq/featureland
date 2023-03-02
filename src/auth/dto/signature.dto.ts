import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class DataSignatureInfo {
  readonly address: string;
  readonly startTime: number;
  readonly expiredTime: number;
}

export class SignatureDto {
  @ApiProperty({ required: true, nullable: false })
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ required: true, nullable: false })
  @IsNotEmpty()
  @Type(() => DataSignatureInfo)
  data: DataSignatureInfo;
}
