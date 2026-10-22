import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['build', 'node_modules'],
    typecheck: {
      enabled: true,
      include: ['source/**/*.test-d.ts']
    },
    coverage: {
      include: ['source/**/*.ts'],
      exclude: [
        'source/__fixtures__/**',
        'source/**/*.test-d.ts',
        'source/index.ts',
        'source/bin.ts',
        'source/entities/**',
        ...coverageConfigDefaults.exclude
      ],
      provider: 'v8',
      thresholds: {
        branches: 95,
        functions: 100,
        lines: 100,
        statements: 100
      }
    },
    testTimeout: 30_000
  }
})
