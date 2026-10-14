<div align="center">

# dsh-claude-code-theme

**Claude Code's visual language for the DeepSeek Harness Web GUI.**

Warm paper neutrals, terracotta accent, a monospace transcript behind a `>`
prompt, square geometry, and Claude Code's `⏺` / `⎿` / `✻` markers — applied
through DSH's own theme extension point, not by patching its stylesheets.

[![npm](https://img.shields.io/npm/v/dsh-claude-code-theme.svg)](https://www.npmjs.com/package/dsh-claude-code-theme)
[![license](https://img.shields.io/npm/l/dsh-claude-code-theme.svg)](./LICENSE)

</div>

## Before and after

Stock DSH — right-aligned rounded bubble, proportional sans, soft 12–28px
corners, a floating composer card with a circular send button:

<img src="./docs/assets/before-dark.png" alt="The stock DSH conversation view" width="880">

With the theme — a left-aligned `>` prompt on a monospace transcript, the tool
call and its `⎿` output, thinking as a terracotta `✻`, and a square hairline
composer with a status line:

<img src="./docs/assets/preview-dark.png" alt="The theme applied to a dark session" width="880">

Light mode, on Claude's cream canvas with white raised cards:

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
| `--dsw-alias-*` | The semantic roles components consume | Pins the roles where Claude differs from DSH on purpose: a cream canvas under white cards, a terracotta primary button and focus ring, warm hairlines. |
| `--dsw-specific-*` | Named surfaces | Retunes the sidebar, composer, message blocks, menus and code surfaces. |

**Geometry.** DSH routes **280 `border-radius` declarations through six
`--dsw-radius-*` tokens** (measured across all 179 shipped UI bundles), so the
theme re-points the scale itself:

| Token | DSH | Theme |
| --- | --- | --- |
| `--dsw-radius-xs` | 4px | 2px |
| `--dsw-radius-sm` | 8px | 3px |
| `--dsw-radius-md` | 12px | 4px |
| `--dsw-radius-lg` | 16px | 6px |
| `--dsw-radius-xl` | 20px | 8px |
| `--dsw-radius-panel` | 28px | 8px |

The 177 corners that bypass the scale are caught by matching the *semantic*
half of each local class name (`[class*="_card" i]`, `[class*="_dialog" i]`, …)
rather than a build hash. Shapes that are meant to be round — dots, avatars,
thumbs, spinners — are deliberately excluded.

**Density.** DSH declares its layout metrics as `--dsh-*` custom properties,
several of them on the very rows that consume them, so the theme re-declares
the rhythm across the subtree: the transcript gap drops from 6/12px to a
uniform 6px, the composer's stack gap, dock inset and side clearance tighten,
and the sidebar's inline padding drops from 12px to 8px. Row heights, panel
padding and the sidebar's own scale follow the same tighter step.

**The transcript.** This is the substantive change, not a recolour:

| | DSH | Theme |
| --- | --- | --- |
| Typography | Proportional sans | **Monospace**, the way a terminal program renders |
| Your message | Right-aligned rounded bubble with a fill | **Left-aligned plaintext** behind a `>` prompt, no container |
| Assistant | Plain text | `⏺` marker |
| Tool call | Row with an icon | `⏺` marker in Claude Code's green — an action that completed |
| Tool output | Elevated card | `⎿` marker over a flat mono card |
| Thinking | Collapsed summary | `✻` in terracotta, italic |
| Working | Shimmer label | `✻` turning slowly |
| Code | Rounded card | Hairline border, uppercase language banner |

**The composer.** DSH's is a 28px-radius floating card whose hairline is an
elevation ring, with a circular send button. The theme makes it a square box
with a real 1px border, drops the ring and the shadow, puts a `>` prompt inside
it, and turns the controls row into a mono status line ruled off by a hairline.
The prompt, the editor and the placeholder are moved together, because the
placeholder is absolutely positioned against the card and pinned to the
editor's original padding box.

**Chrome.** Sidebar labels, the conversation title, session rows and the build
version go monospace; scrollbars become thin square rails.

## Customisation

The component layer reads its glyphs, radii and metrics from `--cct-*` knobs,
declared once on `body`. Override any of them from user CSS — no fork needed:

```css
body {
  /* A different prompt, and a wider gutter to match. */
  --cct-marker-user: "❯";
  --cct-marker-gutter: 26px;

  /* Squarer still, the way a terminal is. */
  --cct-radius: 2px;
  --cct-radius-sm: 0px;

  /* A roomier transcript than Claude Code's default. */
  --cct-flow-gap: 10px;
  --cct-transcript-size: 14px;

  /* Or drop the transcript markers entirely. */
  --cct-marker-assistant: "";
  --cct-marker-tool: "";
}
```

| Knob | Default | Purpose |
| --- | --- | --- |
| `--cct-marker-user` | `">"` | Prompt marker on your messages, and in the composer |
| `--cct-marker-assistant` | `"●"` | Marker on assistant messages |
| `--cct-marker-tool` | `"●"` | Marker on tool calls |
| `--cct-marker-result` | `"⎿"` | Marker on tool output |
| `--cct-marker-reasoning` | `"✻"` | Marker on thinking, and on the working line |
| `--cct-marker-gutter` | `20px` | Left gutter reserved for the markers |
| `--cct-prompt-inset` | `10px` | Distance of the composer's prompt from the box edge |
| `--cct-radius` | `4px` | Standard corner |
| `--cct-radius-sm` | `2px` | Tight corner (rows, chips, inline code) |
| `--cct-radius-lg` | `6px` | Loose corner |
| `--cct-flow-gap` | `6px` | Gap between transcript blocks |
| `--cct-flow-gap-response` | `10px` | Gap after an assistant response |
| `--cct-transcript-size` | `13px` | Transcript text size |
| `--cct-transcript-leading` | `1.55` | Transcript line height |
| `--cct-mono` | DSH's code stack | Monospace face |

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
imports another plugin's code; it reaches the theme service through Cordis, and
targets the DOM through the `data-*` hooks the components publish plus the
semantic half of their CSS-module local names. It never matches a build hash.

### How the component layer survives a DSH update

DSH's class names are CSS-module hashes — `cJsG2q_bubble`. The hash is a build
artefact; the local half (`bubble`) is the component's own vocabulary. So the
stylesheet matches `[class*="_bubble"]`, and scopes generic locals under the
`data-*` hooks (`[data-chat-flow] [class*="_userRow"]`) so a `_row` in one
region cannot leak into another. When DSH renames a local or a hook, the worst
case is one rule stops matching — the theme degrades, it does not break the app.

Every rule is written `body <scope> <target>`, which wins the cascade against a
component's single-class rule regardless of injection order, so nothing needs
`!important` — except the `--dsh-*` density metrics, which components declare on
the very rows that consume them and which therefore have to be re-declared
across the subtree to be uniform.

Because the row is inert, disabling it is the `enabled: false` any loader row
takes, and uninstalling leaves no residue — the token layer is dropped and the
style tag removed.

## Compatibility

| DSH | Status |
| --- | --- |
| `0.2.0-rc.2` | Compatible |

The theme depends on the `ctx.theme` service from `@deepseek-ai/dsh-client-ui-theme`
and on the `data-chat-flow-kind`, `data-composer-*` and `data-code-block-banner`
attributes. If a future release renames either, the plugin degrades rather than
breaking the app: a missing service costs the colour layer, a missing attribute
costs one rule.

## Development

```sh
npm install
npm test        # typecheck, build, CSS validation, behavioural smoke test
npm run build   # lib/index.js + lib/client.js
```

`npm test` is not decorative. `scripts/verify-css.mjs` parses the stylesheet
with lightningcss and fails on a rule that reads an undeclared `--cct-*` knob or
targets a hashed class name. `scripts/smoke.mjs` executes the built bundle the
way the web shell does — through `window.__ModuleLoader__.load` against a stub
DOM — and asserts the override table is well-formed `{ light, dark }` pairs and
that disposal retracts both registrations.

### Releasing

`prepublishOnly` runs the full suite, so publishing cannot ship a bundle that
fails its own tests:

```sh
npm login          # once per machine
npm publish        # typecheck -> build -> verify:css -> smoke -> upload
```

To preview exactly what would be uploaded without publishing:

```sh
npm pack --dry-run
```

## License

[MIT](./LICENSE)
