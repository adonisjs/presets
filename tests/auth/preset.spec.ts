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

test.group('Preset | Auth', (group) => {
  group.each.disableTimeout()

  test('register provider and middleware', async ({ fs, assert }) => {
    await createSetupFiles(fs)
    await createKernelFile(fs)

    const app = await createApp(fs)
    const logger = new Kernel(app).ui.logger
    const codemods = await createCodeMods(fs, logger, app)

    await presetAuth(codemods, app, { guard: 'session', userProvider: 'lucid' })
    await assert.fileContains('adonisrc.ts', ['@adonisjs/auth/auth_provider'])
    await assert.fileExists('app/middleware/auth_middleware.ts')
    await assert.fileExists('app/middleware/guest_middleware.ts')

    await assert.fileContains('start/kernel.ts', [
      `() => import('@adonisjs/auth/initialize_auth_middleware')`,
      `auth: () => import('#middleware/auth_middleware')`,
      `guest: () => import('#middleware/guest_middleware')`,
    ])
  })

  test('configure with session guard and lucid provider', async ({ fs, assert, cleanup }) => {
    await createSetupFiles(fs)
    await createKernelFile(fs)

    const time = new Date().getTime()
    timekeeper.freeze(time)
    cleanup(() => {
      timekeeper.reset()
    })

    const app = await createApp(fs)
    const logger = new Kernel(app).ui.logger
    const codemods = await createCodeMods(fs, logger, app)

    await presetAuth(codemods, app, { guard: 'session', userProvider: 'lucid' })

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

    await assert.fileEquals(
      `database/migrations/${time}_create_users_table.ts`,
      dedent`import { BaseSchema } from '@adonisjs/lucid/schema'

    export default class extends BaseSchema {
      protected tableName = 'users'

      async up() {
        this.schema.createTable(this.tableName, (table) => {
          table.increments('id').notNullable()
          table.string('full_name').nullable()
          table.string('email', 254).notNullable().unique()
          table.string('password').notNullable()

          table.timestamp('created_at').notNullable()
          table.timestamp('updated_at').nullable()
        })
      }

      async down() {
        this.schema.dropTable(this.tableName)
      }
    }`
    )

    await assert.fileEquals(
      `app/models/user.ts`,
      dedent`import { DateTime } from 'luxon'
    import hash from '@adonisjs/core/services/hash'
    import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'

    export default class User extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare fullName: string | null

      @column()
      declare email: string

      @column()
      declare password: string

      @column.dateTime({ autoCreate: true })
      declare createdAt: DateTime

      @column.dateTime({ autoCreate: true, autoUpdate: true })
      declare updatedAt: DateTime | null

      @beforeSave()
      static async hashPassword(user: User) {
        if (user.$dirty.password) {
          user.password = await hash.make(user.password)
        }
      }
    }`
    )
  })

  test('create config file with session guard and db provider', async ({ fs, assert, cleanup }) => {
    await createSetupFiles(fs)
    await createKernelFile(fs)

    const time = new Date().getTime()
    timekeeper.freeze(time)
    cleanup(() => {
      timekeeper.reset()
    })

    const app = await createApp(fs)
    const logger = new Kernel(app).ui.logger
    const codemods = await createCodeMods(fs, logger, app)

    await presetAuth(codemods, app, { guard: 'session', userProvider: 'database' })
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

    await assert.fileEquals(
      `database/migrations/${time}_create_users_table.ts`,
      dedent`import { BaseSchema } from '@adonisjs/lucid/schema'

    export default class extends BaseSchema {
      protected tableName = 'users'

      async up() {
        this.schema.createTable(this.tableName, (table) => {
          table.increments('id').notNullable()
          table.string('full_name').nullable()
          table.string('email', 254).notNullable().unique()
          table.string('password').notNullable()

          table.timestamp('created_at').notNullable()
          table.timestamp('updated_at').nullable()
        })
      }

      async down() {
        this.schema.dropTable(this.tableName)
      }
    }`
    )
  })
})
