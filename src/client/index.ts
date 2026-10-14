/**
 * Browser half of dsh-claude-code-theme.
 *
 * Two registrations, both owned by one Cordis effect so unload and HMR tear
 * the theme down completely:
 *
 * 1. **Token layer** — {@link CLAUDE_CODE_TOKENS} stacked onto whatever light
 *    or dark palette the user has active, through `ctx.theme.overrideTokens`.
 *    That is the documented third-party extension point: the layer composes
 *    over the built-in theme, later layers win per token, and dropping the
 *    layer restores exactly what it covered. Because the override lands as
 *    inline custom properties on `<body>`, it also outranks the base palette
 *    sheets without any `!important` — including overrides of the
 *    `--dsw-static-*` ramps the alias tier resolves through.
 * 2. **Component layer** — the plugin-owned stylesheet from `styles.css`,
 *    injected as a `<style data-plugin-css>` tag in the same shape DSH's own
 *    plugins use, so it is identifiable in DevTools and removed on unload.
 *
 * The half is dependency-free: no React, no schema library. Cross-plugin
 * collaboration goes through the cordis `theme` service, never a value import.
 *
 * @module dsh-claude-code-theme/client
 */

import type { Context } from '@deepseek-ai/cordis'
import styles from './styles.css'
import { CLAUDE_CODE_TOKENS, THEME_SOURCE } from './palette.ts'

/** The token override layer a caller may stack, as `overrideTokens` expects. */
export interface ThemeTokenOverrides {
  [token: string]: { light: string; dark: string }
}

/** The slice of the client theme service this plugin uses. */
export interface ThemeService {
  /**
   * Stack a partial token layer over the active theme.
   * @param source - layer identity; one layer per source.
   * @param tokens - token name to `{ light, dark }` value pairs.
   * @returns disposer removing exactly the layer this call created.
   */
  overrideTokens(source: string, tokens: ThemeTokenOverrides): () => void
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Theme registry and preference owner, provided by `dsh-client-ui-theme`. */
    theme: ThemeService
  }
}

/**
 * Required client service: the theme registry. Declared as a hard dependency
 * because a restyle that cannot reach the token layer has nothing to do; the
 * body still probes for the service so a composition without it degrades to
 * stylesheet-only instead of throwing.
 */
export const inject = ['theme']

/** `data-plugin-css` identity of the injected stylesheet. */
const STYLE_ID = 'dsh-claude-code-theme/styles.css'

/**
 * Append the component stylesheet to the document head.
 *
 * A pre-existing tag with the same identity is replaced rather than duplicated,
 * which keeps an HMR re-run from stacking copies of the same rules.
 * @returns disposer removing the tag this call installed.
 */
function mountStylesheet(): () => void {
  if (typeof document === 'undefined') return () => undefined
  const selector = `style[data-plugin-css=${JSON.stringify(STYLE_ID)}]`
  for (const stale of document.querySelectorAll(selector)) stale.remove()
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-claude-code-theme'
  tag.dataset.pluginCss = STYLE_ID
  tag.textContent = styles
  document.head.appendChild(tag)
  return () => {
    tag.remove()
  }
}

/**
 * Client plugin body: stack the Claude Code token layer over the active
 * palette and publish the component stylesheet.
 * @param ctx - the client root context.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => {
    const disposers: Array<() => void> = []
    const theme = ctx.get('theme')
    if (theme !== undefined) {
      disposers.push(theme.overrideTokens(THEME_SOURCE, CLAUDE_CODE_TOKENS))
    }
    disposers.push(mountStylesheet())
    return () => {
      for (const dispose of disposers.reverse()) dispose()
    }
  }, 'dsh-claude-code-theme: Claude Code palette and component styles')
}
