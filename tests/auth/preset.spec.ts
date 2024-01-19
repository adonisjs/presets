/*
 * @adonisjs/presets
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import dedent from 'dedent'
import timekeeper from 'timekeeper'
import { test } from '@japa/runner'
import { Kernel } from '@adonisjs/core/ace'
import { presetAuth } from '../../src/auth/main.js'
import { createKernelFile, createSetupFiles, createCodeMods, createApp } from '../helpers.js'

test.group('Preset | Auth | session', (group) => {
  group.each.disableTimeout()

  test('publish stubs and register provider and middleware', async ({ fs, assert }) => {
    await createSetupFiles(fs)
    await createKernelFile(fs)

    const app = await createApp(fs)
    const logger = new Kernel(app).ui.logger
    const codemods = await createCodeMods(fs, logger, app)

    await presetAuth(codemods, app, { guard: 'session', userProvider: 'lucid' })
    await assert.fileContains('adonisrc.ts', ['@adonisjs/auth/auth_provider'])
    await assert.fileExists('app/middleware/auth_middleware.ts')
    await assert.fileExists('app/middleware/guest_middleware.ts')
    await assert.fileExists('app/models/user.ts')

    await assert.fileContains('start/kernel.ts', [
      `() => import('@adonisjs/auth/initialize_auth_middleware')`,
      `auth: () => import('#middleware/auth_middleware')`,
      `guest: () => import('#middleware/guest_middleware')`,
    ])
  })
})

test.group('Preset | Auth | access tokens', (group) => {
  group.each.disableTimeout()

  test('publish stubs and register provider and middleware', async ({ fs, assert }) => {
    await createSetupFiles(fs)
    await createKernelFile(fs)

    const app = await createApp(fs)
    const logger = new Kernel(app).ui.logger
    const codemods = await createCodeMods(fs, logger, app)

    await presetAuth(codemods, app, { guard: 'access_tokens', userProvider: 'lucid' })
    await assert.fileContains('adonisrc.ts', ['@adonisjs/auth/auth_provider'])
    await assert.fileExists('app/middleware/auth_middleware.ts')
    await assert.fileNotExists('app/middleware/guest_middleware.ts')
    await assert.fileExists('app/models/user.ts')
    await assert.fileContains('app/models/user.ts', [
      `static accessTokens = DbAccessTokensProvider.forModel(User)`,
    ])
    await assert.fileContains('start/kernel.ts', [
      `() => import('@adonisjs/auth/initialize_auth_middleware')`,
      `auth: () => import('#middleware/auth_middleware')`,
    ])

    const kernelFileContents = await fs.contents('start/kernel.ts')
    assert.isFalse(
      kernelFileContents.includes(`guest: () => import('#middleware/guest_middleware')`)
    )
  })
})
