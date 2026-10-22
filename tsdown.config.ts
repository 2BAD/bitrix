import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['source/index.ts'],
  outDir: 'build',
  format: 'es',
  fixedExtension: false,
  dts: true,
  publint: true,
  attw: { profile: 'esm-only' }
})
