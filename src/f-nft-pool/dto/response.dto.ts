import { ApiProperty } from '@nestjs/swagger';
import { ApiErrorResponse } from '../../common/responses/api-errors';
import {
  API_ERROR,
  API_SUCCESS,
  CommonCode,
  COMMON_MESSAGE,
} from '../../common/constants';
import { Pagination } from '../../common/interface';
import { ApiSuccessResponse } from '../../common/responses/api-success';
import { FNFTPool } from '../../schemas/f-nft-pool.schema';
import { Language } from '../../schemas/language.schema';
import { TieringStructure } from '../../schemas';

export class NFTAttributeSchema {
  @ApiProperty({ example: 'Seed Diameter' })
  label: string;

  @ApiProperty({ example: '20cm' })
  value: string;
}

export class AllocationSettingSchema {
  @ApiProperty({ example: 1 })
  tierNumber?: number;

  @ApiProperty({ example: 20 })
  allocationPercent?: number;
}
export class PoolUsers {
  @ApiProperty({ example: '0xa75B0c39daf791d9C956BBFfEE2842c6b4dFe0C6' })
  address: string;

  @ApiProperty({ example: 'abc' })
  name: string;

  @ApiProperty({ example: 1 })
  tier: number;
}
export class FNFTSchema {
  @ApiProperty({ example: 4000 })
  nftId: number;

  @ApiProperty({ example: 'Leo' })
  nftName: string;

  @ApiProperty({ type: NFTAttributeSchema, isArray: true })
  nftAttributes: NFTAttributeSchema[];

  @ApiProperty({ example: 'F-Leo' })
  FNFTname: string;

  @ApiProperty({ example: 'USDT' })
  fNFTSymbol: string;

  @ApiProperty({ example: '4000' })
  totalSold: string;

  @ApiProperty({ example: '1' })
  exchangeRates: string;

  @ApiProperty({ example: '4000' })
  totalSupply?: string;

  @ApiProperty({ example: '4000' })
  availableAmount?: string;
}

export class FNFTPoolSchema {
  @ApiProperty({ example: '624fba4854e5e2feae3c2af3' })
  _id: string;

  @ApiProperty({ type: Language })
  poolName: Language;

  @ApiProperty({ example: 'https://da/images.png' })
  poolImage: string;

  @ApiProperty({ type: Language })
  poolDescription: Language;

  @ApiProperty({ example: 1 })
  status: number;

  @ApiProperty({ example: '624bf460c3b4b87f82838ddb' })
  seriesId: string;

  @ApiProperty({ example: '624bf460c3b4b87f82838ddb' })
  pathId: string;

  @ApiProperty({ example: '1' })
  withdraw: string;

  @ApiProperty({ example: 'bsc' })
  blockchainNetwork: string;

  @ApiProperty({ example: '0xa75B0c39daf791d9C956BBFfEE2842c6b4dFe0C6' })
  acceptedCurrencyAddress: string;

  @ApiProperty({ example: 'USDT' })
  acceptedCurrencySymbol: string;

  @ApiProperty({ example: '18' })
  acceptedCurrencyDecimals: string;

  @ApiProperty({ example: '0xa75B0c39daf791d9C956BBFfEE2842c6b4dFe0C6' })
  receiveWalletAddress: string;

  @ApiProperty({ example: '2022-04-05T04:37:22.879Z' })
  registrationStartTime: string;

  @ApiProperty({ example: '2022-04-05T04:37:22.879Z' })
  registrationEndTime: string;

  @ApiProperty({ example: '2022-04-05T04:37:22.879Z' })
  purchaseStartTime: string;

  @ApiProperty({ example: '2022-04-05T04:37:22.879Z' })
  purchaseEndTime: string;

  @ApiProperty({ type: FNFTSchema })
  fNFT: FNFTSchema;

  @ApiProperty({ example: '2022-04-05T04:37:22.879Z' })
  createdAt?: string;

  @ApiProperty({ example: '2022-04-05T04:37:22.879Z' })
  updatedAt?: string;

  @ApiProperty({ example: 1 })
  poolId?: number;

  @ApiProperty({ example: 'https://example.com' })
  whitelistURL?: string;

  @ApiProperty({ example: 0 })
  poolType?: number;

  @ApiProperty({ example: 1 })
  step?: number;

  @ApiProperty({ type: [PoolUsers] })
  users?: PoolUsers[];

  @ApiProperty({
    isArray: true,
    type: AllocationSettingSchema,
  })
  allocationSettings?: AllocationSettingSchema[];

  @ApiProperty({ example: true })
  isFCFS?: boolean;

  @ApiProperty({ example: '100000' })
  allocationFCFS?: string;

  @ApiProperty({ example: [{ en: 'en', cn: 'cn', jp: 'cn' }] })
  timelines?: TimelineMultipleLanguage[];

  @ApiProperty({ example: '2022-04-05T04:37:22.879Z' })
  productionPeriodEndTime?: Date;

  @ApiProperty({ example: '2022-04-05T04:37:22.879Z' })
  productionPeriodStartTime?: Date;

  @ApiProperty({ example: '2022-04-05T04:37:22.879Z' })
  whitelistAnnouncementTime?:Date;

  configWhitelist: [TieringStructure]
}

export class TimelineMultipleLanguage {
  @ApiProperty({ example: 'en' })
  en: string;

  @ApiProperty({ example: 'cn' })
  cn: string;

  @ApiProperty({ example: 'jp' })
  jp: string;
}

export class GetFNFTPoolDetailResponse extends ApiSuccessResponse<FNFTPoolSchema> {
  @ApiProperty({ example: API_SUCCESS })
  code: string;

