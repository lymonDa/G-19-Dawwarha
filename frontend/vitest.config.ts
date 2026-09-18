import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: [
      'src/app/features/engineer4.spec.ts',
      'src/app/features/handovers/**',
      'node_modules/**'
    ]
  },
});
