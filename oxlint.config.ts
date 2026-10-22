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
      files: ['**/*.test.ts'],
      rules: {
        'typescript/no-explicit-any': 'off'
      }
    }
  ]
})
