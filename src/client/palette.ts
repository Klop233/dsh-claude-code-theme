/**
 * The Claude Code palette, expressed as DSH design-token overrides.
 *
 * DSH's token system has three tiers (`@deepseek-ai/dsh-client-ui-theme`):
 *
 * 1. `--dsw-static-*` — the raw colour ramps. The two built-in palettes declare
 *    the *same* ramps, and the alias tier points at different steps per scheme
 *    (`--dsw-alias-bg-base` is `neutral-bluish-00` in light and
 *    `neutral-bluish-950` in dark).
 * 2. `--dsw-alias-*` — the semantic tier components actually consume.
 * 3. `--dsw-specific-*` — named surfaces (sidebar, composer, bubbles, menu).
 *
 * Because the alias tier resolves through `var(--dsw-static-*)`, retinting the
 * ramps re-colours nearly the whole application coherently. This module
 * therefore does two things:
 *
 * - **Retints the ramps** from DSH's blue-tinted greys and DeepSeek blue to
 *   Claude's warm paper greys and terracotta.
 * - **Pins the semantically load-bearing aliases** so roles Claude treats
 *   differently from DSH (a cream canvas under white cards, a terracotta focus
 *   ring and primary button, a sidebar lighter than the transcript) land
 *   exactly rather than by accident of ramp arithmetic.
 *
 * Every value is a `{ light, dark }` pair because that is the shape
 * `ctx.theme.overrideTokens()` requires — it validates the pair at runtime and
 * rejects a bare string, since a single value goes illegible when the user
 * flips the OS colour scheme.
 *
 * @module dsh-claude-code-theme/client/palette
 */

/** One token's value in each colour scheme. */
export interface TokenPair {
  /** Value used while the active palette is `light`. */
  light: string
  /** Value used while the active palette is `dark`. */
  dark: string
}

/** A token name to colour-scheme pair map, as `overrideTokens` consumes it. */
export type TokenTable = Record<string, TokenPair>

/** Pair a token from one value per scheme. */
const pair = (light: string, dark: string): TokenPair => ({ light, dark })

/**
 * Expand a light-to-dark ramp into `--prefix-<step>` tokens.
 * @param prefix - the token prefix without its trailing dash.
 * @param steps - ordered `[step, light, dark]` rows.
 * @returns the ramp as a token table.
 */
function ramp(prefix: string, steps: readonly (readonly [string, string, string])[]): TokenTable {
  const table: TokenTable = {}
  for (const [step, light, dark] of steps) table[`${prefix}-${step}`] = pair(light, dark)
  return table
}

/**
 * Claude's warm neutral ramp, replacing `--dsw-static-neutral-bluish-*`.
 *
 * DSH tints this ramp blue, which reads cool and "enterprise". Claude's greys
 * are warm and paper-like: the light end is a cream stock, the dark end a warm
 * charcoal. Both schemes share one ramp, so the steps are laid out as a single
 * light-to-dark scale and the alias tier picks the right end per scheme.
 */
const WARM_RAMP = ramp('--dsw-static-neutral-bluish', [
  ['00', '#ffffff', '#ffffff'],
  ['50', '#faf9f5', '#faf9f5'],
  ['60', '#f5f3ec', '#f5f3ec'],
  ['75', '#f0eee6', '#f0eee6'],
  ['100', '#eae7dd', '#eae7dd'],
  ['150', '#e4e1d7', '#e4e1d7'],
  ['200', '#dcd8cd', '#dcd8cd'],
  ['250', '#d2cec3', '#d2cec3'],
  ['300', '#c5c1b5', '#c5c1b5'],
  ['400', '#a5a199', '#a5a199'],
  ['500', '#8b8780', '#8b8780'],
  ['550', '#797670', '#797670'],
  ['600', '#69665f', '#69665f'],
  ['700', '#55524c', '#55524c'],
  ['750', '#46443f', '#46443f'],
  ['800', '#393734', '#393734'],
  ['850', '#31302d', '#31302d'],
  ['875', '#2b2a28', '#2b2a28'],
  ['900', '#262624', '#262624'],
  ['950', '#1f1e1d', '#1f1e1d'],
  ['1000', '#141413', '#141413'],
])

