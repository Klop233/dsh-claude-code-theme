# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **The theme now follows Claude Desktop rather than the Claude Code terminal.**
  The first release borrowed the terminal's grammar — a monospace transcript, a
  `>` prompt gutter, `⏺` / `⎿` / `✻` markers and square corners. On a web GUI
  that reads as a costume: monospace prose is harder to read, the marker gutter
  cost horizontal space, and CJK text suffered most. The visual language is now
  taken from the desktop product instead.

- **Typography.** The transcript is set in the UI sans at a 1.65 line height;
  monospace is kept for code, tool output and paths. The code-block banner is
  sentence case rather than shouted uppercase. `--cct-prose` overrides the face
  used for assistant prose alone.

- **Surface hierarchy.** The columns now stack depth instead of sharing one
  grey: sidebar `#111110`, canvas `#171716`, raised sheets `#1d1d1b` (dark), and
  cream canvas under white sheets in light. Dark-mode text stops short of pure
  white. The right panel is a raised sheet behind a hairline, not a detached
  card.

- **Corner scale.** The shared `--dsw-radius-*` scale moves from the terminal's
  2/3/4/6/8/8px to a product scale of 4/6/8/12/16/20px.

- **Transcript.** The user's turn is a right-aligned bubble on a quiet surface;
  assistant prose is plain reading text; tool calls stay compact expandable
  summaries.

- **Composer.** One continuous surface with no divider between the editor and
  the controls, a circular submit control, and a soft focus ring. The terminal
  prompt glyph is gone, and the editor and placeholder offsets stay aligned.

- **Chrome.** Quiet navigation rows replace the elevated primary button; hover
  is limited to enabled controls; `focus-visible` rings, mobile widths and
  reduced motion are handled.

### Removed

- The `>` / `⏺` / `⎿` / `✻` transcript markers and the marker gutter.
- The synthetic "completed tool call" green dot, which implied state DSH does
  not report.

### Fixed

- Removed a raw `document` keydown handler that would have collided with DSH's
  own shortcut registry (`Ctrl/Cmd+K` is session search). The theme registers no
  shortcuts at all; DSH owns every binding.

### Added

- Regression guards in `npm test`: the corner scale must match the Desktop
  values, the warm ramp must stay complete, no selector may contain a build
  hash, and every DSH token the sheet reads must be on the allowlist.

## [0.1.0] - 2026-10-14

Initial release: 174 design tokens overridden through
`ctx.theme.overrideTokens`, plus a component stylesheet written against DSH's
`data-*` hooks and the semantic half of its CSS-module local names.

[Unreleased]: https://github.com/Klop233/dsh-claude-code-theme/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Klop233/dsh-claude-code-theme/releases/tag/v0.1.0
