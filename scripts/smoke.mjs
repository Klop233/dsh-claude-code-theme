/**
 * Headless smoke test for the built client bundle.
 *
 * Runs `lib/client.js` the way the web shell does — through
 * `window.__ModuleLoader__.load` — against a minimal DOM and cordis context,
 * then asserts the two things the theme must do: stack a well-formed
 * `{ light, dark }` token layer on the theme service, and publish exactly one
 * plugin-owned stylesheet that disposal removes.
 *
 * Usage: node scripts/smoke.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const bundlePath = resolve(here, '..', 'lib', 'client.js')
const source = readFileSync(bundlePath, 'utf8')

let failures = 0
/** Record a failed assertion. */
function fail(message) {
  failures += 1
  console.error(`  FAIL  ${message}`)
}
/** Record a passed assertion. */
function pass(message) {
  console.log(`  ok    ${message}`)
}
/** Assert a condition. */
function check(condition, message) {
  if (condition) pass(message)
  else fail(message)
}

// --- Minimal DOM -----------------------------------------------------------

const appended = []
/** The subset of Element the plugin touches. */
function makeElement(tagName) {
  const element = {
    tagName: tagName.toUpperCase(),
    dataset: {},
    textContent: '',
    removed: false,
    remove() {
      this.removed = true
    },
  }
  return element
}

const head = {
  children: appended,
  appendChild(node) {
    appended.push(node)
    return node
  },
}

const document = {
  head,
  createElement: makeElement,
  querySelectorAll(selector) {
    // Only the plugin's own identity selector is ever queried.
    if (!selector.includes('dsh-claude-code-theme')) return []
    return appended.filter((node) => !node.removed)
  },
}

// --- Module loader capture -------------------------------------------------

let registered = null
const window = {
  __ModuleLoader__: {
    load(entry) {
      registered = entry
    },
  },
}

// --- Cordis context stub ---------------------------------------------------

const overrideCalls = []
let tokenDisposed = false
const effects = []

const theme = {
  overrideTokens(source, tokens) {
    overrideCalls.push({ source, tokens })
    return () => {
      tokenDisposed = true
    }
  },
}

const ctx = {
  get(name) {
    return name === 'theme' ? theme : undefined
  },
  effect(callback, label) {
    effects.push({ dispose: callback(), label })
  },
}

// --- Run the bundle --------------------------------------------------------

console.log(`smoke: ${bundlePath}\n`)

// The bundle is a CJS closure that expects `window` and `document` as globals.
// Its `intro` declares its own `module`/`exports` inside the factory, so the
// exports must be read from the factory's return value — exactly what the web
// shell does.
const run = new Function('window', 'document', source)
run(window, document)

console.log('registration')
check(registered !== null, 'bundle registers through window.__ModuleLoader__.load')
check(registered?.id === 'dsh-claude-code-theme', `registration id is the package name (${registered?.id})`)
check(typeof registered?.factory === 'function', 'registration exposes a factory')

/** The loader module table stub: anything unresolved is a hard failure. */
const requireStub = (id) => {
  throw new Error(`unresolved external in client bundle: ${id}`)
}

const api = registered.factory(requireStub)
console.log('\nplugin surface')
check(typeof api.apply === 'function', 'exports.apply is a function')
check(
  Array.isArray(api.inject) && api.inject.includes('theme'),
  `exports.inject declares the theme service (${JSON.stringify(api.inject)})`,
)

console.log('\napply')
api.apply(ctx)

check(effects.length === 1, `apply installs exactly one cordis effect (${effects.length})`)
check(overrideCalls.length === 1, `theme.overrideTokens called once (${overrideCalls.length})`)

const call = overrideCalls[0]
check(call?.source === 'dsh-claude-code-theme', `override source is the package id (${call?.source})`)

const tokens = call?.tokens ?? {}
const names = Object.keys(tokens)
check(names.length > 150, `override table is comprehensive (${names.length} tokens)`)

