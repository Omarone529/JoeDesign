/*
 * Regole di lint. Serve soprattutto `react-hooks/exhaustive-deps`: le
 * dipendenze mancanti negli effetti sono la classe di bug React più difficile
 * da vedere a occhio, e nel progetto ci sono una quindicina di hook.
 *
 *   npm run lint
 */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: 'detect' } },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime', // niente `import React` con il transform nuovo
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  globals: {
    __ANNO_BUILD__: 'readonly', // costante inlineata da Vite (vedi vite.config.js)
    // `seo.js` gira sia nel browser sia in SSR e legge le env con la guardia
    // `typeof process !== 'undefined'`: qui basta dichiararlo.
    process: 'readonly',
  },
  rules: {
    // I testi del sito sono in italiano e pieni di apostrofi: la regola
    // chiederebbe di sostituirli con entità, illeggibile nel sorgente.
    'react/no-unescaped-entities': 'off',
    // Nessun PropTypes in un progetto di questa dimensione.
    'react/prop-types': 'off',
    /*
     * `fetchpriority` minuscolo è VOLUTO. Con React 18 gli attributi
     * sconosciuti in minuscolo passano al DOM verbatim, e `fetchpriority` è
     * proprio il nome giusto dell'attributo HTML: verificato, arriva intatto
     * nelle pagine pre-renderizzate. La forma camelCase che la regola chiede
     * la capisce React 19. Da riaccendere se si aggiorna a React 19.
     */
    'react/no-unknown-property': ['error', { ignore: ['fetchpriority'] }],
    /*
     * Un `role="group"` focusabile è ammesso. Serve ai widget composti
     * disegnati a mano — lo sketchbook si sfoglia trascinando, e se non entra
     * nel giro del Tab da tastiera non si può usare per niente. La regola,
     * di suo, permette solo `tabpanel`.
     */
    'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: [], roles: ['group'] }],
  },
  overrides: [
    {
      // Script e test girano in Node e non finiscono nel bundle.
      files: ['scripts/**/*.js', 'tests/**/*.js', '*.config.js', '.eslintrc.cjs'],
      env: { node: true, browser: false },
      rules: { 'no-console': 'off' },
    },
  ],
  ignorePatterns: ['dist', 'dist-ssr', 'node_modules', 'src/data/fotoFit.js'],
}
