import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { DeleteResult, IUploader, UploadOptions, UploadResult } from '../interfaces';

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

export interface LocalConfig {
  baseDir?: string;
  baseUrl?: string;
  overwrite?: boolean;
  namingStrategy?: (originalName: string, ext: string) => string;
}
export class LocalDriver implements IUploader {
  private readonly baseDir: string;
  private readonly baseUrl: string;
  private readonly overwrite: boolean;
  private readonly namingStrategy?: (originalName: string, ext: string) => string;

  constructor(config: LocalConfig = {}) {
    this.baseDir = config.baseDir || path.resolve(process.cwd(), 'uploads');
    this.baseUrl = config.baseUrl || 'http://localhost/uploads';
    this.overwrite = config.overwrite ?? false;
    this.namingStrategy = config.namingStrategy;
  }

  async upload(file: Buffer, options: UploadOptions): Promise<UploadResult> {
    const ext = options?.metadata?.format || 'bin';

    const folder = path.normalize(options?.path || '');
    if (folder.startsWith('..')) {
      throw new Error('Invalid load path, must not start with ..');
    }

    const fullDir = path.join(UPLOADS_DIR, folder);
    await fs.mkdir(fullDir, { recursive: true });

    const baseName = options?.rename || 'file';
    const filename = this.namingStrategy
      ? this.namingStrategy(baseName, ext)
      : `${baseName}-${uuid()}.${ext}`;

    const relativePath = path.join(folder, filename);
    const filePath = path.join(this.baseDir, relativePath);

    if (!this.overwrite) {
      try {
        await fs.access(filePath);
        throw new Error(`File already exists: ${relativePath}`);
      } catch {
        // file does not exist, safe to continue
      }
    }

    try {
      await fs.writeFile(filePath, file);
    } catch (err) {
      throw new Error(`Failed to write file to local storage: ${(err as Error).message}`);
    }

    return {
      url: `${this.baseUrl}/${relativePath.replace(/\\/g, '/')}`,
      publicId: relativePath,
      metadata: {
        size: file.byteLength,
        format: ext,
        uploadedAt: new Date(),
        ...(options?.metadata || {}),
      },
      resourceType: options?.resourceType,
    };
  }

  async delete(publicId: string): Promise<DeleteResult> {
    const filePath = path.join(this.baseDir, publicId);

    try {
      await fs.unlink(filePath);

      return { result: 'ok' };
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return { result: 'not found' };
      } else {
        return { result: 'error' };
      }
    }
  }

  getUrl(publicId: string): string {
    return `${this.baseUrl}/${publicId.replace(/\\/g, '/')}`;
  }
}
