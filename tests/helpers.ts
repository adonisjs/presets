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
import { Codemods } from '@adonisjs/core/ace/codemods'
import { UIPrimitives } from '@adonisjs/core/types/ace'
import { AppFactory } from '@adonisjs/core/factories/app'
import { ApplicationService } from '@adonisjs/core/types'

/**
 * Creates the setup files for codemods to work
 */
export async function createSetupFiles(fs: FileSystem) {
  await fs.createJson('tsconfig.json', {
    compilerOptions: {
      target: 'ESNext',
      module: 'NodeNext',
      lib: ['ESNext'],
    },
  })
  await fs.createJson('package.json', {
    name: 'sample-app',
    type: 'module',
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
  await fs.create(
    'start/kernel.ts',
    dedent`
  server.use([])

  router.use([])

  export const middleware = router.named({
  })
  `
  )
}

/**
 * Creates application service
 */
export async function createApp(fs: FileSystem) {
  const app = new AppFactory().create(fs.baseUrl, () => {})
  app.rcContents({})
  await app.init()

  return app as ApplicationService
}

/**
 * Creates codemods instance
 */
export async function createCodeMods(
  fs: FileSystem,
  logger: UIPrimitives['logger'],
  app?: ApplicationService
) {
  return new Codemods(app || (await createApp(fs)), logger)
}
