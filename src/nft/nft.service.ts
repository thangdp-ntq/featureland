import { NFTLog, NFTLogDocument } from './../schemas/nft-log.schema';
import { FNFT, FNFTPool, User, UserDocument } from '~/schemas';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { NFT, NFTDocument } from '../schemas/NFT.schema';
import { CreateNftDto } from './dto/create-nft.dto';
import { FractionalizeNFT, UpdateNftDto } from './dto/update-nft.dto';
import { Model, Connection } from 'mongoose';
import {
  API_ERROR,
  API_SUCCESS,
  NFT_Status,
  NFT_RESPOND_MESSAGE,
  SORT_AGGREGATE,
  WEBHOOK_EXCEPTION,
  MIMEType,
  DECIMALS_DAD,
} from '../common/constants';

import { Utils } from '../common/utils';
import { BatchLabel, BatchLabelDocument } from '../schemas/batch-label.schema';
import { UploadService } from '../upload/upload.service';
import BigNumber from 'bignumber.js';
import {
  MetaDataFields,
  MetaDataFieldsDocument,
} from '../schemas/metadata-fields.schema';
import { ErrorDetail } from '../common/responses/api-error';
import { PipelineStage } from 'mongoose';
import { AwsUtils } from '~/common/aws.util';
import { HttpError } from '~/common/responses/api-errors';

@Injectable()
export class NftService {
  constructor(
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
    @InjectModel(BatchLabel.name) private labelModel: Model<BatchLabelDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(NFTLog.name) private logModel: Model<NFTLogDocument>,
    @InjectModel(MetaDataFields.name)
    private metaDataModel: Model<MetaDataFieldsDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}


