// Regole di lint (npm run lint). Soprattutto react-hooks/exhaustive-deps.
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
    // `fetchpriority` minuscolo voluto: in React 18 passa al DOM così. Rivedere con React 19.
    'react/no-unknown-property': ['error', { ignore: ['fetchpriority'] }],
    // `role="group"` focusabile ammesso: serve allo sketchbook da tastiera.
    'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: [], roles: ['group'] }],
  },
  overrides: [
    {
      // Script e test girano in Node e non finiscono nel bundle.
      files: ['scripts/**/*.js', 'tests/**/*.js', '*.config.js', '.eslintrc.cjs'],
      env: { node: true, browser: false },
      // Client WebSocket integrato in Node (dalla 22): lo usa
      // controlla-hydration.js per parlare col browser. `env: node` di ESLint 8
      // è fermo a prima e non lo conosce.
      globals: { WebSocket: 'readonly' },
      rules: { 'no-console': 'off' },
    },
  ],
  ignorePatterns: ['dist', 'dist-ssr', 'node_modules', 'src/data/fotoFit.js'],
}
