import { ApiProperty } from '@nestjs/swagger';
import { API_SUCCESS, CommonCode } from '~/common/constants';
import { Pagination } from '~/common/interface';
import { FNFTPool, Path, User } from '~/schemas';
import { ApiSuccessResponse } from '../../common/responses/api-success';
export class IHomeSections {
  @ApiProperty({
    type: 'array',
    items: { type: 'object', $ref: '#/components/schemas/FNFTPoolSchema' },
  })
  registerNow: FNFTPool[];
  @ApiProperty({
    type: 'array',
    items: { type: 'object', $ref: '#/components/schemas/FNFTPoolSchema' },
  })
  onSale: FNFTPool[];
  @ApiProperty({
    type: 'array',
    items: { type: 'object', $ref: '#/components/schemas/FNFTPoolSchema' },
  })
  comingSoon: FNFTPool[];
  @ApiProperty({
    type: 'array',
    items: { type: 'object', $ref: '#/components/schemas/FNFTPoolSchema' },
  })
  onSaleSoon: FNFTPool[];
  @ApiProperty({
    type: 'array',
    items: { type: 'object', $ref: '#/components/schemas/FNFTPoolSchema' },
  })
  completed: FNFTPool[];
}
export class UserResult extends ApiSuccessResponse<User> {
  @ApiProperty({ type: User })
  data: User;
  public static success(items: User) {
    const result = new UserResult();
    result.success(items);

    return result;
  }
}
export class HomeSectionResult extends ApiSuccessResponse<IHomeSections> {
  @ApiProperty({ type: IHomeSections })
  data: IHomeSections;
  public static success(items: IHomeSections) {
    const result = new HomeSectionResult();
    result.success(items);

    return result;
  }
}

export class HomePathResult extends ApiSuccessResponse<Path[]> {
  @ApiProperty({
    type: 'array',
    items: { type: 'object', $ref: '#/components/schemas/Path' },
  })
  data: Path[];
  public static success(items: Path[]) {
    const result = new HomePathResult();
    result.success(items);

    return result;
  }
}

export class HomeHistoryReportResult extends ApiSuccessResponse<
  Record<string, any>
> {
  @ApiProperty({
    type: 'object',
    properties: {
      HistoryReportEn: {
        type: 'object',
        properties: {
          updateBy: { type: 'string', example: 'DJames ABC' },
          historyReportUrl: {
            type: 'string',
            example:
              'https://da-fractionalize-api.ekoios.net/1652346314809-sample.pdf',
          },
          createdAt: { type: 'Date', example: '2022-05-12T09:05:14.812Z' },
          updatedAt: { type: 'Date', example: '2022-05-12T09:05:14.812Z' },
          language: { type: 'string', example: 'en' },
        },
      },
      HistoryReportJp: {
        type: 'object',
        properties: {
          updateBy: { type: 'string', example: 'DJames ABC' },
          historyReportUrl: {
            type: 'string',
            example:
              'https://da-fractionalize-api.ekoios.net/1652346314809-sample.pdf',
          },
          createdAt: { type: 'Date', example: '2022-05-12T09:05:14.812Z' },
          updatedAt: { type: 'Date', example: '2022-05-12T09:05:14.812Z' },
          language: { type: 'string', example: 'en' },
        },
      },
      HistoryReportCn: {
        type: 'object',
        properties: {
          updateBy: { type: 'string', example: 'DJames ABC' },
          historyReportUrl: {
            type: 'string',
            example:
              'https://da-fractionalize-api.ekoios.net/1652346314809-sample.pdf',
          },
          createdAt: { type: 'Date', example: '2022-05-12T09:05:14.812Z' },
          updatedAt: { type: 'Date', example: '2022-05-12T09:05:14.812Z' },
          language: { type: 'string', example: 'en' },
        },
      },
    },
  })
  data: Record<string, any>;
  public static success(items: Record<string, any>) {
    const result = new HomeHistoryReportResult();
    result.success(items);

    return result;
  }
}

export class HistoryStakingResult extends ApiSuccessResponse<
  Record<string, any>
> {
  data: Record<string, any>;
  public static success(items: Record<string, any>) {
    const result = new HistoryStakingResult();
    result.success(items);

    return result;
  }
}
export class HomeFNFTPoolsResult extends ApiSuccessResponse<
  Pagination<FNFTPool[]>
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
  data: Pagination<FNFTPool[]>;

  @ApiProperty({ example: CommonCode.DEFAULT_SUCCESS_MESSAGE })
  message: string;

  public static success(items: Pagination<FNFTPool[]>) {
    const result = new HomeFNFTPoolsResult();
    result.success(items);

    return result;
  }
}
