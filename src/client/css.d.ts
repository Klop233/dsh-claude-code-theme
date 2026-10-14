/**
 * Ambient declaration for the plain-CSS loader in `tsdown.config.ts`.
 *
 * The build turns a `.css` import into a module whose default export is the
 * stylesheet source, which the client half injects as a plugin-owned `<style>`
 * tag.
 */
declare module '*.css' {
  const stylesheet: string
  export default stylesheet
}
