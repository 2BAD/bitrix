import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import pkg from './package.json'

export default [
  {
    plugins: [
      json(),
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      })
    ],
    external: [
      'util', 'tty', 'os', 'fs', 'got'
    ],
    input: 'source/main.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs'
      },
      {
        file: pkg.module,
        format: 'esm'
      }
    ]
  }
]
