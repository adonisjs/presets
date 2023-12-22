/*
 * @adonisjs/presets
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { joinToURL } from '@poppinss/utils'
import type { Codemods } from '@adonisjs/core/ace/codemods'

const STUBS_ROOT = joinToURL(import.meta.url, './stubs')

/**
 * Configures the "@adonisjs/auth" package with one of the
 * bundled guards and user providers
 */
export async function presetAuth(
  codemods: Codemods,
  options: {
    guard: 'session'
    userProvider: 'lucid' | 'database'
  }
) {
  const configStub = `${options.guard}_with_${options.userProvider}.stub`

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(STUBS_ROOT, configStub, {})

  /**
   * Register provider to the rcfile
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addCommand('@adonisjs/auth/auth_provider')
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
