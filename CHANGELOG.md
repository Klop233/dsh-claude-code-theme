# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-14

Initial release.

### Added

- **Token layer** — 174 `--dsw-*` design tokens overridden with
  `{ light, dark }` pairs through `ctx.theme.overrideTokens`, DSH's documented
  third-party theme extension point:
  - the `--dsw-static-*` colour ramps, retinted from DSH's blue-tinted greys to
    Claude's warm paper greys and from DeepSeek blue to terracotta, which
    propagates to every alias that resolves through them;
  - the semantic `--dsw-alias-*` tier, pinning the roles where Claude differs
    from DSH on purpose (cream canvas under white cards, terracotta primary
    button and focus ring, warm hairlines);
  - the `--dsw-specific-*` named surfaces (sidebar, composer, bubbles, menus);
  - the six-token `--dsw-radius-*` corner scale, which carries 280 of DSH's
    `border-radius` declarations.

- **Component layer** — a plugin-owned stylesheet, written against the `data-*`
  hooks DSH publishes and the semantic half of its CSS-module local names
  (never a build hash):
  - Claude Code's transcript grammar: `>` for user input, `⏺` for assistant
    messages and completed tool calls, `⎿` for tool output, `✻` for thinking
    and for the working line;
  - a monospace transcript, the way a terminal program renders;
  - the user's message restyled from a right-aligned rounded bubble into
    left-aligned plaintext behind a `>` prompt;
  - the composer restyled from a 28px-radius floating card with an elevation
    ring into a square hairline box with a `>` prompt and a mono status line;
  - tighter density through DSH's `--dsh-*` layout metrics, and the 177 corners
    that bypass the shared scale caught by semantic local-name matching;
  - monospace sidebar and header chrome, thin square scrollbars, a terracotta
    selection colour.

- `--cct-*` custom properties on `body` for retuning every glyph, radius,
  metric and density value from user CSS without patching the package.

- `npm test` — typecheck, build, lightningcss validation of the stylesheet
  (including an allowlist of the DSH tokens it may read, so a typo cannot
  silently disable a rule), and a behavioural smoke test that executes the
  built bundle through `window.__ModuleLoader__.load` against a stub DOM.

[0.1.0]: https://github.com/Klop233/dsh-claude-code-theme/releases/tag/v0.1.0
