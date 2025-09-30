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
  provider: "local"
});

const result = await uploader.upload(Buffer);
console.log(result.url);
await uploader.delete(result.publicId);
```
