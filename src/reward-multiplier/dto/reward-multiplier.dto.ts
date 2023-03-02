import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min } from 'class-validator';

export class RewardMultiplierDto {
  @ApiProperty({
    type: Number,
    example: 0,
  })
  @IsNotEmpty()
  @Min(0)
  min: number;

  @ApiProperty({
    type: Number,
    example: 5,
  })
  @IsNotEmpty()
  @Min(0)
  max: number;
}