  async getNfts({ pageSize = 10, page = 1, ...getParams }): Promise<any> {
    const match: Record<string, any> = {
      deleted: false,
      status: { $not: { $regex: Utils.escapeRegex('processing') } },
    };
    const sort: Record<string, any> = {};

    if (getParams.isDeleted) {
      match['deleted'] = true;
    }

    if (getParams.hasOwnProperty('status')) {
      Object.assign(match, {
        ...match,
        status: { $in: [getParams.status] },
      });
    }
    if (getParams.hasOwnProperty('textSearch')) {
      Object.assign(match, {
        ...match,
        $or: [
          {
            NFTname: {
              $regex: Utils.escapeRegex(getParams.textSearch.trim()),
              $options: 'i',
            },
          },
          {
            tokenId: Number(getParams.textSearch.trim()),
          },
        ],
      });
    }

    if (getParams.sortField && getParams.sortType) {
      sort[getParams.sortField] =
        SORT_AGGREGATE[getParams.sortType.toUpperCase()];
    } else {
      if (getParams.isDeleted) {
        sort['deletedOn'] = SORT_AGGREGATE.DESC;
      } else {
        sort['createdAt'] = SORT_AGGREGATE.DESC;
      }
    }
    const piline: PipelineStage[] = [];
    piline.push({
      $lookup: {
        from: FNFTPool.name,
        as: FNFTPool.name,
        localField: 'tokenId',
        foreignField: 'fNFT.nftId',
      },
    });
    // if(getParams.hasFNFTPool) {
    //   piline.push({
    //     $match: {status
    //       ...match,
    //       FNFTPool: { $ne: []},
    //     },
    //   })
    // }
    if (getParams.hasFNFTPool === undefined) {
      piline.push({
        $match: {
          ...match,
        },
      });
    }
    if (getParams.hasFNFTPool == false) {
      piline.push({
        $match: {
          ...match,
          FNFTPool: [],
        },
      });
    }
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
    piline.push({
      $lookup: {
        from: 'User',
        let: { id: '$updatedBy' },
        pipeline: [
          { $match: { $expr: { $eq: ['$address', '$$id'] } } },
          {
            $project: {
              username: 1,
              address: 1,
            },
          },
        ],
        as: 'updatedBy',
      },
    });
    piline.push({
      $lookup: {
        from: 'User',
        let: { id: '$fractionalizeBy' },
        pipeline: [
          { $match: { $expr: { $eq: ['$address', '$$id'] } } },
          {
            $project: {
              username: 1,
              address: 1,
            },
          },
        ],
        as: 'fractionalizeBy',
      },
    });
    piline.push({
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
    });
    piline.push(
      { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$updatedBy', preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: '$fractionalizeBy', preserveNullAndEmptyArrays: true },
      },
      { $unwind: { path: '$deletedBy', preserveNullAndEmptyArrays: true } },
    );

    piline.push({
      $project: {
        NFTname: 1,
        createdAt: 1,
        _id: 1,
        status: 1,
        imageURL: 1,
        tokenId: 1,
        nftTransactionHash: 1,
        fNFTTransactionHash: 1,
        metaDataFields: 1,
        createdBy: 1,
        updatedAt: 1,
        updatedBy: 1,
        deletedOn: 1,
        deletedBy: 1,
        fractionalizeBy: 1,
        fractionalizeOn: 1,
      },
    });
    const $facet: any = {
      pageInfo: [{ $count: 'totalItem' }],
      items: [
        { $sort: sort },
        { $skip: page <= 1 ? 0 : (page - 1) * pageSize },
        { $limit: pageSize },
      ],
    };
    if (Object.values(sort).length) {
      piline.push({ $sort: sort });
      $facet.items.push({ $sort: sort });
      piline.push({ $facet });
    } else {
      piline.push({ $facet });
    }
    const items = await this.nftModel
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
      const {
        pageInfo: [pageInfo],
      } = result;

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

  async findOne(id: number) {
    const nft = await this.nftModel.findOne({ tokenId: id });
    if (!nft)
      return {
        code: HttpStatus.NOT_FOUND,
        data: null,
        message: NFT_RESPOND_MESSAGE.NFT_NOT_FOUND,
        error: { message: NFT_RESPOND_MESSAGE.NFT_NOT_FOUND },
      };

    const admins = await this.userModel.find({
      address: {
        $in: [nft.createdBy, nft.updatedBy, nft.deletedBy, nft.fractionalizeBy],
      },
    });
    const createdBy = admins.find((admin) => admin.address === nft.createdBy);
    const updatedBy = admins.find((admin) => admin.address === nft.updatedBy);
    const deletedBy = admins.find((admin) => admin.address === nft.deletedBy);
    const fractionalizeBy = admins.find(
      (admin) => admin.address === nft.fractionalizeBy,
    );
    return {
      code: API_SUCCESS,
      data: {
        id: nft.id,
        imageUrl: nft.imageURL,
        status: nft.status,
        transactionId: nft.transactionId ? nft.transactionId : null,
        symbol: nft.symbol,
        FNFTname: nft.FNFTname,
        numberFNFT: nft.numberFNFT,
        contractAddress: nft.contractAddress,
        imageName: nft.imageName,
        description: nft.description,
        nftId: nft.tokenId,
        NFTname: nft.NFTname,
        availableAmount: nft.availableAmount,
        nftIdHash: nft.nftIdHash,
        fNFTIdHash: nft.fNFTIdHash,
        hasFNFTPool: nft.hasFNFTPool,
        nftTransactionHash: nft.nftTransactionHash,
        fNFTTransactionHash: nft.fNFTTransactionHash,
        metaDataFields: nft.metaDataFields,
        createdAt: nft.createdAt,
        updatedAt: nft.updatedAt,
        createdBy: {
          address: createdBy?.address,
          username: createdBy?.username,
        },
        updatedBy: {
          address: updatedBy?.address,
          username: updatedBy?.username,
        },
        deletedBy: {
          address: deletedBy?.address,
          username: deletedBy?.username,
        },
        deletedOn: nft?.deletedOn,
        fractionalizeBy: {
          address: fractionalizeBy?.address,
          username: fractionalizeBy?.username,
        },
        fractionalizeOn: nft.fractionalizeOn,
        deleted: nft.deleted,
      },
      message: '',
      error: {},
    };
  }

  async update(id: string, updateNftDto: UpdateNftDto) {
    const nft = await this.nftModel.findById(id);
    if (nft.deleted)
      return {
        code: API_ERROR,
        message: NFT_RESPOND_MESSAGE.NFT_UPDATE_FAIL,
        data: null,
        error: { message: NFT_RESPOND_MESSAGE.NFT_IS_DELETED },
      };
    await this.nftModel.updateOne({ _id: id }, updateNftDto);
    const nftUpdate = await this.nftModel.findById(id);
    return {
      code: API_SUCCESS,
      message: NFT_RESPOND_MESSAGE.NFT_UPDATE_SUCCESS,
      data: nftUpdate,
      error: {},
    };
  }

  async delete(id: string, admin: any) {
    const nft = await this.nftModel.findOne({ _id: id });
    if (nft.hasFNFTPool) {
      throw HttpError.error(
        HttpStatus.BAD_REQUEST,
        NFT_RESPOND_MESSAGE.NFT_ALREADY_IN_POOL,
        {},
      );
    }
    await this.nftModel.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedBy: admin.address,
        deletedOn: new Date(),
        updatedBy: admin.address,
      },
    );
    return {
      code: API_SUCCESS,
      message: NFT_RESPOND_MESSAGE.NFT_DELETE_SUCCESS,
      data: null,
      error: {},
    };
  }


  validateMetaData(metaData) {
    for (let i = 1; i < metaData.length; i++) {
      if (metaData.slice(i).find((e) => e.en == metaData[i - 1].en)) {
        return false;
      }
      if (metaData.slice(i).find((e) => e.cn == metaData[i - 1].cn)) {
        return false;
      }
      if (metaData.slice(i).find((e) => e.jp == metaData[i - 1].jp)) {
        return false;
      }
    }
    return true;
  }
  async updateLabel(metaDataFields) {
    const isExistMetaFields = await this.metaDataModel.findOne();
    const isValid = this.validateMetaData(metaDataFields.metaDataFields);
    if (!isValid) return NFT_RESPOND_MESSAGE.LABEL_NAME_IS_EXIST;
    if (!isExistMetaFields) {
      await this.metaDataModel.create(metaDataFields);
    } else {
      await this.metaDataModel.updateOne(
        { _id: isExistMetaFields._id },
        metaDataFields,
      );
    }
    return {
      code: API_SUCCESS,
      message: NFT_RESPOND_MESSAGE.NFT_UPDATE_LABEL_SUCCESS,
      error: {},
      data: metaDataFields,
    };
  }

  async fractionalizeNFT(id: number, fractionalize: FractionalizeNFT) {
    await this.nftModel.updateOne(
      { tokenId: id },
      {
        FNFTname: fractionalize.FNFTname,
        symbol: fractionalize.symbol,
        numberFNFT: fractionalize.numberFNFT,
        availableAmount: fractionalize.numberFNFT,
      },
    );
    const nft = await this.nftModel.findOne({ tokenId: id });
    return {
      code: API_SUCCESS,
      message: NFT_RESPOND_MESSAGE.NFT_FRACTIONALIZED_SUCCESS,
      data: nft,
      error: {},
    };
  }

  async getLabel() {
    const metaDataFields = await this.metaDataModel.findOne();
    return {
      code: API_SUCCESS,
      message: '',
      data: metaDataFields,
      error: {},
    };
  }

  async mappingAttributeNft(nft) {
    const labelAttributes = await this.labelModel.find({ index: [1, 2, 3, 4] });
    const res = [{}, {}, {}, {}];
    labelAttributes.map((labelAttribute) => {
      res[labelAttribute.index - 1] = {
        [labelAttribute.label.en]: nft[`nftAttribute${labelAttribute.index}`]
          ? nft[`nftAttribute${labelAttribute.index}`]
          : null,
      };
    });
    return res;
  }

  async genJsonObjectMetadata(nft) {
    const attributes = nft.metaDataFields.map((metaDataField) => {
      return {
        trait_type: metaDataField.en,
        value: metaDataField.value,
      };
    });
    const metaData = {
      name: nft.NFTname,
      description: nft.description.en ? nft.description.en : '',
      image: `${process.env.IPFS_URI_PUBLIC}/${nft.ipfsCid}`,
      external_url: nft.imageURL,
      attributes: attributes,
    };
    const fileMetaData = {
      fieldname: nft._id,
      originalname: nft._id,
      metaData,
    };
    return await AwsUtils.uploadS3(
      JSON.stringify(fileMetaData),
      MIMEType.APPLICATION_JSON,
      process.env.AWS_FOLDER_METADATA,
      nft.tokenId,
    );
  }

  async getFNFTByNFTId(nftId): Promise<FNFT> {
    const nft = await this.nftModel.findOne({ tokenId: nftId });
    let fNFT: FNFT = null;
    if (nft) {
      fNFT = {
        nftId: nft.tokenId,
        nftName: nft.NFTname,
        description: nft.description,
        FNFTname: nft.FNFTname,
        fNFTSymbol: nft.symbol,
        nftAttributes: nft.attributes,
        totalSupply: nft.numberFNFT,
        availableAmount: nft.numberFNFT,
        exchangeRates: '0',
        totalSold: '0',
        nftIdHash: nft?.nftIdHash,
        fNFTIdHash: nft?.fNFTIdHash,
        nftTransactionHash: nft?.nftTransactionHash,
        fNFTTransactionHash: nft?.fNFTTransactionHash,
        metaDataFields: nft.metaDataFields,
        fNFTUrl: nft.imageURL,
      };
    }
    return fNFT;
  }

  async updateNFTWhenMintSuccess(tokenId, data) {
    const nft = await this.nftModel.findOne({
      tokenId: tokenId,
    });
    nft.status = NFT_Status.NFT_UN_FRACTIONALIZED;
    nft.nftIdHash = data._nftToken;
    nft.nftTransactionHash = data.transactionHash;
    await nft.save();
  }

  async updateNFTWhenFractionalSuccess(
    tokenId,
    transactionHash,
    fNFTTokenId,
    symbol,
    totalSupply,
    name,
  ) {
    const nft = await this.nftModel.findOne({
      tokenId: tokenId,
    });
    totalSupply = new BigNumber(totalSupply)
      .dividedBy(Math.pow(10, DECIMALS_DAD))
      .toString();
    nft.FNFTname = name;
    nft.symbol = symbol;
    nft.numberFNFT = totalSupply;
    nft.availableAmount = totalSupply;
    nft.status = NFT_Status.NFT_FRACTIONALIZED;
    nft.fNFTTransactionHash = transactionHash;
    nft.fNFTIdHash = fNFTTokenId;
    await nft.save();
  }

  async updateNFTWhenFractionalSuccessAPI(tokenId, admin: any) {
    const nft = await this.nftModel.findOneAndUpdate(
      {
        tokenId: tokenId,
      },
      {
        status: NFT_Status.NFT_FRACTIONALIZED,
        fractionalizeBy: admin.address,
        fractionalizeOn: new Date(),
        updatedBy: admin.address,
      },
    );
    return nft;
  }

  async updateNFTWhenMintSuccessAPI(tokenId) {
    const nft = await this.nftModel.findOneAndUpdate(
      {
        tokenId: tokenId,
      },
      { status: NFT_Status.NFT_UN_FRACTIONALIZED },
    );
    return nft;
  }

  async updateAvailableAmountWhenCreateFNFTPool(nftId, poolBalance, session) {
    let countRetry = 0;
    const decimal = new BigNumber('100000000');
    const poolBalanceBigNumber = new BigNumber(poolBalance);
    const poolBalanceHex = poolBalanceBigNumber.dividedBy(decimal);
    while (true) {
      if (countRetry >= 10) {
        throw WEBHOOK_EXCEPTION.MAX_RETRY;
      }
      const nft = await this.nftModel.findOne({ tokenId: nftId });
      const availableAmount = new BigNumber(nft.availableAmount);
      const newAvailableAmount = availableAmount
        .minus(new BigNumber(poolBalanceHex))
        .toString();
      const nftUpdate = await this.nftModel.findOneAndUpdate(
        {
          tokenId: nftId,
          updatedAt: nft['updatedAt'],
        },
        {
          availableAmount: newAvailableAmount,
        },
        { session: session },
      );
      if (nftUpdate) {
        break;
      }
      countRetry++;
      await Utils.sleep(1000);
    }
  }

  validateMetaDataFields(metaDataFields) {
    const errors = [];
    if (!Array.isArray(metaDataFields)) {
      errors.push(NFT_RESPOND_MESSAGE.META_DATA_FIELDS_IS_ARRAY);
    }
    const errorsValidateMetaFields = metaDataFields.map((metaDataField) =>
      this.validateMetaDataFieldItem(metaDataField),
    );
    errors.push(errorsValidateMetaFields.flat());
    const isDuplicateNameOfMetaData =
      this.checkDuplicateNameOfMetaData(metaDataFields);
    if (isDuplicateNameOfMetaData) {
      errors.push(NFT_RESPOND_MESSAGE.LABEL_NAME_IS_EXIST);
    }
    return {
      isValid: errors.flat().length <= 0,
      errors: errors.flat(),
    };
  }

  validateMetaDataFieldItem(metaDataField) {
    const errors = [];
    if (!metaDataField.en) {
      errors.push(NFT_RESPOND_MESSAGE.EN_META_DATA_FIELD_REQUIRE);
    }
    if (metaDataField.en) {
      if (metaDataField.en.length > 256) {
        errors.push(NFT_RESPOND_MESSAGE.EN_META_DATA_FIELD_TOO_LONG);
      }
    }
    if (!metaDataField.jp) {
      errors.push(NFT_RESPOND_MESSAGE.JP_META_DATA_FIELD_REQUIRE);
    }
    if (metaDataField.jp) {
      if (metaDataField?.jp.length > 256) {
        errors.push(NFT_RESPOND_MESSAGE.JP_META_DATA_FIELD_TOO_LONG);
      }
    }
    if (!metaDataField.cn) {
      errors.push(NFT_RESPOND_MESSAGE.CN_META_DATA_FIELD_REQUIRE);
    }
    if (metaDataField.cn) {
      if (metaDataField?.cn.length > 256) {
        errors.push(NFT_RESPOND_MESSAGE.CN_META_DATA_FIELD_TOO_LONG);
      }
    }
    if (!metaDataField.value) {
      errors.push(NFT_RESPOND_MESSAGE.VALUE_META_DATA_FIELD_REQUIRE);
    }
    if (metaDataField.value) {
      if (metaDataField?.value.length > 256) {
        errors.push(NFT_RESPOND_MESSAGE.VALUE_MATE_DATA_FIELD_TOO_LONG);
      }
    }
    return errors;
  }
  checkDuplicateNameOfMetaData(metaDataFields) {
    for (let i = 0; i < metaDataFields.length - 1; i++) {
      for (let j = i + 1; j < metaDataFields.length; j++) {
        if (this.nameExist(metaDataFields[i], metaDataFields[j])) {
          return true;
        }
      }
    }
    return false;
  }
  nameExist(namePrevious, nameCurrent) {
    if (
      namePrevious.en === nameCurrent.en ||
      namePrevious.cn === nameCurrent.cn ||
      namePrevious.jp === nameCurrent.jp
    )
      return true;
    return false;
  }

  async getLog() {
    const nft = await this.logModel.aggregate([
      {
        $lookup: {
          from: 'User',
          let: { id: '$removedBy' },
          pipeline: [
            { $match: { $expr: { $eq: ['$address', '$$id'] } } },
            {
              $project: {
                username: 1,
                address: 1,
              },
            },
          ],
          as: 'removedBy',
        },
      },
      { $unwind: { path: '$removedBy', preserveNullAndEmptyArrays: true } },
    ]);
    return nft;
  }
}