/** The pure-neutral ramp, warmed to match {@link WARM_RAMP}. */
const NEUTRAL_RAMP = ramp('--dsw-static-neutral', [
  ['00', '#ffffff', '#ffffff'],
  ['50', '#f8f7f3', '#f8f7f3'],
  ['100', '#f0eee7', '#f0eee7'],
  ['150', '#e8e5dd', '#e8e5dd'],
  ['200', '#dedad1', '#dedad1'],
  ['250', '#d3cfc5', '#d3cfc5'],
  ['300', '#c5c1b6', '#c5c1b6'],
  ['400', '#a5a198', '#a5a198'],
  ['500', '#8a8780', '#8a8780'],
  ['550', '#78756e', '#78756e'],
  ['600', '#68655e', '#68655e'],
  ['700', '#54514b', '#54514b'],
  ['800', '#393734', '#393734'],
  ['850', '#31302d', '#31302d'],
  ['900', '#262624', '#262624'],
  ['1000', '#141413', '#141413'],
])

/**
 * Claude's terracotta ramp, replacing `--dsw-static-deepseek-*`.
 *
 * `deepseek-450`/`500` are the accent steps the semantic tier reads, and they
 * carry Claude's brand orange `#d97757` and its darker sibling `#c96442`; the
 * extremes are the tint and shade the tier uses for chips and hovers.
 */
const ACCENT_RAMP = ramp('--dsw-static-deepseek', [
  ['50', '#fdf3ee', '#fdf3ee'],
  ['100', '#f9e3d7', '#f9e3d7'],
  ['200', '#f2cbb6', '#f2cbb6'],
  ['300', '#eab396', '#eab396'],
  ['400', '#e08a63', '#e08a63'],
  ['450', '#d97757', '#d97757'],
  ['500', '#c96442', '#c96442'],
  ['600', '#b0523a', '#b0523a'],
  ['700', '#8f4029', '#8f4029'],
  ['800', '#45271b', '#45271b'],
  ['900', '#2e1a12', '#2e1a12'],
  // Vestigial step the built-in palettes still declare; kept so the ramp stays
  // complete for consumers that reference it defensively.
  ['700-delete', '#8f4029', '#8f4029'],
])

/** Error red: Claude's muted brick rather than DSH's saturated signal red. */
const ERROR_RAMP = ramp('--dsw-static-red', [
  ['50', '#fdf2f0', '#fdf2f0'],
  ['100', '#fbe3df', '#fbe3df'],
  ['400', '#e8837a', '#e8837a'],
  ['400-a12', '#e8837a1f', '#e8837a1f'],
  ['500', '#d9635a', '#d9635a'],
  ['600', '#c04a41', '#c04a41'],
  ['600-a08', '#c04a4114', '#c04a4114'],
  ['900', '#3d1a17', '#3d1a17'],
])

/** Success green: Claude's olive-sage rather than a saturated emerald. */
const SUCCESS_RAMP = ramp('--dsw-static-green', [
  ['100', '#eef2e6', '#eef2e6'],
  ['400', '#9db38a', '#9db38a'],
  ['500', '#7d9b6a', '#7d9b6a'],
  ['500-a08', '#7d9b6a14', '#7d9b6a14'],
  ['500-a12', '#7d9b6a1f', '#7d9b6a1f'],
  ['900', '#1e2a18', '#1e2a18'],
])

/** Warning amber: Claude's warm sand. */
const WARN_RAMP = ramp('--dsw-static-amber', [
  ['100', '#fdf3e3', '#fdf3e3'],
  ['400', '#e8c07a', '#e8c07a'],
  ['500', '#d9a441', '#d9a441'],
  ['600', '#c08a2e', '#c08a2e'],
  ['900', '#2e2415', '#2e2415'],
])

/**
 * The blue ramp, warmed down to a desaturated slate.
 *
 * DSH reserves blue for document selection, the "deep diving" activity label
 * and informational chrome. Claude Code has no blue accent at all, so the ramp
 * is desaturated toward the warm greys; the semantic tier's own blue aliases
 * are then pinned to terracotta in {@link ROLE_TOKENS}.
 */
