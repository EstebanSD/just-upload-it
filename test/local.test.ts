import { describe, it, expect } from 'vitest';
import { Uploader } from '../src/index';
import path from 'path';

describe('Uploader - Local Driver', () => {
  const testDir = path.resolve(process.cwd(), 'test-uploads');

  it('should upload a file locally', async () => {
    const uploader = new Uploader({
      provider: 'local',
      config: {
        baseDir: testDir,
        baseUrl: 'http://localhost/test-uploads',
      },
    });

    const testBuffer = Buffer.from('Hello, World!');

    const result = await uploader.upload(testBuffer, {
      rename: 'test-file',
      path: 'test-folder',
      metadata: { format: 'txt' },
    });

    expect(result.url).toContain('test-file');
    expect(result.publicId).toBeDefined();
    expect(result.metadata?.size).toBe(testBuffer.length);

    // Cleanup
    await uploader.delete(result.publicId);
  });

  it('should delete a file', async () => {
    const uploader = new Uploader({
      provider: 'local',
      config: { baseDir: testDir },
    });

    const testBuffer = Buffer.from('Delete me');
    const result = await uploader.upload(testBuffer, {
      rename: 'temp-file',
      metadata: { format: 'txt' },
    });

    const deleteResult = await uploader.delete(result.publicId);

    expect(deleteResult.result).toBe('ok');
  });
});

describe('File type detection', () => {
  const testDir = path.resolve(process.cwd(), 'test-uploads');
  it('should detect JPEG', async () => {
    const uploader = new Uploader({
      provider: 'local',
      config: { baseDir: testDir },
    });

    // JPEG magic number: FF D8 FF
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);

    const result = await uploader.upload(jpegBuffer, {
      rename: 'test-image',
    });

    expect(result.metadata?.format).toBe('jpg');
    expect(result.metadata?.resourceType).toBe('image');

    // Cleanup
    await uploader.delete(result.publicId);
  });
});
