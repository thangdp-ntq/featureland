import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetTimeSettingDto {
  @ApiProperty({
    example: true,
    required: false,
    description: 'status timesetting',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  isActive: boolean;
}
export class TimeSettingDto {
  @ApiProperty({
    type: Array,
    example: [0, 1, 2, 3],
  })
  @IsArray()
  days: number[];

  @ApiProperty({
    type: String,
    example: '08:10:00',
  })
  @IsNotEmpty()
  @IsString()
  hourFrom: string;

  @ApiProperty({
    type: String,
    example: '20:10:00',
  })
  @IsNotEmpty()
  @IsString()
  hourTo: string;
}

export class UpdateTimeSettingDto {
  @ApiProperty({
    example: true,
    required: false,
    description: 'status timesetting',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  isActive: boolean;
}
