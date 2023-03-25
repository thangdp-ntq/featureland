import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { sortType } from '../../common/constants';

export class GetLand {
    @ApiProperty({
      required: false,
      description:
        'if you send this params up, will return about nfts same ownerAddress,params not required',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    ownerAddress: string;

    @ApiProperty({
      required: false,
      description:
        'if you send this params up, will return about nfts same ownerAddress,params not required',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    useAddNftAddress: string;

    @ApiProperty({
      required: false,
      description:
        'if you send this params up, will return about nfts same ownerAddress,params not required',
    })
    @IsOptional()
    tab: number;

    @ApiProperty({
      required: false,
      description:
        'if you send this params up, will return about nfts same ownerAddress,params not required',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    regionId: string;

    @ApiProperty({
        required: false,
        description:
          'if you send this params up, will return about nfts same hasOwner,params not required',
      })
      @IsOptional()
      @IsString()
      @MaxLength(255)
      hasOwner: string;
  
    @ApiProperty({
      example: 1,
      required: false,
      description: 'the page, params not required default page=1,',
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    page: number;
  
    @ApiProperty({
      example: 10,
      required: false,
      description: 'the page size , params not required default pageSize=10',
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    pageSize: number;
  
    @ApiProperty({
      required: false,
      enum: sortType,
      default: sortType.asc,
      description: 'sort type asc or desc',
    })
    @IsOptional()
    @IsEnum(sortType)
    @IsIn(Object.values(sortType))
    sortType: sortType;
  
    @ApiProperty({
      example: 'numberNfts',
      enum: [
        'createdAt',
        'numberNfts',
      ],
      required: false,
      description:
        'sort field name . sortField maybe equals numberNft,createdAt',
    })
    @IsOptional()
    @IsEnum([
      'createdAt',
      'numberNfts',
    ])
    @IsIn([
      'createdAt',
      'numberNfts',
    ])
    sortField: string;
  }