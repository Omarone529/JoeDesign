import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  { ignores: ['dist', 'dist-ssr', 'node_modules', 'src/data/fotoFit.js'] },
  { files: ['**/*.{js,jsx}'] }, // senza, ESLint 9 salta i .jsx in silenzio
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        __ANNO_BUILD__: 'readonly', // inlineata da Vite
        process: 'readonly', // seo.js lo legge con la guardia `typeof process`
      },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/no-unescaped-entities': 'off', // testi pieni di apostrofi
      'react/prop-types': 'off',
      // `fetchpriority` minuscolo: in React 18 passa al DOM così.
      'react/no-unknown-property': ['error', { ignore: ['fetchpriority'] }],
      // Lo sketchbook è un `role="group"` focusabile.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: [], roles: ['group'] }],
    },
  },
  {
    files: ['scripts/**/*.js', 'tests/**/*.js', '*.config.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'off' },
  },
]
