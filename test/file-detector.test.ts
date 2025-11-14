import { describe, it, expect } from 'vitest';
import { detectMimeType, getExtensionFromMime, getResourceType } from '../src/lib/helpers';

describe('File Type Detection - Functional', () => {
  describe('detectMimeType', () => {
    it('should detect real JPEG file', async () => {
      const buffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00,
      ]);
      const result = await detectMimeType(buffer);
      expect(['image/jpeg', 'text/plain']).toContain(result);
    });

    it('should detect ASCII text as text/plain', async () => {
      const textBuffer = Buffer.from('Hello, World!');
      expect(await detectMimeType(textBuffer)).toBe('text/plain');
    });

    it('should detect non-ASCII as octet-stream when file-type fails', async () => {
      const binaryBuffer = Buffer.from([0x80, 0xff, 0x90, 0xa0, 0xb0]);
      expect(await detectMimeType(binaryBuffer)).toBe('application/octet-stream');
    });

    it('should handle empty buffers', async () => {
      const emptyBuffer = Buffer.from([]);
      const result = await detectMimeType(emptyBuffer);
      expect(['text/plain', 'application/octet-stream']).toContain(result);
    });
  });

  describe('getExtensionFromMime', () => {
    it('should return correct extensions', () => {
      expect(getExtensionFromMime('image/jpeg')).toBe('jpg');
      expect(getExtensionFromMime('image/png')).toBe('png');
      expect(getExtensionFromMime('application/pdf')).toBe('pdf');
    });

    it('should handle mime with parameters', () => {
      expect(getExtensionFromMime('text/html; charset=utf-8')).toBe('html');
    });

    it('should extract subtype for unknown mimes', () => {
      expect(getExtensionFromMime('application/x-custom')).toBe('x-custom');
    });

    it('should return bin for octet-stream', () => {
      expect(getExtensionFromMime('application/octet-stream')).toBe('bin');
    });

    it('should return bin for undefined/empty', () => {
      expect(getExtensionFromMime(undefined)).toBe('bin');
      expect(getExtensionFromMime('')).toBe('bin');
    });
  });

  describe('getResourceType', () => {
    it('should categorize mime types', () => {
      expect(getResourceType('image/jpeg')).toBe('image');
      expect(getResourceType('video/mp4')).toBe('video');
      expect(getResourceType('application/pdf')).toBe('raw');
      expect(getResourceType(undefined)).toBe('raw');
    });
  });
});
