/*
 * @adonisjs/presets
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { joinToURL } from '@poppinss/utils'
import type { Application } from '@adonisjs/core/app'
import type { Codemods } from '@adonisjs/core/ace/codemods'

const STUBS_ROOT = joinToURL(import.meta.url, './stubs')

/**
 * Configures the "@adonisjs/auth" package with one of the
 * bundled guards and user providers
 */
export async function presetAuth(
  codemods: Codemods,
  app: Application<any>,
  options: {
    guard: 'session'
    userProvider: 'lucid' | 'database'
  }
) {
  const configStub = `config/${options.guard}_with_${options.userProvider}.stub`

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(STUBS_ROOT, configStub, {})

  /**
   * Publish migration file
   */
  await codemods.makeUsingStub(STUBS_ROOT, 'make/migration/users.stub', {
    entity: app.generators.createEntity('users'),
    migration: {
      folder: 'database/migrations',
      tableName: 'users',
      fileName: `${new Date().getTime()}_create_users_table.ts`,
    },
  })

  /**
   * Publish middleware
   */
  await codemods.makeUsingStub(STUBS_ROOT, 'make/middleware/auth.stub', {
    entity: app.generators.createEntity('auth'),
  })
  await codemods.makeUsingStub(STUBS_ROOT, 'make/middleware/guest.stub', {
    entity: app.generators.createEntity('guest'),
  })

  /**
   * Create model only when using the lucid provider
   */
  if (options.userProvider === 'lucid') {
    /**
     * Publish model
     */
    await codemods.makeUsingStub(STUBS_ROOT, 'make/model/user.stub', {
      entity: app.generators.createEntity('users'),
    })
  }

  /**
   * Register provider to the rcfile
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@adonisjs/auth/auth_provider')
  })

  /**
   * Register middleware
   */
  await codemods.registerMiddleware('router', [
    {
      path: '@adonisjs/auth/initialize_auth_middleware',
    },
  ])
  await codemods.registerMiddleware('named', [
    {
      name: 'auth',
      path: '#middleware/auth_middleware',
    },
    {
      name: 'guest',
      path: '#middleware/guest_middleware',
    },
  ])
}
