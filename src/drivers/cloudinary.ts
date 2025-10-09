import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import {
  DeleteOptions,
  DeleteResult,
  IUploader,
  UploadOptions,
  UploadResult,
} from '../lib/interfaces';

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
    const ext = options?.metadata?.format || 'bin';
    const baseName = options?.rename || 'file';
    const uniqueName = `${baseName}-${randomUUID()}`;

    const uploadOptions: UploadApiOptions = {
      resource_type: options?.metadata?.resourceType ?? 'auto',
      public_id: uniqueName,
      folder: options?.path,
      format: ext,
      context: options?.metadata
        ? Object.fromEntries(Object.entries(options.metadata).map(([k, v]) => [k, String(v)]))
        : undefined,
    };

    return new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          return reject(
            error
              ? new Error(`Cloudinary upload failed: ${error.message ?? JSON.stringify(error)}`)
              : new Error('Cloudinary upload failed: unknown error')
          );
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          metadata: {
            size: result.bytes,
            format: result.format,
            resourceType: result.resource_type as 'image' | 'video' | 'raw',
            width: result.width,
            height: result.height,
            ...options?.metadata,
          },
        });
      });

      Readable.from(file).pipe(stream);
    });
  }

  async delete(publicId: string, options?: DeleteOptions): Promise<DeleteResult> {
    const { result } = (await cloudinary.uploader.destroy(publicId, {
      resource_type: options?.resourceType ?? 'image',
    })) as CloudinaryDestroyResponse;

    return { result };
  }

  getUrl(publicId: string) {
    return cloudinary.url(publicId, { secure: true });
  }
}
