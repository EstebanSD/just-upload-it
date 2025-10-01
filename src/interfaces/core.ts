import { UrlOptions } from './url';

export interface UploadOptions {
  rename?: string;
  path?: string;
  metadata?: Record<string, any>;
  resourceType?: 'image' | 'video' | 'raw';
}

export interface UploadResult {
  url: string;
  publicId: string;
  metadata?: {
    size?: number;
    format?: string;
    [key: string]: any;
  };
  resourceType?: 'image' | 'video' | 'raw';
}

export interface DeleteResult {
  result: 'ok' | 'not found' | 'error';
}

export interface IUploader {
  upload(file: Buffer, options?: UploadOptions): Promise<UploadResult>;
  delete(
    publicId: string,
    options?: { resourceType?: 'image' | 'video' | 'raw' },
  ): Promise<DeleteResult>;
  getUrl?(publicId: string, options?: UrlOptions): string;
}
