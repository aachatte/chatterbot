import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'

const browserGlobals = {
  __dirname: 'readonly',
  alert: 'readonly',
  confirm: 'readonly',
  console: 'readonly',
  document: 'readonly',
  describe: 'readonly',
  expect: 'readonly',
  fetch: 'readonly',
  FormData: 'readonly',
  it: 'readonly',
  localStorage: 'readonly',
  navigator: 'readonly',
  process: 'readonly',
  requestAnimationFrame: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  URLSearchParams: 'readonly',
  window: 'readonly',
}

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'storybook-static/**',
    ],
  },
  js.configs.recommended,
  {
    files: [
      '*.{js,jsx,ts,tsx,cjs}',
      'src/**/*.{js,jsx,ts,tsx}',
      '.storybook/**/*.{js,jsx,ts,tsx}',
      'tests/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: browserGlobals,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'react/no-unescaped-entities': 'off',
      'jsx-a11y/control-has-associated-label': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  prettier,
]
