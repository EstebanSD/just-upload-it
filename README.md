# just-upload-it

⚠️ This package is under active development. Do not use in production yet.

## Installation

```bash
npm install just-upload-it
```

## Example with Local Driver

```ts
import { Uploader } from 'just-upload-it';

const uploader = new Uploader({
  provider: 'local',
  config: {
    baseDir: './uploads',
    baseUrl: 'http://localhost/uploads',
    overwrite: false,
  },
});

const result = await uploader.upload(Buffer.from('Hello world'), {
  rename: 'example',
  path: 'texts',
  metadata: { format: 'txt' },
});

await uploader.delete(result.publicId);
```

## Example with Cloudinary

⚠️ **Important:** For non-image files (`video`, `raw`), always set `resourceType` in `options`.  
This ensures correct handling and deletion of the file.

```ts
import { Uploader, CloudinaryConfig } from 'just-upload-it';

const cloudConfig: CloudinaryConfig = {
  cloudName: 'your-cloud-name',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
};

const uploader = new Uploader({
  provider: 'cloudinary',
  config: cloudConfig,
});

const result = await uploader.upload(fileBuffer, {
  rename: 'my-file',
  path: 'test-folder',
  metadata: { description: 'Example file', resourceType: 'raw' },
});

await uploader.delete(result.publicId, { resourceType: 'raw' });
```

## License

MIT © 2025 EstebanSD
