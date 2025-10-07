import { randomUUID } from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import {
  IUploader,
  UploadOptions,
  UploadResult,
  DeleteOptions,
  DeleteResult,
} from '../lib/interfaces';

export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  acl?: ObjectCannedACL;
}

export class S3Driver implements IUploader {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;
  private readonly acl?: ObjectCannedACL;

  constructor(private readonly config: S3Config) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    this.bucket = config.bucket;
    this.acl = config.acl;
    this.baseUrl = `https://${config.bucket}.s3.${config.region}.amazonaws.com`;
  }

  async upload(file: Buffer, options?: UploadOptions): Promise<UploadResult> {
    const ext = options?.metadata?.format || 'bin';
    const baseName = options?.rename || 'file';
    const contentType = options?.metadata?.mimetype;

    const filename = `${baseName}-${randomUUID()}.${ext}`;

    const key = options?.path ? `${options.path}/${filename}` : filename;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ACL: this.acl,
      ContentType: contentType,
      Metadata: options?.metadata
        ? Object.fromEntries(
            Object.entries(options.metadata)
              .filter(([k]) => !['size', 'format', 'resourceType'].includes(k))
              .map(([k, v]) => [k, String(v)]),
          )
        : undefined,
    });

    try {
      await this.client.send(command);
    } catch (err) {
      throw new Error(`Failed to upload file to S3: ${(err as Error).message}`);
    }

    return {
      url: this.getUrl(key),
      publicId: key,
      metadata: {
        size: options?.metadata?.size,
        format: ext,
        resourceType: options?.metadata?.resourceType,
        uploadedAt: new Date(),
        ...(options?.metadata || {}),
      },
    };
  }

  async delete(publicId: string, options?: DeleteOptions): Promise<DeleteResult> {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: publicId,
      });
      await this.client.send(headCommand);
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return { result: 'not found' };
      }
      return { result: 'error' };
    }

    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: publicId,
      });
      await this.client.send(deleteCommand);
      return { result: 'ok' };
    } catch (err) {
      return { result: 'error' };
    }
  }

  getUrl(publicId: string): string {
    return `${this.baseUrl}/${publicId}`;
  }
}
