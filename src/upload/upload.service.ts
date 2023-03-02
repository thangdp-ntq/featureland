import { UploadedFile } from '@nestjs/common';
import { API_SUCCESS } from '../common/constants';
import { create } from 'ipfs-http-client';
import { API_ERROR } from '~/common/constants';
import { S3 } from 'aws-sdk';
export class UploadService {
  async uploadFileS3(@UploadedFile() file, folder: string = '', name = '') {
    try {
      const s3 = this.getS3();
      if (name === '') name = `${new Date().getTime()}-${file.originalname}`;
      if (folder) name = `${folder}/${name}`;
      const uploadResult = await s3
        .upload({
          Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
          Body: file.buffer,
          Key: name,
          ContentEncoding: 'base64',
          ContentType: file.mimetype,
          ACL: 'public-read',
        })
        .promise();
      return {
        code: API_SUCCESS,
        data: uploadResult.Location,
        message: '',
        error: {},
      };
    } catch (error) {
      return {
        code: API_ERROR,
        message: '',
        error: error,
      };
    }
  }

  async uploadFileIpfs(@UploadedFile() file: Express.Multer.File) {
    const ipfs = this.getIPFS();
    const files = await ipfs.add(file.buffer);
    return {
      code: API_SUCCESS,
      data: {
        cid: files.path,
      },
      message: '',
      error: {},
    };
  }
  getIPFS() {
    const port = Number(process.env.IPFS_PORT);
    return create({ host: process.env.IPFS_URI, port });
  }

  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      region: process.env.AWS_S3_REGION,
    });
  }
}
