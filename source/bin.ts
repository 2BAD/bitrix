#!/usr/bin/env node
import { writeFile } from 'node:fs/promises'
import { run } from './cli.js'

process.exitCode = await run(process.argv.slice(2), process.env, {
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
  writeFile
})
