/*
 * @adonisjs/presets
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import dedent from 'dedent'
import { FileSystem } from '@japa/file-system'
import { AceFactory } from '@adonisjs/core/factories'
import Configure from '@adonisjs/core/commands/configure'

/**
 * Creates the setup files for codemods to work
 */
export async function createSetupFiles(fs: FileSystem) {
  await fs.createJson('tsconfig.json', {})
  await fs.createJson('package.json', {
    name: 'sample-app',
  })
  await fs.create('adonisrc.ts', `export default defineConfig({})`)
}

/**
 * Creates .env file and env.ts file for store validation rules
 */
export async function createEnvFile(fs: FileSystem) {
  await fs.create('.env', '')
  await fs.create('start/env.ts', 'export default Env.create(import.meta.url, {})')
}

/**
 * Creates "start/kernel.ts" file
 */
export async function createKernelFile(fs: FileSystem) {
  await fs.create('start/kernel.ts', dedent`
  server.use([])

  router.use([])

  export const middleware = router.named({
  })
  `)
}

/**
 * Creates configure command that can be used to execute presets
 */
export async function createConfigureCommand(fs: FileSystem) {
  const ace = await new AceFactory().make(fs.baseUrl, {
    importer: () => {},
  })
  return ace.create(Configure, ['./'])
}