const INK_RAMP = ramp('--dsw-static-blue', [
  ['50', '#f7f6f2', '#f7f6f2'],
  ['50p', '#f2f0ea', '#f2f0ea'],
  ['75', '#efece4', '#efece4'],
  ['100', '#e8e5dc', '#e8e5dc'],
  ['300', '#c9c5ba', '#c9c5ba'],
  ['400', '#a8a49b', '#a8a49b'],
  ['450', '#96928a', '#96928a'],
  ['500', '#8b8780', '#8b8780'],
  ['600', '#767268', '#767268'],
  ['800', '#4a473f', '#4a473f'],
  ['900', '#332f28', '#332f28'],
  ['950', '#26231d', '#26231d'],
])

/**
 * The semantic tier: roles Claude renders differently from DSH.
 *
 * Only roles where the ramp alone would land wrong are listed. Everything else
 * (masks, skeleton fills, tool-bar fills, diff markers) follows the retinted
 * ramps automatically and stays consistent.
 */
const ROLE_TOKENS: TokenTable = {
  // --- Surfaces ---------------------------------------------------------
  // Claude sets a cream canvas with white raised cards; DSH paints both from
  // one ramp step, which would flatten the two into a single sheet.
  '--dsw-alias-bg-base': pair('#faf9f5', '#1f1e1d'),
  '--dsw-alias-bg-layer-1': pair('#ffffff', '#262624'),
  '--dsw-alias-bg-layer-2': pair('#ffffff', '#2b2a28'),
  '--dsw-alias-bg-layer-3': pair('#ffffff', '#31302d'),
  '--dsw-alias-bg-overlay': pair('#f5f3ec', '#31302d'),
  '--dsw-alias-bg-module-platform': pair('#f5f3ec', '#393734'),
  '--dsw-alias-bg-multi-select': pair('#f5f3ec', '#31302d'),

  // --- Hairlines --------------------------------------------------------
  // Warm-tinted alpha strokes: a neutral black hairline reads grey-blue over a
  // cream canvas, which is exactly the cast this theme removes.
  '--dsw-alias-border-l1': pair('#3d3a3312', '#ffffff14'),
  '--dsw-alias-border-l2': pair('#3d3a3320', '#ffffff24'),
  '--dsw-alias-border-l2-darkmode-thin': pair('#3d3a3320', '#ffffff14'),
  '--dsw-alias-border-l3': pair('#3d3a332b', '#ffffff2e'),
  '--dsw-alias-border-l4': pair('#3d3a3338', '#ffffff3d'),

  // --- Brand and accent -------------------------------------------------
  // DSH's brand primary is near-black ink; Claude's is the terracotta, which
  // is what makes primary buttons read as "Claude" rather than "generic dark".
  '--dsw-alias-brand-primary': pair('#c96442', '#d97757'),
  '--dsw-alias-brand-primary-invert': pair('#c96442', '#d97757'),
  '--dsw-alias-brand-primary-new-colorprimary-new-color': pair('#c96442', '#d97757'),
  '--dsw-alias-brand-text': pair('#1f1e1d', '#faf9f5'),

  '--dsw-alias-button-primary-fill': pair('#c96442', '#d97757'),
  '--dsw-alias-button-primary-hover': pair('#b0523a', '#e08a63'),
  '--dsw-alias-button-primary-dimmed': pair('#f2cbb6', '#45271b'),
  '--dsw-alias-button-info-fill': pair('#c96442', '#d97757'),
  '--dsw-alias-button-info-hover': pair('#b0523a', '#e08a63'),
  '--dsw-alias-button-contrast-fill': pair('#393734', '#faf9f5'),
  '--dsw-alias-button-elevated-fill': pair('#ffffff', '#393734'),
  '--dsw-alias-button-floating-fill': pair('#ffffff', '#2b2a28'),
  '--dsw-alias-button-floating-hover': pair('#f0eee6', '#31302d'),
  '--dsw-alias-button-ghost-active-fill': pair('#eae7dd', '#393734'),
  '--dsw-alias-button-ghost-active-hover': pair('#e4e1d7', '#46443f'),
  '--dsw-alias-button-ghost-active-border': pair('#a5a199', '#69665f'),

  // The focus ring resolves through the business state colour, so this one
  // token recolours every keyboard ring in the application.
  '--dsw-alias-state-business-primary': pair('#c96442', '#d97757'),
  '--dsw-alias-state-business-tertiary': pair('#f9e3d7', '#45271b'),
  '--dsw-alias-link': pair('#b0523a', '#e08a63'),

  // --- Text -------------------------------------------------------------
  '--dsw-alias-label-primary': pair('#1f1e1d', '#faf9f5'),
  '--dsw-alias-label-primary-dimmed': pair('#2b2a28', '#eae7dd'),
  '--dsw-alias-label-secondary': pair('#6b6862', '#b8b4a8'),
  '--dsw-alias-label-tertiary': pair('#8b8780', '#a5a199'),
  '--dsw-alias-label-caption': pair('#a5a199', '#797670'),
  '--dsw-alias-label-dimmed': pair('#d2cec3', '#46443f'),
  '--dsw-alias-label-primary-foreground': pair('#faf9f5', '#1f1e1d'),
  '--dsw-alias-label-primary-inverted': pair('#ffffff', '#31302d'),
  '--dsw-alias-label-primary-bluish': pair('#332f28', '#faf9f5'),
  '--dsw-alias-label-document-preview': pair('#55524c', '#c5c1b5'),
  '--dsw-alias-switch-thumb': pair('#ffffff', '#a5a199'),

  // --- Interaction layers -----------------------------------------------
  '--dsw-alias-interactive-bg-hover': pair('#3d3a3312', '#ffffff14'),
  '--dsw-alias-interactive-bg-active': pair('#3d3a3324', '#ffffff24'),
  '--dsw-alias-interactive-bg-hover-accent': pair('#c9644224', '#d9775733'),
  '--dsw-alias-interactive-bg-hover-solid': pair('#f0eee6', '#31302d'),
  '--dsw-alias-interactive-bg-hover-danger': pair('#c04a410d', '#e8837a26'),

  // --- Named surfaces ---------------------------------------------------
  '--dsw-specific-bubble': pair('#f0eee6', '#2e2d2a'),
  '--dsw-specific-bubble-highlight': pair('#e4e1d7', '#393734'),
  '--dsw-specific-input-major': pair('#ffffff', '#2b2a28'),
  '--dsw-specific-login-input': pair('#f8f7f3', '#262624'),
  '--dsw-specific-menu': pair('#fffffff2', '#31302df2'),
  '--dsw-specific-selector': pair('#f5f3ec', '#31302d'),
  '--dsw-specific-sidebar-fill': pair('#f5f3ec', '#262624'),
  '--dsw-specific-sidebar-nav-item-active': pair('#eae7dd', '#393734'),
  '--dsw-specific-sidebar-nav-item-active-accent': pair('#f9e3d7', '#45271b'),
  '--dsw-specific-sidebar-nav-item-hover': pair('#f0eee6', '#31302d'),
  '--dsw-specific-tip': pair('#f5f3ec', '#31302d'),

  // --- Markdown ---------------------------------------------------------
  '--dsw-alias-markdown-code-block': pair('#f5f3ec', '#1a1918'),
  '--dsw-alias-markdown-code-block-banner': pair('#f0eee6', '#262624'),
  '--dsw-alias-markdown-inline-code': pair('#f0eee6', '#31302d'),
  '--dsw-alias-markdown-tag': pair('#f0eee6', '#31302d'),
  '--dsw-alias-markdown-placeholder': pair('#f5f3ec', '#2e2d2a'),
  '--dsw-alias-markdown-citation': pair('#eae7dd', '#31302d'),
  '--dsw-alias-markdown-code-segment-selected': pair('#ffffff', '#393734'),
  '--dsw-alias-markdown-code-segment-unselected': pair('#f5f3ec', '#1a1918'),

  // --- Overlays ---------------------------------------------------------
  '--dsw-alias-menu-group-header-fill': pair('#faf9f5f0', '#31302df0'),
  '--dsw-alias-menu-icon': pair('#393734', '#eae7dd'),
  '--dsw-alias-toast-bg': pair('#2b2a28', '#393734'),
  '--dsw-alias-toast-label': pair('#faf9f5', '#faf9f5'),
  '--dsw-alias-tooltip-bg': pair('#262624', '#393734'),

  // --- Scrollbars -------------------------------------------------------
  '--dsw-alias-scrollbar-bg-l1': pair('#e4e1d7', '#46443f'),
  '--dsw-alias-scrollbar-bg-l2': pair('#e4e1d7', '#55524c'),
  '--dsw-alias-scrollbar-hover-l1': pair('#d2cec3', '#55524c'),
  '--dsw-alias-scrollbar-hover-l2': pair('#d2cec3', '#69665f'),

  // --- Diff ------------------------------------------------------------
  '--dsw-alias-file-diff-added-bg': pair('#e8efe2', '#1f2a1a'),
  '--dsw-alias-file-diff-added-gutter': pair('#eff4ea', '#172010'),
  '--dsw-alias-file-diff-added-marker': pair('#7d9b6a', '#9db38a'),
  '--dsw-alias-file-diff-deleted-bg': pair('#f9e6e1', '#331a16'),
  '--dsw-alias-file-diff-deleted-gutter': pair('#fcefeb', '#26120e'),
  '--dsw-alias-file-diff-deleted-marker': pair('#c04a41', '#e8837a'),
  '--dsw-alias-code-diff-added': pair('#7d9b6a14', '#9db38a1f'),
  '--dsw-alias-code-diff-deleted': pair('#c04a4114', '#e8837a1f'),

  // --- Document selection and activity ----------------------------------
  '--dsw-alias-bg-document-selection': pair('#d9775733', '#d9775740'),
  '--dsw-alias-label-deep-diving': pair('#8f4029', '#eab396'),
  '--dsw-alias-label-deep-diving-shimmer': pair('#c96442', '#d97757'),
  '--dsw-alias-onboarding-accent': pair('#c96442', '#d97757'),
}

