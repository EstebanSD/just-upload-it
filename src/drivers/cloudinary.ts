import { IUploader, UploadResult } from '../interfaces';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export class CloudinaryDriver implements IUploader {
  constructor(private config: CloudinaryConfig) {}

  async upload(file: Buffer): Promise<UploadResult> {
    // this.config.apiKey, cloudName, etc.
    return { publicId: 'cloudinary/path/file.png', url: 'https://...' };
  }

  async delete(fileKey: string): Promise<void> {}
}
