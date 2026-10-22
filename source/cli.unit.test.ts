import { describe, expect, it, vi } from 'vitest'
import { fail, fakeFetch, ok } from './__fixtures__/bitrix.js'
import { run } from './cli.js'

const URL_BASE = 'https://portal.bitrix24.com/rest/1/secret-token'

const FIELDS = {
  ID: { type: 'integer', isMultiple: false, title: 'ID' },
  UF_CRM_1: { type: 'string', isMultiple: false, title: 'UF_CRM_1', formLabel: 'Note' }
}

const setup = (handler: Parameters<typeof fakeFetch>[0] = (_method, body) => batchOf(Object.keys(body.cmd))) => {
  const fake = fakeFetch(handler)
  const output = { stdout: '', stderr: '' }
  const io = {
    fetch: fake.fetch,
    stdout: (text: string) => {
      output.stdout += text
    },
    stderr: (text: string) => {
      output.stderr += text
    },
    writeFile: vi.fn<(path: string, text: string) => Promise<void>>(async () => {})
  }
  return { ...fake, io, output }
}

const batchOf = (entities: readonly string[], errors: Record<string, unknown> = {}) =>
  ok({
    result: Object.fromEntries(entities.filter((entity) => !(entity in errors)).map((entity) => [entity, FIELDS])),
    result_error: errors,
    result_total: [],
    result_next: []
  })

describe('bitrix-types', () => {
  it('prints declarations for every entity read in one batch', async () => {
    const { io, output, requests } = setup()

    await expect(run(['--url', URL_BASE], {}, io)).resolves.toBe(0)

    expect(requests).toHaveLength(1)
    expect(requests[0]?.body.cmd).toEqual({
      deal: 'crm.deal.fields',
      lead: 'crm.lead.fields',
      contact: 'crm.contact.fields',
      company: 'crm.company.fields'
    })
    expect(output.stdout).toContain('interface DealUserFields {\n    /** Note */\n    readonly UF_CRM_1: string | null')
    expect(output.stdout).toContain('interface CompanyUserFields')
    expect(output.stdout).toContain('from https://portal.bitrix24.com.')
    expect(output.stdout).not.toContain('secret-token')
  })

  it('writes to --out and reads the url and token from the environment', async () => {
    const { io, output, requests } = setup()

    await expect(
      run(
        ['--out', 'types/bitrix.d.ts', '--entities', 'deal, lead'],
        { BITRIX_URL: URL_BASE, BITRIX_TOKEN: 'oauth' },
        io
      )
    ).resolves.toBe(0)

    expect(Object.keys(requests[0]?.body.cmd)).toEqual(['deal', 'lead'])
    expect(requests[0]?.body.auth).toBe('oauth')
    expect(io.writeFile).toHaveBeenCalledWith('types/bitrix.d.ts', expect.stringContaining('interface LeadUserFields'))
    expect(output).toEqual({ stdout: '', stderr: 'Wrote user field types for deal, lead to types/bitrix.d.ts\n' })
  })

  it('prints usage for --help', async () => {
    const { io, output } = setup()
    await expect(run(['--help'], {}, io)).resolves.toBe(0)
    expect(output.stdout).toMatch(/^Usage: bitrix-types/)
  })

  it.each([
    [['--nope'], {}, "Unknown option '--nope'"],
    [[], {}, 'Missing the portal url'],
    [['--url', URL_BASE, '--entities', 'deal,task'], {}, 'Unknown entities: task'],
    [['--url', 'not a url'], {}, 'Invalid URL']
  ])('fails with usage for %j', async (args, env, message) => {
    const { io, output, fetch } = setup()
    await expect(run(args, env, io)).resolves.toBe(1)
    expect(output.stderr).toContain(message)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('fails when Bitrix rejects a command', async () => {
    const { io, output } = setup((_method, body) =>
      batchOf(Object.keys(body.cmd), { lead: { error: 'insufficient_scope', error_description: 'no crm' } })
    )
    await expect(run(['--url', URL_BASE], {}, io)).resolves.toBe(1)
    expect(output.stderr).toBe('crm.lead.fields (command lead): insufficient_scope no crm\n')
    expect(output.stdout).toBe('')
  })

  it('fails when the request fails', async () => {
    const { io, output } = setup(() => fail(401, 'INVALID_CREDENTIALS', 'Invalid request credentials'))
    await expect(run(['--url', URL_BASE], {}, io)).resolves.toBe(1)
    expect(output.stderr).toBe('batch: INVALID_CREDENTIALS Invalid request credentials\n')
  })
})
