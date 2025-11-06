import { describe, it, expect, beforeAll } from 'vitest';
import { Uploader } from '../src/index';

// Credentials
const hasS3Credentials = !!(
  process.env.AWS_REGION &&
  process.env.AWS_BUCKET &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
);

describe('S3Driver - Integration Tests', () => {
  beforeAll(() => {
    if (!hasS3Credentials) {
      console.log('\n⚠️  Skipping S3 integration tests (no credentials found)');
      console.log(
        '   Set AWS_REGION, AWS_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY to run them\n'
      );
    }
  });

  const config = {
    region: process.env.AWS_REGION || '',
    bucket: process.env.AWS_BUCKET || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };

  it.skipIf(!hasS3Credentials)('should upload a text file', async () => {
    const uploader = new Uploader({ provider: 'aws-s3', config });

    const testBuffer = Buffer.from('Test content for S3');
    const result = await uploader.upload(testBuffer, {
      rename: 'test-upload',
      path: 'test-folder',
      metadata: { format: 'txt', mimetype: 'text/plain' },
    });

    expect(result.url).toBeDefined();
    expect(result.url).toContain('s3');
    expect(result.url).toContain('amazonaws.com');
    expect(result.publicId).toBeDefined();
    expect(result.publicId).toContain('test-folder/test-upload');

    // Cleanup
    await uploader.delete(result.publicId);
  });

  it.skipIf(!hasS3Credentials)('should upload a binary file', async () => {
    const uploader = new Uploader({ provider: 'aws-s3', config });

    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
      0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
      0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
      0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const result = await uploader.upload(pngBuffer, {
      rename: 'test-image',
      metadata: { format: 'png', mimetype: 'image/png' },
    });

    expect(result.url).toContain('amazonaws.com');
    expect(result.metadata?.format).toBe('png');

    // Cleanup
    await uploader.delete(result.publicId);
  });

  it.skipIf(!hasS3Credentials)('should delete a file', async () => {
    const uploader = new Uploader({ provider: 'aws-s3', config });

    // Upload
    const testBuffer = Buffer.from('File to delete');
    const uploadResult = await uploader.upload(testBuffer, {
      rename: 'temp-file',
      metadata: { format: 'txt' },
    });

    // Delete
    const deleteResult = await uploader.delete(uploadResult.publicId);
    expect(deleteResult.result).toBe('ok');

    // Verifiy
    const secondDelete = await uploader.delete(uploadResult.publicId);
    expect(secondDelete.result).toBe('not found');
  });

  it.skipIf(!hasS3Credentials)('should handle custom paths', async () => {
    const uploader = new Uploader({ provider: 'aws-s3', config });

    const testBuffer = Buffer.from('Nested path test');
    const result = await uploader.upload(testBuffer, {
      rename: 'nested-file',
      path: 'test/deeply/nested/folder',
      metadata: { format: 'txt' },
    });

    expect(result.publicId).toContain('test/deeply/nested/folder/nested-file');
    expect(result.url).toContain('test/deeply/nested/folder/nested-file');

    // Cleanup
    await uploader.delete(result.publicId);
  });

  it.skipIf(!hasS3Credentials)('should preserve metadata', async () => {
    const uploader = new Uploader({ provider: 'aws-s3', config });

    const testBuffer = Buffer.from('Metadata test');
    const customMetadata = {
      author: 'test-user',
      description: 'A test file',
      format: 'txt',
    };

    const result = await uploader.upload(testBuffer, {
      rename: 'metadata-file',
      metadata: customMetadata,
    });

    expect(result.metadata?.author).toBe('test-user');
    expect(result.metadata?.description).toBe('A test file');
    expect(result.metadata?.format).toBe('txt');

    // Cleanup
    await uploader.delete(result.publicId);
  });

  it.skipIf(!hasS3Credentials)('should handle files without extension - txt', async () => {
    const uploader = new Uploader({ provider: 'aws-s3', config });

    const testBuffer = Buffer.from('No extension file');
    const result = await uploader.upload(testBuffer, {
      rename: 'no-ext-file',
    });

    expect(result.publicId).toMatch(/no-ext-file-.*\.txt/);

    // Cleanup
    await uploader.delete(result.publicId);
  });

  it.skipIf(!hasS3Credentials)('should handle files without extension - bin', async () => {
    const uploader = new Uploader({ provider: 'aws-s3', config });

    const testBuffer = Buffer.from([0x00, 0xff, 0xab, 0x42, 0x10]);
    const result = await uploader.upload(testBuffer, {
      rename: 'no-ext-file',
    });

    expect(result.publicId).toMatch(/no-ext-file-.*\.bin/);

    // Cleanup
    await uploader.delete(result.publicId);
  });
});

describe('Uploader Factory with S3', () => {
  it('should create S3 driver through factory', () => {
    const uploader = new Uploader({
      provider: 'aws-s3',
      config: {
        region: 'us-east-1',
        bucket: 'test-bucket',
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });

    expect(uploader).toBeDefined();
  });
});
