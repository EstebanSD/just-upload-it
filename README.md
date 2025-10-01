# just-upload-it

⚠️ This package is under active development. Do not use in production yet.

## Installation

```bash
npm install just-upload-it
```

## Example

```bash
import { Uploader } from "just-upload-it";

const uploader = new Uploader({
  provider: "local",
  config: {
    baseDir: "./uploads",
    baseUrl: "http://localhost/uploads",
    overwrite: false,
  }
});

const result = await uploader.upload(Buffer.from("Hello world"), {
  rename: "example",
  path: "texts",
  metadata: { format: "txt" },
});


await uploader.delete(result.publicId);
```

## License

MIT © 2025 EstebanSD
