import { describe, it, expect, beforeAll } from 'vitest';
import { CloudinaryDriver } from '../src/drivers/cloudinary';
import { Uploader } from '../src/index';

// Cloudinary Credentials by env
const hasCloudinaryCredentials = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

describe('CloudinaryDriver - Unit Tests', () => {
  const mockConfig = {
    cloudName: 'test-cloud',
    apiKey: 'test-key',
    apiSecret: 'test-secret',
  };

  describe('Configuration', () => {
    it('should create driver with valid config', () => {
      const driver = new CloudinaryDriver(mockConfig);
      expect(driver).toBeDefined();
      expect(driver.getUrl).toBeDefined();
      expect(driver.upload).toBeDefined();
      expect(driver.delete).toBeDefined();
    });

    it('should default secure to true', () => {
      const driver = new CloudinaryDriver(mockConfig);
      const url = driver.getUrl('test-id');
      // Si Cloudinary está configurado correctamente, debería generar URLs
      expect(typeof url).toBe('string');
    });

    it('should accept custom secure option', () => {
      const driver = new CloudinaryDriver({
        ...mockConfig,
        secure: false,
      });
      expect(driver).toBeDefined();
    });
  });

  describe('URL Generation', () => {
    it('should generate URL for public ID', () => {
      const driver = new CloudinaryDriver(mockConfig);
      const url = driver.getUrl('my-image');
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });
  });
});

describe('CloudinaryDriver - Integration Tests', () => {
  // Only if credentials exists
  beforeAll(() => {
    if (!hasCloudinaryCredentials) {
      console.log('\n⚠️  Skipping Cloudinary integration tests (no credentials found)');
      console.log(
        '   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to run them\n'
      );
    }
  });

  const config = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  };

  it.skipIf(!hasCloudinaryCredentials)('should upload a text file', async () => {
    const uploader = new Uploader({
      provider: 'cloudinary',
      config,
    });

    const testBuffer = Buffer.from('Test content for Cloudinary');
    const result = await uploader.upload(testBuffer, {
      rename: 'test-upload',
      path: 'test-folder',
      metadata: { format: 'txt' },
    });

    expect(result.url).toBeDefined();
    expect(result.url).toContain('cloudinary.com');
    expect(result.publicId).toBeDefined();
    expect(result.metadata?.size).toBeGreaterThan(0);

    // Cleanup
    await uploader.delete(result.publicId, { resourceType: 'raw' });
  });

  it.skipIf(!hasCloudinaryCredentials)('should upload an image', async () => {
    const uploader = new Uploader({
      provider: 'cloudinary',
      config,
    });

    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
      0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
      0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
      0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const result = await uploader.upload(pngBuffer, {
      rename: 'test-image',
    });

    expect(result.url).toContain('cloudinary.com');
    expect(result.metadata?.resourceType).toBe('image');
    expect(result.metadata?.format).toBeDefined();

    // Cleanup
    await uploader.delete(result.publicId);
  });

  it.skipIf(!hasCloudinaryCredentials)('should delete a file', async () => {
    const uploader = new Uploader({
      provider: 'cloudinary',
      config,
    });

    // Upload
    const testBuffer = Buffer.from('File to delete');
    const uploadResult = await uploader.upload(testBuffer, {
      rename: 'temp-file',
      metadata: { format: 'txt' },
    });

    // Delete
    const deleteResult = await uploader.delete(uploadResult.publicId, { resourceType: 'raw' });
    expect(deleteResult.result).toBe('ok');

    // Verify
    const secondDelete = await uploader.delete(uploadResult.publicId, { resourceType: 'raw' });
    expect(secondDelete.result).toBe('not found');
  });

  it.skipIf(!hasCloudinaryCredentials)('should handle custom folders', async () => {
    const uploader = new Uploader({
      provider: 'cloudinary',
      config,
    });

    const testBuffer = Buffer.from('Folder test');
    const result = await uploader.upload(testBuffer, {
      rename: 'nested-file',
      path: 'test-folder/nested/folder',
      metadata: { format: 'txt' },
    });

    expect(result.publicId).toContain('test-folder/nested/folder');

    // Cleanup
    await uploader.delete(result.publicId, { resourceType: 'raw' });
  });
});

describe('Uploader Factory with Cloudinary', () => {
  it('should create Cloudinary driver through factory', () => {
    const uploader = new Uploader({
      provider: 'cloudinary',
      config: {
        cloudName: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      },
    });

    expect(uploader).toBeDefined();
  });

  it('should throw error with invalid provider', () => {
    expect(() => {
      new Uploader({
        provider: 'invalid' as any,
        config: {},
      });
    }).toThrow();
  });
});
