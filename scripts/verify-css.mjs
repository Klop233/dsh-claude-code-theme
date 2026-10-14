/**
 * Stylesheet validation for dsh-claude-code-theme.
 *
 * Parses `src/client/styles.css` with lightningcss — the same engine the
 * harness uses to compile plugin stylesheets — so a real CSS grammar rejects
 * anything a brace counter would miss. It then checks the two properties that
 * make the sheet safe to inject into a live application:
 *
 * - every `--cct-*` knob the rules *read* is declared on `body`, so no rule
 *   silently resolves to an invalid value, and
 * - every `var()` fallback-free read of a DSH token names a token the theme
 *   actually knows about, so a typo cannot quietly disable a rule.
 *
 * Usage: node scripts/verify-css.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { transform } from 'lightningcss'

const here = dirname(fileURLToPath(import.meta.url))
const cssPath = resolve(here, '..', 'src', 'client', 'styles.css')
const source = readFileSync(cssPath, 'utf8')

let failures = 0
/** Assert a condition, recording the outcome. */
function check(condition, message) {
  if (condition) console.log(`  ok    ${message}`)
  else {
    failures += 1
    console.error(`  FAIL  ${message}`)
  }
}

console.log(`css: ${cssPath}\n`)

console.log('parse')
let code = ''
try {
  const result = transform({
    filename: cssPath,
    code: Buffer.from(source),
    minify: false,
    errorRecovery: false,
  })
  code = result.code.toString()
  check(true, `lightningcss parses the stylesheet (${result.code.length} bytes out)`)
} catch (error) {
  check(false, `lightningcss parses the stylesheet — ${error.message}`)
}

console.log('\ncustom properties')
/** Every `--cct-*` name declared anywhere in the sheet. */
const declared = new Set()
for (const match of source.matchAll(/(--cct-[a-z0-9-]+)\s*:/g)) declared.add(match[1])

/**
 * Reads that have no fallback and therefore must be declared: `var(--cct-x)`
 * with no comma before the closing paren.
 */
const read = new Set()
for (const match of source.matchAll(/var\(\s*(--cct-[a-z0-9-]+)\s*\)/g)) read.add(match[1])

const undeclared = [...read].filter((name) => !declared.has(name))
check(declared.size > 0, `sheet declares ${declared.size} --cct-* knobs`)
check(
  undeclared.length === 0,
  `every fallback-free --cct-* read is declared${undeclared.length > 0 ? ` — undeclared: ${undeclared.join(', ')}` : ''}`,
)

console.log('\ndsh token references')
/**
 * DSH tokens this sheet may read. The list is the subset of the design system
 * the component layer legitimately depends on; a reference outside it is a
 * typo that would silently drop the declaration.
 */
const KNOWN_DSH_TOKENS = new Set([
  '--dsw-alias-bg-base',
  '--dsw-alias-bg-document-selection',
  '--dsw-alias-bg-layer-1',
  '--dsw-alias-border-l1',
  '--dsw-alias-border-l2',
  '--dsw-alias-brand-primary',
  '--dsw-alias-interactive-bg-hover',
  '--dsw-alias-label-caption',
  '--dsw-alias-label-primary',
  '--dsw-alias-label-secondary',
  '--dsw-alias-label-tertiary',
  '--dsw-alias-markdown-code-block',
  '--dsw-alias-state-success-primary',
  '--dsw-font-family',
  '--dsw-specific-bubble',
  '--dsw-specific-input-major',
  '--dsw-specific-sidebar-nav-item-hover',
  '--ds-font-family-code',
])

/** Fallback-free DSH token reads. */
const dshRead = new Set()
for (const match of source.matchAll(/var\(\s*(--dsw?-[a-z0-9-]+|--ds-[a-z0-9-]+)\s*\)/g)) dshRead.add(match[1])

const unknown = [...dshRead].filter((name) => !KNOWN_DSH_TOKENS.has(name))
check(
  unknown.length === 0,
  `every DSH token read is a known design-system token${unknown.length > 0 ? ` — unknown: ${unknown.join(', ')}` : ''}`,
)

console.log('\nselector safety')
// The component layer must target published data-* hooks, never the hashed
// CSS-module class names, which are build artefacts.
const classSelectors = [...source.matchAll(/^\s*([^@{}\n][^{}\n]*)\{/gm)]
  .map((match) => match[1])
  .filter((selector) => /^[^/]*\.[a-zA-Z_]/.test(selector) && !selector.trim().startsWith('*'))
check(
  classSelectors.length === 0,
  `no rule targets a hashed class name${classSelectors.length > 0 ? ` — ${classSelectors.slice(0, 3).join(' | ')}` : ''}`,
)

const bodyScoped = [...source.matchAll(/body\s+\[data-/g)].length
check(bodyScoped > 0, `${bodyScoped} rules are body-scoped for cascade safety`)

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
