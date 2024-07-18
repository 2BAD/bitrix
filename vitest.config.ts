import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['build', 'node_modules'],
    coverage: {
      provider: 'v8'
    },
    testTimeout: 30000
  },
  plugins: [tsconfigPaths()]
})
