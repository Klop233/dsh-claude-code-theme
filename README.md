<div align="center">

# dsh-claude-code-theme

**Claude Code's visual language for the DeepSeek Harness Web GUI.**

Warm paper neutrals, terracotta accent, the `>` / `⏺` / `⎿` / `✻` transcript
grammar, and mono-forward typography — applied through DSH's own theme
extension point, not by patching its stylesheets.

[![npm](https://img.shields.io/npm/v/dsh-claude-code-theme.svg)](https://www.npmjs.com/package/dsh-claude-code-theme)
[![license](https://img.shields.io/npm/l/dsh-claude-code-theme.svg)](./LICENSE)

<img src="./docs/assets/preview-dark.png" alt="The theme applied to a dark session" width="880">

<sub>Dark. The user's input carries a `>` prompt, a completed tool call a green `⏺`, its output a `⎿`, and thinking a terracotta `✻`.</sub>

<img src="./docs/assets/preview-light.png" alt="The theme applied to a light session" width="880">

<sub>Light. The cream canvas Claude uses, with white raised cards.</sub>

</div>

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

**Transcript grammar.** Claude Code's terminal markers, added with
pseudo-elements on the stable `data-*` hooks DSH publishes:

| Marker | Node | Meaning |
| --- | --- | --- |
| `>` | `[data-chat-flow-kind="user"]` | Your input |
| `⏺` | `[data-chat-flow-kind="assistant"]` | The assistant speaking |
| `⏺` | `[data-chat-flow-kind="tool-call"]` | A tool call that completed |
| `⎿` | `[data-chat-flow-kind="tool-result"]` | That call's output |
| `✻` | `[data-chat-flow-kind="reasoning"]` | Thinking |
| `✻` | `[data-chat-running]` | Working, with the mark slowly turning |

**Typography and geometry.** Code, tool output and diffs take Claude Code's
monospace stack; corners tighten to Claude's 6 px; headings lose DSH's extra
letter-spacing; scrollbars become thin warm rails.

## Customisation

The component layer reads its glyphs, radii and metrics from `--cct-*` knobs,
declared once on `body`. Override any of them from user CSS — no fork needed:

```css
body {
  /* A different prompt, and a wider gutter to match. */
  --cct-marker-user: "❯";
  --cct-marker-gutter: 26px;

  /* Squarer, the way a terminal is. */
  --cct-radius: 4px;
  --cct-radius-lg: 6px;

  /* Or drop the transcript markers entirely. */
  --cct-marker-assistant: "";
  --cct-marker-tool: "";
}
```

| Knob | Default | Purpose |
| --- | --- | --- |
| `--cct-marker-user` | `">"` | Prompt marker on your messages |
| `--cct-marker-assistant` | `"●"` | Marker on assistant messages |
| `--cct-marker-tool` | `"●"` | Marker on tool calls |
| `--cct-marker-result` | `"⎿"` | Marker on tool output |
| `--cct-marker-reasoning` | `"✻"` | Marker on thinking, and on the working line |
| `--cct-marker-gutter` | `22px` | Left gutter reserved for the markers |
| `--cct-radius` | `6px` | Standard corner |
| `--cct-radius-sm` | `4px` | Tight corner (inline code) |
| `--cct-radius-lg` | `10px` | Loose corner |
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

1. Calls `ctx.theme.overrideTokens('dsh-claude-code-theme', …)` with 168 tokens
   as `{ light, dark }` pairs. This is DSH's documented third-party theme
   extension point. The service stacks the layer over the active palette and
   `ui-layout` writes it as inline custom properties on `<body>` — which is why
   the theme outranks the base palette sheets without `!important`, and why
   overriding the `--dsw-static-*` ramps propagates to every alias that
   resolves through them.
2. Injects the component stylesheet as a `<style data-plugin-css>` tag, the
   same shape DSH's own plugins use.

The half has no runtime dependencies — no React, no schema library. It never
imports another plugin's code; it reaches the theme service through Cordis and
targets the DOM through the `data-*` attributes the UI components publish,
never their hashed CSS-module class names.

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

## License

[MIT](./LICENSE)
