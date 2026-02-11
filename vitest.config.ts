import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'stores/**/*.{ts,tsx}',
        'ecs/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
        '**/__tests__/**',
        '**/e2e/**',
      ],
      all: true,
      lines: 99,
      functions: 99,
      branches: 99,
      statements: 99,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/stores': path.resolve(__dirname, './stores'),
      '@/ecs': path.resolve(__dirname, './ecs'),
      '@/utils': path.resolve(__dirname, './utils'),
    },
  },
})
