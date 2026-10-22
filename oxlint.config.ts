import { axiom } from '@2bad/axiom'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [axiom],
  rules: {
    'import/no-default-export': 'off',
    'eslint/no-redeclare': 'off'
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test-d.ts', '**/__fixtures__/**'],
      rules: {
        'typescript/no-explicit-any': 'off',
        'promise/prefer-await-to-then': 'off',
        'promise/prefer-await-to-callbacks': 'off'
      }
    }
  ]
})
