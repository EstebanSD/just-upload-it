export interface UploadOptions {
  rename?: string;
  path?: string;
  metadata?: {
    size?: number;
    format?: string;
    resourceType?: 'image' | 'video' | 'raw';
    [key: string]: any;
  };
}

export interface UploadResult {
  url: string;
  publicId: string;
  metadata?: {
    size?: number;
    format?: string;
    resourceType?: 'image' | 'video' | 'raw';
    [key: string]: any;
  };
}

export interface DeleteOptions {
  resourceType?: 'image' | 'video' | 'raw';
}

export interface DeleteResult {
  result: 'ok' | 'not found' | 'error';
}

export interface IUploader {
  upload(file: Buffer, options?: UploadOptions): Promise<UploadResult>;
  delete(publicId: string, options?: DeleteOptions): Promise<DeleteResult>;
  getUrl?(publicId: string): string;
}
