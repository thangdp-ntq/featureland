import { Logger, UnsupportedMediaTypeException } from '@nestjs/common';
import ObjectID from 'bson-objectid';
import { Types } from 'mongoose';
import BigNumber from 'bignumber.js';
import { CommonCode, FileUpload, NFT_RESPOND_MESSAGE } from './constants';
const CryptoJS = require('crypto-js');
import { Model } from 'mongoose';
export class Utils {
  private static readonly logger = new Logger(Utils.name);

  /**
   * Check string is Mongo ObjectId
   * @param {string} str
   * @return {boolean}
   */
  public static isObjectId(str: string) {
    try {
      new Types.ObjectId(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  public static convertToBytes(str: string) {
    return '0x' + str;
  }

  public static revertFromBytes(str: string) {
    return str.slice(2);
  }

  /**
   * Convert string to Mongo ObjectId
   * @param {any} str
   * @return {Types.ObjectId}
   */
  public static toObjectId(str: any) {
    return new Types.ObjectId(str);
  }

  /**
   * Create mongodb id
   * @return {Types.ObjectId}
   */
  public static createObjectId() {
    return new Types.ObjectId(new ObjectID());
  }

  /**
   * Convert array string to array Mongo ObjectId
   * @param {string[]} strs
   * @return {Types.ObjectId[]}
   */
  public static toObjectIds(strs: string[]) {
    return strs.map((str) => this.toObjectId(str));
  }

  /**
   * Convert price
   * @param {any} value
   * @param {number} coinDecimal
   * @return {string}
   */
  public static convertPrice(value: any, coinDecimal = 18) {
    BigNumber.config({
      EXPONENTIAL_AT: 100,
    });
    return new BigNumber(value)
      .multipliedBy(new BigNumber(Math.pow(10, coinDecimal)))
      .toString();
  }

  /**
   * Get random element from array
   * @param {any[]} array
   * @return {any}
   */
  public static getRandom(array: any[]) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Wait
   * @param {number} ms
   * @return {Promise}
   */
  public static wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Retry a promoise function
   * @param {any} operation
   * @param {number} retries
   * @param {number} delay
   * @return {Promise<any>}
   */
  public static retryFn(operation, retries = 3, delay = 500) {
    return new Promise((resolve, reject) => {
      return operation()
        .then(resolve)
        .catch((reason) => {
          if (retries > 0) {
            return Utils.wait(delay)
              .then(this.retryFn.bind(null, operation, retries - 1, delay))
              .then(resolve)
              .catch(reject);
          }
          return reject(reason);
        });
    });
  }

  /**
   * Encrypt
   * @param {string} str
   * @return {string}
   */
  public static encrypt(str) {
    return CryptoJS.AES.encrypt(str, process.env.CRYPTO_SECRET).toString();
  }

  /**
   * Decrypt
   * @param {string} ciphertext
   * @return {string}
   */
  public static decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.CRYPTO_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  public static hashMD5(text) {
    return CryptoJS.MD5(text).toString();
  }

  /**
   * Paginate
   * @param {any} model
   * @param {any} match
   * @param {any} query
   * @return {Promise<any>}
   */
  public static paginate(
    model: any,
    match: any,
    query: any,
    pagingOption = {},
  ) {
    this.logger.debug('paginate(): match', JSON.stringify(match));
    const pagingOptions: any = {
      page: query.page,
      limit: query.limit,
      sort: query.sort ? query.sort : { createdAt: 'desc' },
      ...pagingOption,
    };
    if (query.projection) {
      pagingOptions.projection = {};
      for (const [key, value] of Object.entries(query.projection)) {
        pagingOptions.projection[key] = value;
      }
    }

    if (query?.populate) {
      pagingOptions.populate = query.populate;
    }

    this.logger.debug(
      'paginate(): pagingOptions',
      JSON.stringify(pagingOptions),
    );
    return model.paginate(match, pagingOptions);
  }

  /**
   * Paginate
   * @param {any} model
   * @param {any} pipe
   * @param {any} query
   * @return {Promise<any>}
   */
  public static aggregatePaginate(model: any, pipe: any, query: any) {
    this.logger.debug('aggregatePaginate(): match', JSON.stringify(pipe));
    const pagingOptions: any = {
      page: query.page,
      limit: query.limit,
      sort: query.sort ? query.sort : { createdAt: 'desc' },
    };
    if (query.projection) {
      pagingOptions.projection = query.projection;
    }
    return model.aggregatePaginate(model.aggregate(pipe), pagingOptions);
  }

  public static escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  public static queryInsensitive(value) {
    return { $regex: Utils.escapeRegex(value), $options: 'i' };
  }

  public static fileFilterImage(req, file: Express.Multer.File, cb) {
    if (!FileUpload.mimetypeImage.includes(file.mimetype)) {
      return cb(
        new UnsupportedMediaTypeException({
          code: CommonCode.E4,
          message: NFT_RESPOND_MESSAGE.FILE_FORMAT_NOT_SUPPORT,
          errors: {},
        }),
        false,
      );
    }
    if (FileUpload.limitFile < file.size) {
      return cb(
        new UnsupportedMediaTypeException({
          code: CommonCode.E3,
          message: NFT_RESPOND_MESSAGE.FILE_SIZE_ERROR,
          errors: {},
        }),
        false,
      );
    }
    return cb(null, true);
  }

  public static fileFilterImageVideo(req, file: Express.Multer.File, cb) {
    if (
      !FileUpload.mimetypeImage.includes(file.mimetype) &&
      !FileUpload.mimetypeVideo.includes(file.mimetype)
    ) {
      return cb(
        new UnsupportedMediaTypeException({
          code: CommonCode.E4,
          message: NFT_RESPOND_MESSAGE.FILE_FORMAT_NOT_SUPPORT,
          errors: {},
        }),
        false,
      );
    }
    if (
      FileUpload.mimetypeImage.includes(file.mimetype) &&
      FileUpload.limitFile < file.size
    ) {
      return cb(
        new UnsupportedMediaTypeException({
          code: CommonCode.E3,
          message: NFT_RESPOND_MESSAGE.FILE_SIZE_ERROR,
          errors: {},
        }),
        false,
      );
    }
    if (
      FileUpload.mimetypeVideo.includes(file.mimetype) &&
      FileUpload.limitFileVideo < file.size
    ) {
      return cb(
        new UnsupportedMediaTypeException({
          code: CommonCode.E3,
          message: NFT_RESPOND_MESSAGE.FILE_SIZE_ERROR,
          errors: {},
        }),
        false,
      );
    }
    return cb(null, true);
  }

  public static fileFilterVideo(req, file: Express.Multer.File, cb) {
    if (!FileUpload.mimetypeVideo.includes(file.mimetype)) {
      return cb(
        new UnsupportedMediaTypeException({
          code: CommonCode.E4,
          message: NFT_RESPOND_MESSAGE.FILE_FORMAT_NOT_SUPPORT,
          errors: {},
        }),
        false,
      );
    }
    if (FileUpload.limitFileVideo < file.size) {
      return cb(
        new UnsupportedMediaTypeException({
          code: CommonCode.E3,
          message: NFT_RESPOND_MESSAGE.FILE_SIZE_ERROR,
          errors: {},
        }),
        false,
      );
    }
    return cb(null, true);
  }

  public static fileFilterPdf(req, file: Express.Multer.File, cb) {
    if (!FileUpload.mimetypePdf.includes(file.mimetype)) {
      return cb(
        new UnsupportedMediaTypeException({
          code: CommonCode.E4,
          message: NFT_RESPOND_MESSAGE.FILE_FORMAT_NOT_SUPPORT,
          errors: {},
        }),
        false,
      );
    }
    return cb(null, true);
  }

  // /**
  //  *
  //  * @param data: string date format: "DD/MM/YYYY HH:MM:SS"
  //  */
  // public static convertStringToDate(data) {

  // }

  public static fileFilterCsv(req, file: Express.Multer.File, cb) {
    if (!FileUpload.mimetypeCsv.includes(file.mimetype)) {
      return cb(
        new UnsupportedMediaTypeException({
          code: CommonCode.E4,
          message: NFT_RESPOND_MESSAGE.FILE_FORMAT_NOT_SUPPORT,
          errors: {},
        }),
        false,
      );
    }
    return cb(null, true);
  }

  public static async checkExistInDBById(model: Model<unknown>, id: string) {
    return (await model.findById(id)) || false;
  }

  public static validateFile(
    file: Express.Multer.File,
    require: boolean = false,
    maxSize: number = 2,
  ) {
    if (require && !file) {
      return {
        isValid: false,
        message: 'File is require',
      };
    }
    if (!require && file) {
      if (file.size > maxSize * 1024 * 1024) {
        return {
          isValid: false,
          message: `File size is exceeding ${maxSize}MB`,
        };
      }
    }
    return {
      isValid: true,
      message: '',
    };
  }

  public static convertNumberToNoExponents(number) {
    const data = String(number).split(/[eE]/);
    if (data.length == 1) return data[0];

    let z = '';
    const sign = number < 0 ? '-' : '';
    const str = data[0].replace('.', '');
    let mag = Number(data[1]) + 1;

    if (mag < 0) {
      z = sign + '0.';
      while (mag++) z += '0';
      return z + str.replace(/^\-/, '');
    }
    mag -= str.length;
    while (mag--) z += '0';
    return str + z;
  }

  public static validateMaxLengthOfNumber(number, maxLength, maxDecimal = 0) {
    const fullNumber = this.convertNumberToNoExponents(number);
    const splitNumber = fullNumber.split('.');
    if (
      maxDecimal === 0 &&
      (fullNumber.length > maxLength || splitNumber.length > 1)
    ) {
      return false;
    }
    if (splitNumber.length > 1) {
      if (
        splitNumber[0].length + splitNumber[1].length > maxLength ||
        splitNumber[1].length > maxDecimal
      )
        return false;
    } else {
      return splitNumber[0].length <= maxLength;
    }
    return true;
  }

  public static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static validateLengthOfString(str, maxLength = 256) {
    return str.length <= maxLength;
  }

  public static convertWithCommas(str: string) {
    const parts = str.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  public static convertMilisecondsToSeconds(str: string) {
    const date = (Number(str) / 1000).toFixed(0);
    return date;
  }

  public static timeout(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
