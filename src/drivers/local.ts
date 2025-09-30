export interface LocalDriver {
  upload(file: string): string;
  delete(path: string): string;
}

export const local: LocalDriver = {
  upload: (file: string) => {
    return `local placeholder url for ${file}`;
  },
  delete: (path: string) => {
    return `deleted ${path}`;
  }
};