/**
 * Typography: Claude Code leans monospace-first.
 *
 * The code stack leads with the faces Claude Code itself prefers on each
 * platform, and the UI stack keeps DSH's system-sans geometry (only the brand
 * face changes, so text metrics stay stable).
 */
const TYPOGRAPHY_TOKENS: TokenTable = {
  '--ds-font-family-code': pair(
    '"SF Mono", "Claude Code Mono", "JetBrains Mono", "Fira Code", Menlo, Consolas, "Liberation Mono", "PingFang SC", "Microsoft YaHei", monospace',
    '"SF Mono", "Claude Code Mono", "JetBrains Mono", "Fira Code", Menlo, Consolas, "Liberation Mono", "PingFang SC", "Microsoft YaHei", monospace',
  ),
}

/**
 * Geometry: Claude Code's corner scale.
 *
 * DSH routes 280 `border-radius` declarations through these six tokens
 * (measured across all 179 shipped UI bundles), so re-pointing them squares
 * the whole application coherently. DSH's scale is consumer-app soft —
 * 4/8/12/16/20/28px; Claude Code is terminal-adjacent and sits at 2/3/4/6/8px.
 *
 * The values are identical in both colour schemes, but `overrideTokens`
 * requires a pair, so each is repeated.
 */
const RADIUS_TOKENS: TokenTable = {
  '--dsw-radius-xs': pair('2px', '2px'),
  '--dsw-radius-sm': pair('3px', '3px'),
  '--dsw-radius-md': pair('4px', '4px'),
  '--dsw-radius-lg': pair('6px', '6px'),
  '--dsw-radius-xl': pair('8px', '8px'),
  '--dsw-radius-panel': pair('8px', '8px'),
}

