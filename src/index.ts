import {
  DeleteOptions,
  IUploader,
  UploadOptions,
  UploadResult,
  DeleteResult,
} from './lib/interfaces';
import { detectMimeType, getExtensionFromMime, getResourceType } from './lib/helpers';
import { LocalDriver, LocalConfig } from './drivers/local';
import { CloudinaryDriver, CloudinaryConfig } from './drivers/cloudinary';
import { S3Driver, S3Config } from './drivers/aws-s3';

type UploaderConfig =
  | { provider: 'local'; config?: LocalConfig }
  | { provider: 'cloudinary'; config: CloudinaryConfig }
  | { provider: 'aws-s3'; config: S3Config };

// ======================
// Interfaces & Types
// ======================
export type { DeleteOptions, UploadOptions, DeleteResult, UploadResult };
export type { LocalConfig, CloudinaryConfig, S3Config };
export type { UploaderConfig };

// ======================
// Drivers
// ======================
export { LocalDriver, CloudinaryDriver, S3Driver };

// ======================
// Main Uploader
// ======================
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
      case 'aws-s3':
        this.driver = new S3Driver(config);
        break;
      default:
        throw new Error(`Provider "${provider}" not supported`);
    }
  }

  async upload(file: Buffer, options?: UploadOptions): Promise<UploadResult> {
    // STANDARDIZATION: Automatically detect metadata
    const detectedMime = detectMimeType(file);
    const detectedFormat = getExtensionFromMime(detectedMime);
    const detectedResourceType = getResourceType(detectedMime);

    const normalizedOptions: UploadOptions = {
      ...options,
      metadata: {
        mimetype: detectedMime,
        format: options?.metadata?.format || detectedFormat,
        resourceType: options?.metadata?.resourceType || detectedResourceType,
        size: file.byteLength,
        ...options?.metadata,
      },
    };

    return this.driver.upload(file, normalizedOptions);
  }

  async delete(publicId: string, options?: DeleteOptions): Promise<DeleteResult> {
    return await this.driver.delete(publicId, options);
  }

  getUrl(publicId: string): string {
    if (!this.driver.getUrl) return publicId;
    return this.driver.getUrl(publicId);
  }
}
