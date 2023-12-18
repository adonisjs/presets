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
import { presetLucid } from '../../lucid/main.js'
import { createEnvFile, createSetupFiles, createConfigureCommand } from '../helpers.js'

test.group('Configure Lucid', (group) => {
  group.each.disableTimeout()

  test('configure postgres dialect', async ({ fs, assert }) => {
    await createSetupFiles(fs)
    await createEnvFile(fs)
    const configureCommand = await createConfigureCommand(fs)

    await presetLucid(configureCommand, { dialect: 'postgres', installPackages: false })

    await assert.fileEquals('config/database.ts', dedent`import env from '#start/env'
    import { defineConfig } from '@adonisjs/lucid'

    const dbConfig = defineConfig({
      connection: 'postgres',
      connections: {
        postgres: {
          client: 'pg',
          connection: {
            host: env.get('DB_HOST'),
            port: env.get('DB_PORT'),
            user: env.get('DB_USER'),
            password: env.get('DB_PASSWORD'),
            database: env.get('DB_DATABASE'),
          },
          migrations: {
            naturalSort: true,
            paths: ['database/migrations'],
          },
        },
      },
    })

    export default dbConfig`)

    await assert.fileContains('.env', [
      'DB_HOST',
      'DB_PORT',
      'DB_USER',
      'DB_PASSWORD',
      'DB_DATABASE',
    ])

    await assert.fileContains('start/env.ts', [
      `DB_HOST: Env.schema.string({ format: 'host' })`,
      'DB_PORT: Env.schema.number()',
      'DB_USER: Env.schema.string()',
      'DB_PASSWORD: Env.schema.string.optional()',
      'DB_DATABASE: Env.schema.string()',
    ])
  })

  test('configure mysql dialect', async ({ fs, assert }) => {
    await createSetupFiles(fs)
    await createEnvFile(fs)
    const configureCommand = await createConfigureCommand(fs)

    await presetLucid(configureCommand, { dialect: 'mysql', installPackages: false })

    await assert.fileEquals('config/database.ts', dedent`import env from '#start/env'
    import { defineConfig } from '@adonisjs/lucid'

    const dbConfig = defineConfig({
      connection: 'mysql',
      connections: {
        mysql: {
          client: 'mysql2',
          connection: {
            host: env.get('DB_HOST'),
            port: env.get('DB_PORT'),
            user: env.get('DB_USER'),
            password: env.get('DB_PASSWORD'),
            database: env.get('DB_DATABASE'),
          },
          migrations: {
            naturalSort: true,
            paths: ['database/migrations'],
          },
        },
      },
    })

    export default dbConfig`)

    await assert.fileContains('.env', [
      'DB_HOST',
      'DB_PORT',
      'DB_USER',
      'DB_PASSWORD',
      'DB_DATABASE',
    ])

    await assert.fileContains('start/env.ts', [
      `DB_HOST: Env.schema.string({ format: 'host' })`,
      'DB_PORT: Env.schema.number()',
      'DB_USER: Env.schema.string()',
      'DB_PASSWORD: Env.schema.string.optional()',
      'DB_DATABASE: Env.schema.string()',
    ])
  })

  test('configure mssql dialect', async ({ fs, assert }) => {
    await createSetupFiles(fs)
    await createEnvFile(fs)
    const configureCommand = await createConfigureCommand(fs)

    await presetLucid(configureCommand, { dialect: 'mssql', installPackages: false })

    await assert.fileEquals('config/database.ts', dedent`import env from '#start/env'
    import { defineConfig } from '@adonisjs/lucid'

    const dbConfig = defineConfig({
      connection: 'mssql',
      connections: {
        mssql: {
          client: 'mssql',
          connection: {
            server: env.get('DB_HOST'),
            port: env.get('DB_PORT'),
            user: env.get('DB_USER'),
            password: env.get('DB_PASSWORD'),
            database: env.get('DB_DATABASE'),
          },
          migrations: {
            naturalSort: true,
            paths: ['database/migrations'],
          },
        },
      },
    })

    export default dbConfig`)

    await assert.fileContains('.env', [
      'DB_HOST',
      'DB_PORT',
      'DB_USER',
      'DB_PASSWORD',
      'DB_DATABASE',
    ])

    await assert.fileContains('start/env.ts', [
      `DB_HOST: Env.schema.string({ format: 'host' })`,
      'DB_PORT: Env.schema.number()',
      'DB_USER: Env.schema.string()',
      'DB_PASSWORD: Env.schema.string.optional()',
      'DB_DATABASE: Env.schema.string()',
    ])
  })

  test('configure sqlite dialect', async ({ fs, assert }) => {
    await createSetupFiles(fs)
    await createEnvFile(fs)
    const configureCommand = await createConfigureCommand(fs)

    await presetLucid(configureCommand, { dialect: 'sqlite', installPackages: false })

    await assert.fileEquals('config/database.ts', dedent`import app from '@adonisjs/core/services/app'
    import { defineConfig } from '@adonisjs/lucid'

    const dbConfig = defineConfig({
      connection: 'sqlite',
      connections: {
        sqlite: {
          client: 'better-sqlite3',
          connection: {
            filename: app.tmpPath('db.sqlite3')
          },
          useNullAsDefault: true,
          migrations: {
            naturalSort: true,
            paths: ['database/migrations'],
          },
        },
      },
    })

    export default dbConfig`)

    await assert.dirExists('tmp')
    await assert.fileEquals('.env', '')
    await assert.fileEquals('start/env.ts', 'export default Env.create(import.meta.url, {})')
  })

  test('install packages', async ({ fs, assert }) => {
    await createSetupFiles(fs)
    await createEnvFile(fs)
    const configureCommand = await createConfigureCommand(fs)

    await presetLucid(configureCommand, { dialect: 'postgres', installPackages: true })
    await assert.dirExists('node_modules/pg')
    await assert.dirExists('node_modules/luxon')
  })
})