  @ApiProperty({
    type: FNFTPoolSchema,
  })
  data: FNFTPoolSchema;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(items: FNFTPoolSchema) {
    const result = new GetFNFTPoolDetailResponse();
    result.success(items);

    return result;
  }
}

export class GetFNFTPoolResponse extends ApiSuccessResponse<
  Pagination<FNFTPoolSchema[]>
> {
  @ApiProperty({ example: API_SUCCESS })
  code: string;

  @ApiProperty({
    type: Pagination,
    properties: {
      items: {
        type: 'array',
        items: { type: 'object', $ref: '#/components/schemas/FNFTPoolSchema' },
      },
    },
  })
  data: Pagination<FNFTPoolSchema[]>;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(items: Pagination<FNFTPoolSchema[]>) {
    const result = new GetFNFTPoolResponse();
    result.success(items);

    return result;
  }
}

export class GetFNFTPoolDetailError extends ApiErrorResponse {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({ type: String, example: CommonCode.DEFAULT_ERROR_MESSAGE })
  message: string;

  public static error(code: number, message: string, errors: any) {
    const result = new GetFNFTPoolDetailError();
    result.error(code, message, errors);

    return result;
  }
}

export class CreateFNFTPoolError extends ApiErrorResponse {
  @ApiProperty({ example: API_ERROR, type: String })
  code: string;

  @ApiProperty({ type: String, example: 'error' })
  message: string;

  public static error(code: string, message: string, errors: any) {
    const result = new CreateFNFTPoolError();
    result.error(code, message, errors);

    return result;
  }
}

export class FNFTPoolNotFoundError extends ApiErrorResponse {
  @ApiProperty({ example: API_ERROR, type: String })
  code: string;

  @ApiProperty({ type: String, example: 'F-NFT pool not exist' })
  message: string;

  public static error(code: string, message: string, errors: any) {
    const result = new FNFTPoolNotFoundError();
    result.error(code, message, errors);

    return result;
  }
}

export class responseImportWhiteList {
  @ApiProperty({ example: API_SUCCESS })
  code: number;
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
  data;
}

export class ResponseUserGetPool {
  @ApiProperty({ example: API_SUCCESS })
  code: number;
  @ApiProperty({
    example: {
      poolName: 'Leo pool',
      path: {
        _id: '626795048ded484bf12a64f1',
        name: 'Path Alpha',
      },
      series: {
        _id: '62679dfe17c409aeb903fc34',
        name: 'Serial name',
        status: 'on',
        description: 'Serial description',
        createdAt: '2022-04-26T07:23:42.310Z',
        updatedAt: '2022-04-26T07:23:42.310Z',
        __v: 0,
      },
      poolDescription: 'Leo pool',
      registrationStartTime: '2022-03-09T04:00:00.000Z',
      registrationEndTime: '2022-04-10T04:00:00.000Z',
      purchaseStartTime: '2022-05-11T04:00:00.000Z',
      purchaseEndTime: '2022-06-12T04:00:00.000Z',
      blockchainNetwork: 'bsc',
      target: '102.2222',
      price: '10',
      totalSold: '10.22222222222222222222222',
      tierAllocation: [
        {
          tierNumber: 1,
          allocationPercent: 10,
        },
        {
          tierNumber: 2,
          allocationPercent: 20,
        },
        {
          tierNumber: 3,
          allocationPercent: 20,
        },
        {
          tierNumber: 4,
          allocationPercent: 20,
        },
        {
          tierNumber: 5,
          allocationPercent: 20,
        },
        {
          tierNumber: 6,
          allocationPercent: 10,
        },
      ],
    },
  })
  data;
}

export class responseErrorFileWrongFormat {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({ example: 'File wrong format' })
  message: number;

  @ApiProperty({
    example: null,
  })
  data;
}

export class responseErrorAddressWrongFormat {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({ example: 'Address wrong format' })
  message: number;

  @ApiProperty({
    example: {
      addressCorrect: [
        {
          address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
        },
        {
          address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
        },
      ],
      addressIncorrect: [
        {
          address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
        },
        {
          address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
        },
      ],
    },
  })
  data;
}

export class responseErrorCalcWhitelist {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({ example: 'Address wrong format' })
  message: number;

  @ApiProperty({
    example: {
      addressCorrect: [
        {
          address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
          tier: 4,
          allocation: 1000,
        },
        {
          address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
          tier: 4,
          allocation: 1000,
        },
      ],
      addressIncorrect: [
        {
          address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
        },
        {
          address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
        },
      ],
    },
  })
  data;
}

export class responseErrorInvalidToken {
  @ApiProperty({ example: API_ERROR })
  code: number;

  @ApiProperty({ example: 'Invalid token' })
  message: number;

  @ApiProperty({
    example: null,
  })
  data;
}
export class responseCalculateWhitelist {
  @ApiProperty({ example: API_SUCCESS })
  code: number;
  @ApiProperty({
    example: [
      {
        address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
        tier: 4,
        allocation: 1000,
      },
      {
        address: '0x74de5d4fcbf63e00296fd95d33236b9794016631',
        tier: 4,
        allocation: 1000,
      },
    ],
  })
  data;
}

export class CreateFNFTPoolResponse extends ApiSuccessResponse<FNFTPool> {
  @ApiProperty({ example: API_SUCCESS })
  code: string;

  @ApiProperty({ type: FNFTPool })
  data: FNFTPool;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(data: any, isUpdate = false) {
    const result = new CreateFNFTPoolResponse();
    result.success(
      data,
      !isUpdate
        ? COMMON_MESSAGE.CREATE_SUCCESS_TXT
        : COMMON_MESSAGE.UPDATE_SUCCESS_TXT,
    );

    return result;
  }
}
