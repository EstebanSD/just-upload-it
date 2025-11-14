import { defineConfig } from 'vitest/config';

const hasCloudinaryCredentials =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

const hasAwsCredentials =
  process.env.AWS_REGION &&
  process.env.AWS_BUCKET &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY;

const targetCoverage = hasCloudinaryCredentials && hasAwsCredentials ? 80 : 65;

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],

      reportsDirectory: './coverage',

      exclude: [
        'node_modules',
        'dist',
        'test',
        'test-uploads',
        '**/*.config.ts',
        '**/*.config.js',
        '**/*.d.ts',
        'src/lib/interfaces/**',
      ],

      thresholds: {
        lines: targetCoverage,
        functions: targetCoverage,
        branches: targetCoverage - 5,
        statements: targetCoverage,
      },
    },
  },
});
