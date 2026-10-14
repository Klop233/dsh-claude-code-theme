<div align="center">

# dsh-claude-code-theme

**Claude Desktop's visual language for the DeepSeek Harness Web GUI.**

Warm paper neutrals, terracotta accent, readable prose, quiet layered surfaces
and a continuous composer — applied through DSH's own theme extension point,
not by patching its stylesheets.

[![npm](https://img.shields.io/npm/v/dsh-claude-code-theme.svg)](https://www.npmjs.com/package/dsh-claude-code-theme)
[![license](https://img.shields.io/npm/l/dsh-claude-code-theme.svg)](./LICENSE)

</div>

## Before and after

Stock DSH — right-aligned bubble on a blue-tinted canvas, soft 12–28px corners,
a floating composer with a circular send button:

<img src="./docs/assets/before-dark.png" alt="The stock DSH conversation view" width="880">

With the theme — a deeper sidebar, a raised right-hand panel, prose set for
reading, compact tool summaries, and a continuous composer:

<img src="./docs/assets/preview-dark.png" alt="The theme applied to a dark session" width="880">

Light mode, on Claude's cream canvas with white raised sheets:

<img src="./docs/assets/preview-light.png" alt="The theme applied to a light session" width="880">

---

## Install

```sh
dsh plugin install dsh-claude-code-theme
```

Or add the row to your profile's `cordis.patch.yml` and its package to the
profile's `dsh.profile.bundles`:

```yaml
- insert:
    - id: claude-code-theme
      name: dsh-claude-code-theme
```

Reload the Web GUI. There is nothing to switch on: the theme composes over
whichever palette you already use, so `light`, `dark` and `system` all keep
working.

## What changes

**Colour.** DSH's design system has three token tiers, and the theme works on
all three:

| Tier | What it is | What the theme does |
| --- | --- | --- |
| `--dsw-static-*` | The raw colour ramps | Retints DSH's blue-tinted greys to Claude's warm paper greys, and DeepSeek blue to terracotta. The alias tier resolves through these, so this alone recolours most of the application. |
| `--dsw-alias-*` | The semantic roles components consume | Pins the roles Claude treats differently: a cream canvas under raised sheets, a terracotta primary button and focus ring, warm hairlines, and text that stops short of pure white on dark. |
| `--dsw-specific-*` | Named surfaces | Retunes the sidebar, composer, bubbles, menus and code surfaces. |

**Surface hierarchy.** Claude Desktop stacks depth rather than flattening it, so
the theme gives each column its own level instead of one shared grey:

| Region | Dark | Light |
| --- | --- | --- |
| Sidebar | `#111110` (deepest) | `#f5f3ec` |
| Canvas | `#171716` | `#faf9f5` |
| Raised sheets — cards, composer, right panel | `#1d1d1b` | `#ffffff` |

The right panel becomes a raised sheet separated by a hairline instead of
floating as a detached card.

**Geometry.** DSH routes **280 `border-radius` declarations through six
`--dsw-radius-*` tokens** (measured across all 179 shipped UI bundles), so the
theme re-points the scale itself:

| Token | DSH | Theme |
| --- | --- | --- |
| `--dsw-radius-xs` | 4px | 4px |
| `--dsw-radius-sm` | 8px | 6px |
| `--dsw-radius-md` | 12px | 8px |
| `--dsw-radius-lg` | 16px | 12px |
| `--dsw-radius-xl` | 20px | 16px |
| `--dsw-radius-panel` | 28px | 20px |

The corners that bypass the scale are reached through the stable `data-slot`
and `data-*` hooks rather than a build hash.

**Typography.** This is the part that most decides whether the result reads as
a product or as a costume. Claude Desktop is a reading surface, so the
transcript is set in the UI sans at a comfortable line height, and monospace is
kept for the things that are actually code:

| | Treatment |
| --- | --- |
| Assistant prose | UI sans, 1.65 line height, normal heading letter-spacing |
| Inline code, code blocks, tool output | Monospace |
| Sidebar, header, composer | UI sans |
| Code-block banner | Sentence case, not shouted uppercase |

**Transcript.** Your turn is a right-aligned bubble on a quiet surface; the
assistant's is prose on the canvas; tool calls collapse into single-line
summaries (`Ran 2 commands ›`) that expand in place, which is how Claude
Desktop keeps a long working session scannable.

**Composer.** One continuous rounded surface: the editor and the controls share
a single card with no divider between them, the submit control is a circle, and
focus draws a soft terracotta ring rather than a hard outline.

**Chrome.** Quiet navigation rows instead of an elevated primary button,
hover states limited to enabled controls, `focus-visible` rings for keyboard
use, and thin warm scrollbars.

## Customisation

Everything the component layer decides reads a `--cct-*` property declared once
on `body`, so you can retune it from your own CSS without patching the package:

```css
body {
  /* A serif reading face, the way long-form prose is often set. */
  --cct-prose: Georgia, "Songti SC", serif;

  /* Roomier or tighter surfaces. */
  --cct-composer-radius: 24px;
  --cct-control-radius: 6px;
  --cct-editor-inset: 20px;
}
```

| Knob | Default | Purpose |
| --- | --- | --- |
| `--cct-sans` | system UI stack | UI face, including the sidebar and composer |
| `--cct-prose` | `var(--cct-sans)` | Face used for assistant prose only |
| `--cct-mono` | DSH's code stack | Code, tool output and paths |
| `--cct-control-radius` | `8px` | Buttons, rows, chips, code blocks |
| `--cct-composer-radius` | `18px` | The composer surface |
| `--cct-editor-inset` | `16px` | Composer text inset from its edge |
| `--cct-focus` | brand primary | Focus ring colour |

To retune colours instead, stack your own layer on top — later layers win per
token:

```js
ctx.theme.overrideTokens('my-tweaks', {
  '--dsw-alias-brand-primary': { light: '#c96442', dark: '#d97757' },
})
```

## How it works

The plugin is a browser half plus an inert host row.

The browser half (`lib/client.js`) does exactly two things, both inside one
Cordis effect, so unloading or HMR removes the theme completely:

1. Calls `ctx.theme.overrideTokens('dsh-claude-code-theme', …)` with 174 tokens
   as `{ light, dark }` pairs. This is DSH's documented third-party theme
   extension point. The service stacks the layer over the active palette and
   `ui-layout` writes it as inline custom properties on `<body>` — which is why
   the theme outranks the base palette sheets without `!important`, and why
   overriding the `--dsw-static-*` ramps propagates to every alias that
   resolves through them.
2. Injects the component stylesheet as a `<style data-plugin-css>` tag, the
   same shape DSH's own plugins use.

The half has no runtime dependencies — no React, no schema library. It never
imports another plugin's code, never registers a keyboard shortcut, and never
touches conversation state.

### How the component layer survives a DSH update

Two kinds of hook are used, in order of preference:

1. **`data-*` hooks and slot anchors** — `[data-slot="sidebar"]`,
   `[data-slot="rightbar"]`, `[data-conversation-region="chat"]`,
   `[data-composer-card]`, `[data-chat-flow-kind]`. These are the components'
   published interfaces.
2. **The semantic half of a CSS-module local name** — `cJsG2q_bubble` hashes
   the prefix but keeps `bubble`, so rules match `[class*="_bubble"]`, scoped by
   the region hook above them. A build hash never appears in a selector.

`renderSlot()` emits a `div[data-slot="…"]` with an inline `display:contents`
between every parent box and its occupant. That anchor is layout-transparent
but it breaks `parent > child` chains, so selectors here are written against
the anchors rather than around them.

When DSH renames a local or a hook, the worst case is one rule stops matching —
the theme degrades, it does not break the app.

## Development

```sh
npm install
npm test        # typecheck, build, CSS validation, behavioural smoke test
```

`npm test` is not decorative. It validates the stylesheet with lightningcss,
checks every DSH token the sheet reads against an allowlist so a typo cannot
silently disable a rule, refuses any selector containing a build hash, and
executes the built bundle through `window.__ModuleLoader__.load` against a stub
DOM to confirm it stacks one well-formed token layer and publishes exactly one
stylesheet that disposal removes.

The visual result is checked against a replica built from DSH's own shipped
component CSS, so changes are judged against the real cascade rather than
against a hand-written approximation.

## Compatibility

Built and verified against DSH `0.2.0-rc.2`. The theme depends only on the
public `theme` service and on DOM hooks the UI components publish, so it is
expected to keep working across patch releases; a renamed local degrades one
rule rather than breaking the app.

## Releasing

```sh
npm test
npm version patch
npm publish
git push --follow-tags
```

`prepublishOnly` runs the full suite, so a broken build cannot reach the
registry.

## License

MIT
