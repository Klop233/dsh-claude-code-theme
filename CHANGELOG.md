# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-14

Initial release.

### Added

- **Token layer** — 168 `--dsw-*` design tokens overridden with `{ light, dark }`
  pairs through `ctx.theme.overrideTokens`, DSH's documented third-party theme
  extension point. Covers the `--dsw-static-*` colour ramps (DSH's blue-tinted
  greys become Claude's warm paper greys; DeepSeek blue becomes terracotta), the
  semantic `--dsw-alias-*` tier, and the `--dsw-specific-*` named surfaces.
- **Component layer** — a plugin-owned stylesheet injecting Claude Code's
  transcript grammar on the stable `data-*` hooks DSH publishes: `>` for user
  input, `⏺` for assistant messages and completed tool calls, `⎿` for tool
  output, `✻` for thinking and the working line.
- Mono-forward typography, Claude's 6 px corner geometry, warm hairlines,
  thin warm scrollbars, and a terracotta focus ring and selection colour.
- `--cct-*` custom properties on `body` for retuning every glyph, radius and
  metric from user CSS without patching the package.
- `npm test` — typecheck, build, lightningcss stylesheet validation, and a
  behavioural smoke test that executes the built bundle through
  `window.__ModuleLoader__.load` against a stub DOM.

[0.1.0]: https://github.com/Klop233/dsh-claude-code-theme/releases/tag/v0.1.0
