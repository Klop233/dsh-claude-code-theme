/**
 * Client bundle build for dsh-claude-code-theme.
 *
 * Mirrors the harness `tsdown.client.ts` preset: the browser artifact is a CJS
 * closure registered through `window.__ModuleLoader__.load`, platform modules
 * resolve from the loader module table, everything else inlines, and the
 * stylesheet is compiled into a self-injecting module.
 *
 * The plugin has no runtime dependencies — no React, no schemastery — so the
 * only externals are the platform modules it genuinely reads at runtime.
 */
import { readFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import { defineConfig } from 'tsdown'

const ID = 'dsh-claude-code-theme'

/**
 * Platform modules the shell shares into the frozen module table. This plugin
 * imports none of them as values (cross-plugin collaboration goes through
 * cordis services), so the list stays empty on purpose: an accidental value
 * import fails the purity gate below instead of silently inlining a second
 * copy of a platform package.
 */
const EXTERNALS: readonly string[] = []

/** Virtual-module prefixes for the plain-CSS -> string loader. */
const CSS_PREFIX = '\0dsh-claude-css:'
const CSS_SUFFIX = '.mjs'

export default defineConfig({
  name: `${ID}/client`,
  entry: { client: 'lib/client/index.js' },
  // The browser bundle lands next to the node half; entryFileNames pins it to
  // exactly lib/client.js. `clean` stays off so the tsc output survives.
  outDir: 'lib',
  format: ['cjs'],
  platform: 'browser',
  dts: false,
  sourcemap: true,
  clean: false,
  deps: {
    neverBundle: (id) => EXTERNALS.includes(id),
    // Everything else must inline: a require() the table cannot answer is a
    // guaranteed runtime throw.
    alwaysBundle: (id) => !EXTERNALS.includes(id),
  },
  plugins: [
    {
      // Bundle purity gate: no @deepseek-ai value import may reach the client
      // bundle. Platform packages are reached through cordis services only.
      name: 'dsh-client-bundle-purity',
      resolveId(source) {
        if (!source.startsWith('@deepseek-ai/')) return null
        if (EXTERNALS.includes(source)) return null
        throw new Error(
          `client bundle purity: "${source}" is not a platform module — `
          + 'cross-plugin value imports are forbidden; collaborate through cordis services',
        )
      },
    },
    {
      /**
       * Load a plugin-owned global stylesheet as a default-exported string.
       * The client half injects it as a `<style data-plugin-css>` tag, so
       * unload and HMR remove it together with the plugin.
       */
      name: 'dsh-plain-css-inline',
      resolveId(source, importer) {
        if (!source.endsWith('.css')) return null
        const from = importer !== undefined ? resolve(dirname(importer), source) : source
        // The emitted lib/*.js imports its sibling .css; remap the compiled
        // location back onto the source tree, where the stylesheet lives.
        const marker = `${sep}lib${sep}`
        const at = from.indexOf(marker)
        const abs = at >= 0 ? resolve(from.slice(0, at), 'src', from.slice(at + marker.length)) : from
        return CSS_PREFIX + abs + CSS_SUFFIX
      },
      async load(virtualId) {
        if (!virtualId.startsWith(CSS_PREFIX)) return null
        const file = virtualId.slice(CSS_PREFIX.length, -CSS_SUFFIX.length)
        this.addWatchFile(file)
        const source = await readFile(file, 'utf8')
        return `export default ${JSON.stringify(source)};`
      },
    },
  ],
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
})