/**
 * The complete override layer, in the order it reads best: ramps first (they
 * carry the bulk of the recolour), then semantic roles, then geometry.
 */
export const CLAUDE_CODE_TOKENS: TokenTable = {
  ...WARM_RAMP,
  ...NEUTRAL_RAMP,
  ...ACCENT_RAMP,
  ...ERROR_RAMP,
  ...SUCCESS_RAMP,
  ...WARN_RAMP,
  ...INK_RAMP,
  ...ROLE_TOKENS,
  ...RADIUS_TOKENS,
  ...TYPOGRAPHY_TOKENS,
}

/**
 * Layer identity for `ctx.theme.overrideTokens()`.
 *
 * The theme service keys override layers by source, so a stable id keeps the
 * layer replaceable (re-applying replaces this source's whole layer) and names
 * its origin for inspection.
 */
export const THEME_SOURCE = 'dsh-claude-code-theme'

/** Claude's brand terracotta, exported for downstream consumers and docs. */
export const CLAUDE_ACCENT = '#d97757' as const

/** Claude's warm dark canvas, exported for downstream consumers and docs. */
export const CLAUDE_DARK_CANVAS = '#1f1e1d' as const

/** Claude's cream light canvas, exported for downstream consumers and docs. */
export const CLAUDE_LIGHT_CANVAS = '#faf9f5' as const
