/*
 * @adonisjs/presets
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import dedent from 'dedent'
import { test } from '@japa/runner'
import { Kernel } from '@adonisjs/core/ace'
import { presetAuth } from '../../src/auth/main.js'
import { createKernelFile, createSetupFiles, createCodeMods, createApp } from '../helpers.js'

test.group('Preset | Auth', (group) => {
  group.each.disableTimeout()

  test('register provider and middleware', async ({ fs, assert }) => {
    await createSetupFiles(fs)
    await createKernelFile(fs)

    const app = await createApp(fs)
    const logger = new Kernel(app).ui.logger
    const codemods = await createCodeMods(fs, logger, app)

    await presetAuth(codemods, { guard: 'session', userProvider: 'lucid' })
    await assert.fileContains('adonisrc.ts', ['@adonisjs/auth/auth_provider'])
    await assert.fileContains('start/kernel.ts', [
      `() => import('@adonisjs/auth/initialize_auth_middleware')`,
      `auth: () => import('#middleware/auth_middleware')`,
      `guest: () => import('#middleware/guest_middleware')`,
    ])
  })

  test('create config file with session guard and lucid provider', async ({ fs, assert }) => {
    await createSetupFiles(fs)
    await createKernelFile(fs)

    const app = await createApp(fs)
    const logger = new Kernel(app).ui.logger
    const codemods = await createCodeMods(fs, logger, app)

    await presetAuth(codemods, { guard: 'session', userProvider: 'lucid' })
    await assert.fileEquals(
      'config/auth.ts',
      dedent`
    import { defineConfig, providers } from '@adonisjs/auth'
    import { sessionGuard } from '@adonisjs/auth/session'
    import { InferAuthEvents, Authenticators } from '@adonisjs/auth/types'

    const authConfig = defineConfig({
      default: 'web',
      guards: {
        web: sessionGuard({
          provider: providers.lucid({
            model: () => import('#models/user'),
            uids: ['email'],
          }),
        }),
      },
    })

    export default authConfig

    /**
     * Inferring types from the configured auth
     * guards.
     */
    declare module '@adonisjs/auth/types' {
      interface Authenticators extends InferAuthenticators<typeof authConfig> {}
    }
    declare module '@adonisjs/core/types' {
      interface EventsList extends InferAuthEvents<Authenticators> {}
    }
    `
    )
  })

  test('create config file with session guard and db provider', async ({ fs, assert }) => {
    await createSetupFiles(fs)
    await createKernelFile(fs)

    const app = await createApp(fs)
    const logger = new Kernel(app).ui.logger
    const codemods = await createCodeMods(fs, logger, app)

    await presetAuth(codemods, { guard: 'session', userProvider: 'database' })
    await assert.fileEquals(
      'config/auth.ts',
      dedent`
    import { defineConfig, providers } from '@adonisjs/auth'
    import { sessionGuard } from '@adonisjs/auth/session'
    import { InferAuthEvents, Authenticators } from '@adonisjs/auth/types'

    const authConfig = defineConfig({
      default: 'web',
      guards: {
        web: sessionGuard({
          provider: providers.db({
            table: 'users',
            id: 'id',
            passwordColumnName: 'password',
            uids: ['email']
          }),
        }),
      },
    })

    export default authConfig

    /**
     * Inferring types from the configured auth
     * guards.
     */
    declare module '@adonisjs/auth/types' {
      interface Authenticators extends InferAuthenticators<typeof authConfig> {}
    }
    declare module '@adonisjs/core/types' {
      interface EventsList extends InferAuthEvents<Authenticators> {}
    }
    `
    )
  })
})
