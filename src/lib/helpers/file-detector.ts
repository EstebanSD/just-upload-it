import { fileTypeFromBuffer } from 'file-type';
import { MIME_EXTENSIONS } from '../constants';

function isTextFile(buffer: Buffer): boolean {
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    if (byte > 0x7f) {
      return false;
    }
  }
  return true;
}

/**
 * Detects MIME type from buffer using magic numbers (file signatures).
 *
 * Note: Only detects common binary formats. Text-based formats like SVG
 * require content inspection and are not supported.
 *
 * @param buffer - File buffer to analyze
 * @returns Detected MIME type or 'application/octet-stream' if unknown
 */
export async function detectMimeType(buffer: Buffer): Promise<string> {
  const type = await fileTypeFromBuffer(buffer);
  if (type) return type.mime;

  if (isTextFile(buffer)) return 'text/plain';

  return 'application/octet-stream';
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
