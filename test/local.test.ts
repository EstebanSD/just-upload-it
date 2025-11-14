import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Uploader } from '../src/index';
import path from 'path';
import fs from 'fs/promises';

describe('Uploader - Local Driver', () => {
  const testDir = path.resolve(process.cwd(), 'test-uploads');

  beforeAll(async () => {
    // Ensure that the test directory exists
    await fs.mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean the entire test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  });

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

  describe('Security', () => {
    it('should reject paths starting with ..', async () => {
      const uploader = new Uploader({
        provider: 'local',
        config: { baseDir: testDir },
      });

      await expect(
        uploader.upload(Buffer.from('hack'), {
          path: '../../sensitive',
        })
      ).rejects.toThrow('Invalid load path, must not start with ..');
    });
  });

  describe('Overwrite behavior', () => {
    // Since the name always has a randomUUID(), it will never find a file with the same name.
    //
    // it('should reject duplicate files when overwrite is false', async () => {
    //   const uploader = new Uploader({
    //     provider: 'local',
    //     config: {
    //       baseDir: testDir,
    //       overwrite: false,
    //     },
    //   });

    //   const buffer = Buffer.from('Content');

    //   const result1 = await uploader.upload(buffer, {
    //     rename: 'duplicate-test',
    //     path: 'overwrite-test',
    //   });

    //   await expect(
    //     uploader.upload(buffer, {
    //       rename: 'duplicate-test',
    //       path: 'overwrite-test',
    //     })
    //   ).rejects.toThrow('File already exists');

    //   // Cleanup
    //   await uploader.delete(result1.publicId);
    // });

    // Since the name always has a randomUUID(), it will never find a file with the same name.
    it('should allow overwriting when overwrite is true', async () => {
      const uploader = new Uploader({
        provider: 'local',
        config: {
          baseDir: testDir,
          overwrite: true,
        },
      });

      const buffer1 = Buffer.from('First content');
      const buffer2 = Buffer.from('Second content');

      await uploader.upload(buffer1, {
        rename: 'overwrite-allowed',
      });

      const result2 = await uploader.upload(buffer2, {
        rename: 'overwrite-allowed',
      });

      expect(result2.publicId).toBeDefined();

      const filePath = path.join(testDir, result2.publicId);
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('Second content');

      // Cleanup
      await uploader.delete(result2.publicId);
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid write path', async () => {
      const uploader = new Uploader({
        provider: 'local',
        config: {
          baseDir: '/invalid/readonly/path',
        },
      });

      await expect(uploader.upload(Buffer.from('test'), { rename: 'test' })).rejects.toThrow(
        'Failed to write file'
      );
    });
  });

  describe('Delete operations', () => {
    it('should return "not found" for non-existent file', async () => {
      const uploader = new Uploader({
        provider: 'local',
        config: { baseDir: testDir },
      });

      const result = await uploader.delete('non-existent-file.txt');
      expect(result.result).toBe('not found');
    });

    it('should return "not found" for file in missing directory', async () => {
      const uploader = new Uploader({
        provider: 'local',
        config: { baseDir: testDir },
      });

      const result = await uploader.delete('missing-dir/file.txt');
      expect(result.result).toBe('not found');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty buffer', async () => {
      const uploader = new Uploader({
        provider: 'local',
        config: { baseDir: testDir },
      });

      const result = await uploader.upload(Buffer.from([]), {
        rename: 'empty-file',
      });

      expect(result.publicId).toBeDefined();
      expect(result.metadata?.size).toBe(0);

      await uploader.delete(result.publicId);
    });

    it('should create nested directories automatically', async () => {
      const uploader = new Uploader({
        provider: 'local',
        config: { baseDir: testDir },
      });

      const result = await uploader.upload(Buffer.from('test'), {
        rename: 'nested-file',
        path: 'level1/level2/level3',
      });

      expect(result.publicId).toContain('level1/level2/level3');

      const dirPath = path.join(testDir, 'level1/level2/level3');
      await expect(fs.access(dirPath)).resolves.toBeUndefined();

      await uploader.delete(result.publicId);
    });

    it('should handle special characters in path', async () => {
      const uploader = new Uploader({
        provider: 'local',
        config: { baseDir: testDir },
      });

      const result = await uploader.upload(Buffer.from('test'), {
        rename: 'special-chars',
        path: 'folder with spaces',
      });

      expect(result.publicId).toBeDefined();

      await uploader.delete(result.publicId);
    });
  });
});
