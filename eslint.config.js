// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const boundariesPlugin = require('eslint-plugin-boundaries');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  // TypeScript naming conventions
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        // PascalCase for React components (tsx files with function declarations)
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        // camelCase for variables
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        // PascalCase for types and interfaces
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
    },
  },
  // Feature boundaries
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      boundaries: boundariesPlugin,
    },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/*' },
        { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'component', pattern: 'src/components/*' },
        { type: 'store', pattern: 'src/stores/*' },
        { type: 'hook', pattern: 'src/hooks/*' },
        { type: 'util', pattern: 'src/utils/*' },
        { type: 'constant', pattern: 'src/constants/*' },
        { type: 'type', pattern: 'src/types/*' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // App can import from anything
            { from: 'app', allow: ['feature', 'component', 'store', 'hook', 'util', 'constant', 'type'] },
            // Features can import from shared modules and their own internals
            { from: 'feature', allow: ['component', 'store', 'hook', 'util', 'constant', 'type'] },
            // Features can import from other features only via index.ts
            {
              from: 'feature',
              allow: [['feature', { feature: '!${feature}' }]],
            },
            // Shared modules can import from other shared modules
            { from: 'component', allow: ['hook', 'util', 'constant', 'type'] },
            { from: 'store', allow: ['util', 'constant', 'type'] },
            { from: 'hook', allow: ['store', 'util', 'constant', 'type'] },
            { from: 'util', allow: ['constant', 'type'] },
            { from: 'constant', allow: ['type'] },
          ],
        },
      ],
    },
  },
]);
