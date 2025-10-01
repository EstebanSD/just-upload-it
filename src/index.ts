import { IUploader, UploadOptions, UploadResult, UrlOptions } from './interfaces';
import { LocalDriver, LocalConfig } from './drivers/local';
import { CloudinaryDriver, CloudinaryConfig } from './drivers/cloudinary';

type UploaderConfig =
  | { provider: 'local'; config?: LocalConfig }
  | { provider: 'cloudinary'; config: CloudinaryConfig };

export class Uploader {
  private driver: IUploader;

  constructor({ provider, config }: UploaderConfig) {
    switch (provider) {
      case 'local':
        this.driver = new LocalDriver();
        break;
      case 'cloudinary':
        this.driver = new CloudinaryDriver(config);
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
