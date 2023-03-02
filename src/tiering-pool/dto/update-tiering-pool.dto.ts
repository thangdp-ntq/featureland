import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { TieringPoolStatus } from '../../common/constants';
export class UpdateTieringPoolDto {
  @ApiProperty({ example: 2 })
  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  lockDuration: number;

  @ApiProperty({ example: 2 })
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  withdrawDelayDuration: number;

  @ApiProperty({ example: TieringPoolStatus.ON, enum: TieringPoolStatus })
  @IsOptional()
  @IsEnum(TieringPoolStatus)
  tieringPoolStatus: number;
}
