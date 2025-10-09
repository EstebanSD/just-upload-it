import { MIME_EXTENSIONS } from '../constants';

/**
 * Detects MIME type from buffer using magic numbers (file signatures).
 *
 * Note: Only detects common binary formats. Text-based formats like SVG
 * require content inspection and are not supported.
 *
 * @param buffer - File buffer to analyze
 * @returns Detected MIME type or 'application/octet-stream' if unknown
 */
export function detectMimeType(buffer: Buffer): string {
  if (!buffer || buffer.length < 12) {
    return 'application/octet-stream';
  }
  // Magic numbers to detect file type
  // JPEG (FF D8 FF)
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  // PNG (89 50 4E 47)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png';
  }
  // GIF (47 49 46)
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif';
  }

  // WebP (RIFF....WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }
  // PDF (25 50 44 46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf';
  }
  // Video formats
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return 'video/mp4';
  }
  // MP4
  if (
    buffer.length >= 12 &&
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    return 'video/mp4';
  }
  // BMP (42 4D)
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return 'image/bmp';
  }
  // ZIP (50 4B 03 04 or 50 4B 05 06)
  if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
    if ((buffer[2] === 0x03 && buffer[3] === 0x04) || (buffer[2] === 0x05 && buffer[3] === 0x06)) {
      return 'application/zip';
    }
  }

  // RAR (52 61 72 21)
  if (buffer[0] === 0x52 && buffer[1] === 0x61 && buffer[2] === 0x72 && buffer[3] === 0x21) {
    return 'application/x-rar-compressed';
  }

  // TXT
  if (isTextFile(buffer)) {
    return 'text/plain';
  }

  return 'application/octet-stream'; // fallback
}

/**
 * Extracts file extension from MIME type.
 * Falls back to generic 'bin' if unknown.
 *
 * @param mimetype - MIME type string (e.g., 'image/jpeg')
 * @returns File extension without dot (e.g., 'jpg')
 */
export function getExtensionFromMime(mimetype?: string): string {
  if (!mimetype) return 'bin';

  // Try exact match first
  const exactMatch = MIME_EXTENSIONS[mimetype];
  if (exactMatch) return exactMatch;

  // Try extracting from MIME subtype (e.g., 'image/jpeg' -> 'jpeg')
  const parts = mimetype.split('/');
  if (parts.length === 2 && parts[1]) {
    // Clean up subtype (remove parameters like 'charset=utf-8')
    const subtype = parts[1].split(';')[0].trim();
    if (subtype && subtype !== 'octet-stream') {
      return subtype;
    }
  }

  return 'bin';
}

/**
 * Determines resource type category from MIME type.
 * Used for provider-specific categorization (e.g., Cloudinary).
 *
 * @param mimeType - MIME type string
 * @returns Resource type: 'image', 'video', or 'raw'
 */
export function getResourceType(mimeType?: string): 'image' | 'video' | 'raw' {
  if (!mimeType) return 'raw';

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';

  return 'raw';
}

function isTextFile(buffer: Buffer): boolean {
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    if (byte > 0x7f) {
      return false;
    }
  }
  return true;
}
