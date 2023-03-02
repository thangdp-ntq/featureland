import { KMS, S3 } from 'aws-sdk';
export class AwsUtils {
  private static s3Instance: S3;

  private static getS3Instance() {
    if (!this.s3Instance) {
      this.s3Instance = new S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
        region: process.env.AWS_S3_REGION,
      });
    }
    return this.s3Instance;
  }

  private static kmsInstance: KMS;

  private static getKMSInstance() {
    if (!this.kmsInstance) {
      this.kmsInstance = new KMS({
        accessKeyId: process.env.AWS_KMS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_KMS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      });
    }
    return this.kmsInstance;
  }

  public static uploadS3(buffer, mimetype, folder, name) {
    const s3 = this.getS3Instance();
    if (folder) name = `${folder}/${name}`;
    const params = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: String(name),
      Body: buffer,
      // ContentEncoding: 'base64',
      ContentType: mimetype,
      ACL: 'public-read',
    };
    return new Promise<string>((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data['Location']);
      });
    });
  }

  public static async encrypt(str: string) {
    const params = {
      KeyId: process.env.AWS_KMS_KEY_ID,
      Plaintext: str,
    };
    const kms = this.getKMSInstance();
    const { CiphertextBlob } = await kms.encrypt(params).promise();
    return CiphertextBlob.toString('base64');
  }

  public static async decrypt(str: string) {
    const params = {
      CiphertextBlob: Buffer.from(str, 'base64'),
    };
    const kms = this.getKMSInstance();
    const { Plaintext } = await kms.decrypt(params).promise();
    return Plaintext.toString();
  }
}
