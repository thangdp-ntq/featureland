import { UserDocument } from './../schemas/user.schema';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Serial, SerialDocument } from '~/schemas/serial.schema';
import {
  API_SUCCESS,
  SERIAL_RESPONSE_MESSAGE,
  SORT_AGGREGATE,
} from '~/common/constants';
import { Pagination } from '~/common/interface';
import {
  CreateSeriesDto,
  SeriesFilterDto,
  UpdateSeriesDto,
} from './dto/crud-series.dto';
import { Utils } from '../common/utils';
import { FNFTPool, FNFTPoolDocument, User } from '~/schemas';
import { PipelineStage } from 'mongoose';

@Injectable()
export class SeriesService {
  constructor(
    @InjectModel(Serial.name)
    private serialModel: PaginateModel<SerialDocument>,
    @InjectModel(FNFTPool.name)
    private fNFTModel: Model<FNFTPoolDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(params: CreateSeriesDto, admin: any) {
    const data = { ...params, createdBy: admin.address };
    return this.serialModel.create(data);
  }

  async update(id: string, params: UpdateSeriesDto) {
    const updated = await this.serialModel.updateOne({ _id: id }, params);
    if (updated.modifiedCount) {
      const data = await this.findById(id);
      return data.data;
    } else {
      return false;
    }
  }

  async findById(id: string) {
    const serial = await this.serialModel.findById(id).lean();
    const admins = await this.userModel.find({
      address: {
        $in: [serial.createdBy, serial.deletedBy],
      },
    });
    const createdBy = admins.find(
      (admin) => admin.address === serial.createdBy,
    );
    const deletedBy = admins.find(
      (admin) => admin.address === serial.deletedBy,
    );
    const createdByAdmin = {
      address: createdBy?.address,
      username: createdBy?.username,
    };
    const deletedByAdmin = {
      address: deletedBy?.address,
      username: deletedBy?.username,
    };
    const exitsInPool = await this.existInPools(id);
    return {
      code: API_SUCCESS,
      data: { ...serial, exitsInPool: exitsInPool },
      createdByAdmin: {
        address: createdByAdmin?.address,
        username: createdByAdmin?.username,
      },
      deletedByAdmin: {
        address: deletedByAdmin?.address,
        username: deletedByAdmin?.username,
      },
      message: 'Get Detail Serial Successfully',
    };
  }

  async getList(filter: SeriesFilterDto) {
    const { page, pageSize } = filter;
    const match: Record<string, any> = { isDeleted: false };
    const piline: PipelineStage[] = [];
    if (filter.isDeleted) {
      match.isDeleted = true;
    }
    const sort: Record<string, any> = {};
    if (filter.name) {
      match.$or = [
        {
          'name.en': Utils.queryInsensitive(filter.name.trim()),
        },
        {
          'name.jp': Utils.queryInsensitive(filter.name.trim()),
        },
        {
          'name.cn': Utils.queryInsensitive(filter.name.trim()),
        },
      ];
    }
    if (filter.status) {
      match.status = { $in: [filter.status.trim()] };
    }
    piline.push(
      { $match: match },
      {
        $lookup: {
          from: 'User',
          let: { id: '$deletedBy' },
          pipeline: [
            { $match: { $expr: { $eq: ['$address', '$$id'] } } },
            {
              $project: {
                username: 1,
                address: 1,
              },
            },
          ],
          as: 'deletedBy',
        },
      },
    );
    piline.push({
      $lookup: {
        from: 'User',
        let: { id: '$createdBy' },
        pipeline: [
          { $match: { $expr: { $eq: ['$address', '$$id'] } } },
          {
            $project: {
              username: 1,
              address: 1,
            },
          },
        ],
        as: 'createdBy',
      },
    });
    piline.push(
      { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$deletedBy', preserveNullAndEmptyArrays: true } },
    );

    if (filter.sortField && filter.sortType) {
      sort[filter.sortField] = SORT_AGGREGATE[filter.sortType.toUpperCase()];
    } else {
      if (filter.isDeleted) {
        sort['deletedOn'] = SORT_AGGREGATE.DESC;
      } else {
        sort['createdAt'] = SORT_AGGREGATE.DESC;
      }
    }
    const $facet: any = {
      pageInfo: [{ $count: 'totalItem' }],
      items: [
        { $sort: sort },
        { $skip: page <= 1 ? 0 : (page - 1) * pageSize },
        { $limit: pageSize },
      ],
    };

    piline.push({
      $project: {
        _id: 1,
        name: 1,
        status: 1,
        description: 1,
        createdAt: 1,
        createdBy: 1,
        updatedAt: 1,
        isDeleted: 1,
        deletedOn: 1,
        deletedBy: 1,
      },
    });
    if (Object.values(sort).length) {
      piline.push({ $sort: sort });
      $facet.items.push({ $sort: sort });
      piline.push({ $facet });
    } else {
      piline.push({ $facet });
    }
    const items = await this.serialModel
      .aggregate(piline)
      .collation({ locale: 'en_US', strength: 1 });
    if (!items.length) {
      return {
        items: [],
        pageCurrent: page,
        totalDocs: 0,
        hasPrevPage: false,
        hasNextPage: false,
      };
    } else {
      const [result] = items;
      const [pageInfo] = result.pageInfo;

      const totalItem = pageInfo?.totalItem;
      const totalPages = Math.ceil(totalItem / pageSize);
      return {
        items: result.items,
        pageCurrent: page,
        totalDocs: totalItem,
        hasPrevPage: page > 1 && totalItem > 0,
        hasNextPage: page < totalPages,
      };
    }
  }
  async findOne(filter: object) {
    return this.serialModel.findOne(filter);
  }

  async findAllSeriesUser(query) {
    const match = { status: 'on' };
    if (query.getAllSeries) {
      delete match.status;
    }
    const sort = {};
    if (query.name) {
      match['$or'] = [
        {
          'name.en': Utils.queryInsensitive(query.name.trim()),
        },
        {
          'name.jp': Utils.queryInsensitive(query.name.trim()),
        },
        {
          'name.cn': Utils.queryInsensitive(query.name.trim()),
        },
      ];
    }
    if (query.status) {
      Object.assign(match, { status: query.status });
    }
    if (query.sortField && query.sortType) {
      sort[query.sortField] = SORT_AGGREGATE[query.sortType.toUpperCase()];
    } else {
      sort['createdAt'] = SORT_AGGREGATE.DESC;
    }
    const series = await this.serialModel.find(match).sort(sort);
    return series;
  }

  async existInPools(id: string): Promise<boolean> {
    return (await this.fNFTModel.findOne({ seriesId: id })) ? true : false;
  }
  async remove(id: string) {
    await this.serialModel.deleteOne({ _id: id });
    return {
      code: API_SUCCESS,
      message: SERIAL_RESPONSE_MESSAGE.SERIAL_DELETE_SUCCESS,
      data: null,
      error: {},
    };
  }

  async delete(id: string, admin: any) {
    await this.serialModel.updateOne(
      { _id: id },
      { isDeleted: true, deletedBy: admin.address, deletedOn: new Date() },
    );
    return {
      code: API_SUCCESS,
      message: SERIAL_RESPONSE_MESSAGE.SERIAL_DELETE_SOFT_SUCCESS,
      data: null,
      error: {},
    };
  }

  async restore(id: string) {
    await this.serialModel.updateOne(
      { _id: id },
      {
        isDeleted: false,
        $unset: {
          deletedBy: 1,
          deletedOn: 1,
        },
      },
    );
    return {
      code: API_SUCCESS,
      message: SERIAL_RESPONSE_MESSAGE.SERIAL_RESTORE_SUCCESS,
      data: null,
      error: {},
    };
  }

  async restoreAll() {
    await this.serialModel.updateMany(
      { isDeleted: true },
      { isDeleted: false },
    );
    return {
      code: API_SUCCESS,
      message: SERIAL_RESPONSE_MESSAGE.SERIAL_RESTORE_SUCCESS,
      data: null,
      error: {},
    };
  }
}
