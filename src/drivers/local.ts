import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { IUploader, UploadOptions, UploadResult } from '../interfaces';

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

export const local: IUploader = {
  async upload(file: Buffer, options: UploadOptions): Promise<UploadResult> {
    const ext = options?.metadata?.format || 'bin';
    const folder = options?.path || '';
    const fullDir = path.join(UPLOADS_DIR, folder);
    await fs.mkdir(fullDir, { recursive: true });

    const baseName = options?.rename || 'file';
    const filename = `${baseName}-${uuid()}.${ext}`;
    const filePath = path.join(fullDir, filename);

    await fs.writeFile(filePath, file);

    const result: UploadResult = {
      url: `http://localhost/uploads/${folder}/${filename}`,
      publicId: filename,
      metadata: {
        size: file.byteLength,
        format: ext,
        uploadedAt: new Date(),
        ...(options?.metadata || {}),
      },
      resourceType: options?.resourceType,
    };

    return result;
  },

  async delete(publicId) {
    const filePath = path.join(UPLOADS_DIR, publicId);
    await fs.unlink(filePath).catch(() => {
      console.warn(`Failed to delete image with publicId: ${publicId}.`);
    });
  },

  getUrl(publicId) {
    return `http://localhost/uploads/${publicId}`;
  },
};
