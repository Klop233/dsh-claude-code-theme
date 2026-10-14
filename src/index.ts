/**
 * Host half of dsh-claude-code-theme.
 *
 * The plugin is purely presentational, so there is nothing model-facing to
 * register here: every visual change ships in the browser half
 * (`lib/client.js`), which the web app loads because `package.json` declares
 * `dsh.client`. This row exists so the plugin is a first-class loader entry —
 * a profile can retune or disable it by id, and the Settings plugin inventory
 * can list it like any other plugin.
 *
 * The palette itself is pure data with no DOM dependency, so Node-side tooling
 * can read it through the `dsh-claude-code-theme/palette` subpath.
 *
 * @module dsh-claude-code-theme
 */

import type { Context } from '@deepseek-ai/cordis'

/** No host services are required. */
export const inject: readonly string[] = []

/**
 * Host plugin body.
 *
 * Deliberately inert. The browser half owns the theme; this half only anchors
 * the loader row.
 * @param _ctx - the host context, unused.
 */
export function apply(_ctx: Context): void {
  // Intentional no-op: see the module documentation.
}

export {
  CLAUDE_ACCENT,
  CLAUDE_CODE_TOKENS,
  CLAUDE_DARK_CANVAS,
  CLAUDE_LIGHT_CANVAS,
  THEME_SOURCE,
} from './client/palette.ts'
export type { TokenPair, TokenTable } from './client/palette.ts'
