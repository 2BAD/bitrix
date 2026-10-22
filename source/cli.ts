import { parseArgs } from 'node:util'
import { createClient } from './client.js'
import type { Fields } from './entities/crm.js'
import { renderUserFields, USER_FIELD_ENTITIES, type UserFieldEntity } from './user-fields.js'

const USAGE = `Usage: bitrix-types [--url <rest url>] [--out <file>] [--entities deal,lead,contact,company]

Writes TypeScript declarations for the user fields of a Bitrix24 portal to stdout or --out.
The url can also come from BITRIX_URL, an OAuth access token from BITRIX_TOKEN.`

export type Io = {
  readonly fetch?: typeof fetch
  readonly stdout: (text: string) => void
  readonly stderr: (text: string) => void
  readonly writeFile: (path: string, text: string) => Promise<void>
}

const isEntity = (entity: string): entity is UserFieldEntity => Object.hasOwn(USER_FIELD_ENTITIES, entity)

/**
 * Runs `bitrix-types` and resolves with the exit code
 * @param args command line arguments without the node binary and script
 * @param env environment variables
 * @param io output streams, file writer and an optional fetch
 */
export const run = async (
  args: readonly string[],
  env: Readonly<Record<string, string | undefined>>,
  io: Io
): Promise<number> => {
  const fail = (message: string) => {
    io.stderr(`${message}\n`)
    return 1
  }

  let values
  try {
    ;({ values } = parseArgs({
      args: [...args],
      options: {
        url: { type: 'string' },
        out: { type: 'string' },
        entities: { type: 'string' },
        help: { type: 'boolean', short: 'h' }
      }
    }))
  } catch (error) {
    return fail(`${(error as Error).message}\n\n${USAGE}`)
  }
  if (values.help) {
    io.stdout(`${USAGE}\n`)
    return 0
  }

  const url = values.url ?? env['BITRIX_URL']
  if (!url) return fail(`Missing the portal url\n\n${USAGE}`)
  const entities = values.entities?.split(',').map((entity) => entity.trim()) ?? Object.keys(USER_FIELD_ENTITIES)
  const unknown = entities.filter((entity) => !isEntity(entity))
  if (unknown.length > 0) return fail(`Unknown entities: ${unknown.join(', ')}\n\n${USAGE}`)

  const token = env['BITRIX_TOKEN']
  try {
    const client = createClient({ url, ...(token && { auth: token }), ...(io.fetch && { fetch: io.fetch }) })
    const { results, errors } = await client.batch(
      Object.fromEntries(entities.map((entity) => [entity, { method: `crm.${entity}.fields` }]))
    )
    const failed = Object.values(errors).filter((error) => error !== undefined)
    if (failed.length > 0) return fail(failed.map((error) => error.message).join('\n'))

    const output = renderUserFields(results as Partial<Record<UserFieldEntity, Fields>>, new URL(url).origin)
    if (values.out === undefined) {
      io.stdout(output)
    } else {
      await io.writeFile(values.out, output)
      io.stderr(`Wrote user field types for ${entities.join(', ')} to ${values.out}\n`)
    }
    return 0
  } catch (error) {
    return fail((error as Error).message)
  }
}
