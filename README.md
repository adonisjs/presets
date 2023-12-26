# AdonisJS presets

These presets are a collection of functions you can execute to configure an AdonisJS package. This repo contains presets only for those packages that can be configured from multiple user interactions.

For example: When you create a new AdonisJS application, you can configure Lucid and also you can create a new app without Lucid and configure it later.

So, instead of duplicating the code in multiple places, we create re-usable presets and use them with individual packages and the [create-adonisjs](https://npm.im/create-adonisjs) initializer.

> [!NOTE]
> Presets do not trigger any prompts and exposes a coding interface.

## Auth preset

The `auth` presets configures the `@adonisjs/auth` package. The package must be installed to run this preset.

```ts
import { Kernel } from '@adonisjs/core/ace'
import { Application } from '@adonisjs/core/app'
import { presetAuth } from '@adonisjs/presets/auth'
import { Codemods } from '@adonisjs/core/ace/codemods'

/**
 * Create application instance. Inside an Ace command, you
 * get access to it using `this.app` property.
 */
const app = new Application(baseURL, {
  importer: () => {},
})

/**
 * Create Ace kernel instance to get CLI logger reference.
 * Inside an Ace command you can access it using this.logger
 * property.
 */
const cliLogger = new Kernel(app).ui.logger

/**
 * Create codemods instance. Codemods are needed to modify
 * source files.
 */
const codemods = new Codemods(app, cliLogger)

/**
 * Apply preset
 */
await presetAuth(codemods, app, {
  guard: 'session',
  userProvider: 'lucid',
})
```

## Lucid preset

The `auth` presets configures the `@adonisjs/lucid` package. The package must be installed to run this preset.

```ts
import { Kernel } from '@adonisjs/core/ace'
import { Application } from '@adonisjs/core/app'
import { presetLucid } from '@adonisjs/presets/lucid'
import { Codemods } from '@adonisjs/core/ace/codemods'

/**
 * Create application instance. Inside an Ace command, you
 * get access to it using `this.app` property.
 */
const app = new Application(baseURL, {
  importer: () => {},
})

/**
 * Create Ace kernel instance to get CLI logger reference.
 * Inside an Ace command you can access it using this.logger
 * property.
 */
const cliLogger = new Kernel(app).ui.logger

/**
 * Create codemods instance. Codemods are needed to modify
 * source files.
 */
const codemods = new Codemods(app, cliLogger)

/**
 * Apply preset
 */
await presetLucid(codemods, app, {
  dialect: 'sqlite',
  installPackages: true,
})
```
