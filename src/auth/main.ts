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
    guard: 'session' | 'access_tokens' | 'basic_auth'
    userProvider: 'lucid'
  }
) {
  const configStub = `config/${options.guard}_with_${options.userProvider}.stub`
  const modelStub = `make/model/user_with_${options.guard}.stub`

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(STUBS_ROOT, configStub, {})

  /**
   * Register provider to the rcfile
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@adonisjs/auth/auth_provider')
  })

  /**
   * Publish migration file
   */
  await codemods.makeUsingStub(STUBS_ROOT, 'make/migration/users.stub', {
    entity: app.generators.createEntity('users'),
    migration: {
      folder: 'database/migrations',
      fileName: `${new Date().getTime()}_create_users_table.ts`,
    },
  })

  /**
   * Publish access tokens migration file when selected
   * access tokens guard
   */
  if (options.guard === 'access_tokens') {
    await codemods.makeUsingStub(STUBS_ROOT, 'make/migration/access_tokens.stub', {
      entity: app.generators.createEntity('access_tokens'),
      migration: {
        folder: 'database/migrations',
        fileName: `${new Date().getTime()}_create_access_tokens_table.ts`,
      },
    })
  }

  /**
   * Create model
   */
  await codemods.makeUsingStub(STUBS_ROOT, modelStub, {
    entity: app.generators.createEntity('users'),
  })

  /**
   * Publish auth middleware
   */
  await codemods.makeUsingStub(STUBS_ROOT, 'make/middleware/auth.stub', {
    entity: app.generators.createEntity('auth'),
  })

  /**
   * Publish guest middleware only when using the session
   * guard
   */
  if (options.guard === 'session') {
    await codemods.makeUsingStub(STUBS_ROOT, 'make/middleware/guest.stub', {
      entity: app.generators.createEntity('guest'),
    })
  }

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
    ...(options.guard === 'session'
      ? [
          {
            name: 'guest',
            path: '#middleware/guest_middleware',
          },
        ]
      : []),
  ])
}
