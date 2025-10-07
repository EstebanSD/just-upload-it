# just-upload-it

<div align="center">

[![npm version](https://img.shields.io/npm/v/just-upload-it.svg)](https://www.npmjs.com/package/just-upload-it)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**Universal file upload abstraction for Node.js**

Switch between local storage, Cloudinary, S3, and more with a single API.

⚠️ **Under active development** - Not recommended for production use yet.

</div>

---

## 🎯 Why just-upload-it?

- **🔄 Provider-agnostic** - Switch storage providers without changing your code
- **📦 Normalized API** - Consistent input/output across all drivers
- **🎨 Auto-detection** - Automatically detects file types and metadata
- **📝 TypeScript** - Fully typed with comprehensive interfaces
- **🧩 Extensible** - Easy to add custom drivers
- **🪶 Lightweight** - Minimal dependencies

## Installation

```bash
npm install just-upload-it
```

## 🚀 Quick Start

```ts
import { Uploader } from 'just-upload-it';
import fs from 'fs';

const uploader = new Uploader({ provider: 'local' });

const fileBuffer = fs.readFileSync('./photo.jpg');
const result = await uploader.upload(fileBuffer, {
  rename: 'profile-pic',
  path: 'users-123',
});

await uploader.delete(result.publicId);
```

## 🎨 Supported Providers

| Provider     | Status  | Features                        |
| ------------ | :-----: | ------------------------------- |
| Local        | Stable  | File system storage             |
| Cloudinary   | Stable  | Cloud storage with CDN delivery |
| AWS S3       | Stable  | Scalable cloud storage          |
| Google Cloud | Planned | -                               |
| Azure Blob   | Planned | -                               |

## 📖 API Reference

`new Uploader(config)`
Creates a new uploader instance.

```ts
const uploader = new Uploader({
  provider: 'local' | 'cloudinary' | 'aws-s3',
  config: <ProviderConfig>,
});
```

`uploader.upload(buffer, options?)`
Uploads a file buffer.

**Parameters:**

- `buffer: Buffer` - File content as Buffer
- `options?: UploadOptions` - Upload configuration

**Returns:** `Promise<UploadResult>`

```ts
interface UploadOptions {
  rename?: string; // Custom filename (without extension)
  path?: string; // Subfolder path
  metadata?: {
    format?: string; // File extension (auto-detected if omitted)
    resourceType?: 'image' | 'video' | 'raw'; // Auto-detected
    [key: string]: any; // Custom metadata
  };
}

interface UploadResult {
  url: string; // Public URL of uploaded file
  publicId: string; // Unique identifier for deletion
  metadata?: {
    size: number; // File size in bytes
    format: string; // File extension
    resourceType: 'image' | 'video' | 'raw';
    [key: string]: any;
  };
}
```

`uploader.delete(publicId, options?)`
Deletes an uploaded file.

**Parameters:**

- `publicId: string` - File identifier from upload result
- `options?: DeleteOptions` - Deletion configuration

**Returns:** `Promise<DeleteResult>`

```ts
interface DeleteOptions {
  resourceType?: 'image' | 'video' | 'raw'; // Required for some providers
}

interface DeleteResult {
  result: 'ok' | 'not found' | 'error';
}
```

`uploader.getUrl(publicId)`
Gets the public URL for a file.

**Parameters:**

- `publicId: string` - File identifier

**Returns:** `string`

## 🔧 Provider Configuration

### Local Storage

```ts
import { Uploader, LocalConfig } from 'just-upload-it';

const config: LocalConfig = {
  baseDir: './uploads', // Upload directory (default: './uploads')
  baseUrl: 'http://localhost:3000/uploads', // Base URL for files
  overwrite: false, // Allow overwriting existing files
};

const uploader = new Uploader({ provider: 'local', config });
```

### Cloudinary

```ts
import { Uploader, CloudinaryConfig } from 'just-upload-it';

const config: CloudinaryConfig = {
  cloudName: 'your-cloud-name',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
};

const uploader = new Uploader({ provider: 'cloudinary', config });

const result = await uploader.upload(fileBuffer, {
  rename: 'my-file',
  path: 'test-folder',
  metadata: { description: 'Example file' },
});

await uploader.delete(result.publicId);
```

> ⚠️ **Important:** For non-image files (`video`, `raw`), always set `resourceType` in `options`.  
> This ensures correct deletion of the file.

```ts
await uploader.delete(publicId, { resourceType: 'raw' });
```

### AWS S3

```ts
import { Uploader, S3Config } from 'just-upload-it';

const config: S3Config = {
  region: 'your-bucket-region',
  bucket: 'your-bucket-name',
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key',
};

const uploader = new Uploader({ provider: 'aws-s3', config });

const result = await uploader.upload(fileBuffer, {
  rename: 'document',
  path: 'uploads',
  metadata: {
    format: 'pdf',
    resourceType: 'raw',
  },
});
```

## 💡 Examples

### Upload with auto-detection

File type, format, and resource type are automatically detected:

```ts
const result = await uploader.upload(imageBuffer);
// No need to specify format or resourceType
```

### Upload with custom metadata

```ts
const result = await uploader.upload(fileBuffer, {
  rename: 'user-avatar',
  path: 'users',
  metadata: {
    userId: '12345',
    uploadedBy: 'john@example.com',
  },
});
```

### Upload to organized folders

```ts
const today = new Date().toISOString().split('T')[0];

const result = await uploader.upload(buffer, {
  path: `uploads-${today}`,
  rename: 'document',
});
```

### Switch providers without code changes

```ts
// Development: local storage
const uploader = new Uploader({
  provider: process.env.NODE_ENV === 'production' ? 'cloudinary' : 'local',
  config: process.env.NODE_ENV === 'production' ? cloudinaryConfig : localConfig,
});

// Same code works for both!
await uploader.upload(buffer);
```

## License

[MIT License](https://github.com/EstebanSD/just-upload-it/blob/main/LICENSE) © 2025 EstebanSD
