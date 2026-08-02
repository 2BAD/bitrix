import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['source/**/*.ts', '!source/**/*.test.ts'],
  outDir: 'build',
  format: 'es',
  fixedExtension: false,
  unbundle: true,
  dts: true,
  publint: true,
  attw: { profile: 'esm-only' }
})