// Every value must be a { light, dark } pair of non-empty strings — the theme
// service throws a teaching error on a bare string, so this catches the exact
// mistake the service rejects.
let malformed = 0
let notWrapped = 0
for (const [name, value] of Object.entries(tokens)) {
  if (typeof value !== 'object' || value === null) {
    malformed += 1
    continue
  }
  if (typeof value.light !== 'string' || typeof value.dark !== 'string') malformed += 1
  else if (value.light.trim() === '' || value.dark.trim() === '') malformed += 1
  // A value that forgets var() around a custom property would resolve to a
  // literal string and render nothing.
  for (const mode of [value.light, value.dark]) {
    if (/^--[a-z0-9-]+$/i.test(mode.trim())) notWrapped += 1
  }
}
check(malformed === 0, `every token maps to a { light, dark } string pair (${malformed} malformed)`)
check(notWrapped === 0, `no token value is a bare custom-property name missing var() (${notWrapped})`)

const required = [
  '--dsw-alias-bg-base',
  '--dsw-alias-brand-primary',
  '--dsw-alias-state-business-primary',
  '--dsw-specific-sidebar-fill',
  '--dsw-static-neutral-bluish-950',
]
for (const name of required) {
  check(name in tokens, `overrides ${name}`)
}

// The shared corner scale carries 280 of DSH's border-radius declarations, so
// a regression here is a regression everywhere. Desktop uses 4/6/8/12/16/20px.
const RADIUS_SCALE = {
  '--dsw-radius-xs': 4,
  '--dsw-radius-sm': 6,
  '--dsw-radius-md': 8,
  '--dsw-radius-lg': 12,
  '--dsw-radius-xl': 16,
  '--dsw-radius-panel': 20,
}
for (const [name, expected] of Object.entries(RADIUS_SCALE)) {
  const value = tokens[name]?.dark ?? ''
  const px = Number.parseInt(value, 10)
  check(
    Number.isFinite(px) && px === expected,
    `${name} uses the Desktop scale (${expected}px, ${value})`,
  )
}

// The ramp retint is what carries the recolour, since the alias tier resolves
// through it. A missing ramp step would silently leave blue-tinted greys.
const RAMP_STEPS = ['00', '50', '75', '100', '150', '300', '500', '700', '850', '900', '950', '1000']
for (const step of RAMP_STEPS) {
  check(`--dsw-static-neutral-bluish-${step}` in tokens, `retints the warm ramp step ${step}`)
}

console.log('\nstylesheet')
check(appended.length === 1, `exactly one style tag appended (${appended.length})`)
const tag = appended[0]
check(tag?.tagName === 'STYLE', 'the appended node is a <style>')
check(tag?.dataset.plugin === 'dsh-claude-code-theme', `tag carries data-plugin (${tag?.dataset.plugin})`)
check(
  typeof tag?.dataset.pluginCss === 'string' && tag.dataset.pluginCss.endsWith('styles.css'),
  `tag carries data-plugin-css (${tag?.dataset.pluginCss})`,
)
const css = tag?.textContent ?? ''
check(css.length > 2000, `stylesheet has content (${css.length} chars)`)

// Brace balance catches a truncated or malformed sheet, which would silently
// swallow every later rule in the document.
let depth = 0
let unbalanced = false
for (const char of css) {
  if (char === '{') depth += 1
  else if (char === '}') {
    depth -= 1
    if (depth < 0) {
      unbalanced = true
      break
    }
  }
}
check(!unbalanced && depth === 0, `stylesheet braces balance (depth ${depth})`)

for (const needle of ['--cct-composer-radius', 'data-chat-flow-kind', 'data-composer-card', '[data-slot="sidebar"]']) {
  check(css.includes(needle), `stylesheet targets ${needle}`)
}

console.log('\ndispose')
effects[0]?.dispose()
check(tokenDisposed, 'disposing the effect removes the token layer')
check(tag?.removed === true, 'disposing the effect removes the style tag')

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
