import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { v4 as uuid } from 'uuid';
import { Readable } from 'stream';
import { DeleteResult, IUploader, UploadOptions, UploadResult } from '../interfaces';
import { getExtensionFromMime } from '../helpers';

type CloudinaryDestroyResponse = {
  result: 'ok' | 'not found' | 'error';
};
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  secure?: boolean;
}

export class CloudinaryDriver implements IUploader {
  constructor(private readonly config: CloudinaryConfig) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: config.secure ?? true,
    });
  }

  async upload(file: Buffer, options?: UploadOptions): Promise<UploadResult> {
    const baseName = options?.rename || 'file';
    const uniqueName = `${baseName}-${uuid()}`;
    const ext = getExtensionFromMime(options?.metadata?.mimetype);

    const uploadOptions: UploadApiOptions = {
      resource_type: options?.resourceType ?? 'auto',
      public_id: uniqueName,
      folder: options?.path,
      format: ext,
      context: options?.metadata,
    };

    return new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          return reject(new Error('Cloudinary upload failed: ' + error?.message));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type as 'image' | 'video' | 'raw',
          metadata: {
            size: result.bytes,
            format: result.format,
            width: result.width,
            height: result.height,
            ...options?.metadata,
          },
        });
      });

      Readable.from(file).pipe(stream);
    });
  }

  async delete(
    publicId: string,
    options?: { resourceType?: 'image' | 'video' | 'raw' },
  ): Promise<DeleteResult> {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: options?.resourceType ?? 'image',
    });

    const { result } = (await cloudinary.uploader.destroy(publicId, {
      resource_type: options?.resourceType ?? 'image',
    })) as CloudinaryDestroyResponse;

    return { result };
  }

  getUrl(publicId: string): string {
    return cloudinary.url(publicId, { secure: true });
  }
}
