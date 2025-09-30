import { IUploader, UploadOptions, UploadResult, UrlOptions } from './interfaces';
import { local } from './drivers/local';
import { CloudinaryDriver, CloudinaryConfig } from './drivers/cloudinary';
// import { S3Driver, S3Config } from "./drivers/s3";

type Provider = 'local' | 'cloudinary'; // expansible

interface UploaderConfig {
  provider: Provider;
  config?: any;
}

export class Uploader {
  private driver: IUploader;

  constructor({ provider, config }: UploaderConfig) {
    switch (provider) {
      case 'local':
        this.driver = local;
        break;
      case 'cloudinary':
        this.driver = new CloudinaryDriver(config as CloudinaryConfig);
        break;
      default:
        throw new Error(`Provider "${provider}" not supported`);
    }
  }

  async upload(file: Buffer, options?: UploadOptions): Promise<UploadResult> {
    return this.driver.upload(file, options);
  }

  async delete(publicId: string): Promise<void> {
    await this.driver.delete(publicId);
  }

  getUrl(publicId: string, options?: UrlOptions): string {
    if (!this.driver.getUrl) return publicId;
    return this.driver.getUrl(publicId, options);
  }
}
