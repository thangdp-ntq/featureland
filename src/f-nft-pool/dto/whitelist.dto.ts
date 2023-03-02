import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEthereumAddress,
  IsString,
  Matches,
} from 'class-validator';
import { TieringStructureDto } from '~/tiering-structure/dto/update-tiering-structure.dto';

export class ImportWhiteListDto {
  @ApiProperty({
    required: true,
    description: 'File attach csv',
    type: 'file',
    format: 'binary',
  })
  file: Express.Multer.File;
}

export class UserData {
  @IsEthereumAddress()
  address: string;
}

export class CalculateWhitelist {
  @ApiProperty({
    example: [
      {
        address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
      },
      {
        address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
      },
    ],
  })
  @IsArray()
  data: [];

  // Cac du lieu can truyen vao API de tinh toan

  @ApiProperty({
    example: '1',
    type: String,
    description: 'This value must be greater than 0',
  })
  @IsString({ message: 'exchangeRates must be number' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'exchangeRates must be number',
  })
  exchangeRates: string;

  @ApiProperty({
    example: '2022-06-30T09:07:21+07:00',
    description: 'Format: YYYY-MM-DDTHH:mm:ssTZD',
  })
  @IsString()
  @IsDateString()
  purchaseStartTime: string;

  @ApiProperty({
    example: '1',
    type: String,
    description: 'This value must be greater than 0',
  })
  @IsString({ message: 'totalSold must be number' })
  @Matches(/^\d*\.?\d+$/, {
    message: 'totalSold must be number',
  })
  totalSold: string;

  @ApiProperty()
  @Transform(({ value }: TransformFnParams) => JSON.parse(value))
  @IsBoolean()
  isFCFS?: boolean;

  @ApiProperty({
    required: true,
    type: TieringStructureDto,
    isArray: true,
    minLength: 1,
  })
  @IsArray()
  @Type(() => TieringStructureDto)
  tieringStructure: TieringStructureDto[];
}

export class TimelineNft {
  @ApiProperty({ example: 2 })
  step: number;
}
