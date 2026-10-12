import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const SLICE_LAYERS = ['pages', 'widgets', 'features', 'entities'];

const slices = (...types) => ({
  to: { element: { type: types, fileInternalPath: 'index.ts' } },
});

const shared = { to: { element: { type: 'shared' } } };

const layer = (type, allow) => ({ from: { element: { type } }, allow });

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'react-hooks': reactHooks, boundaries },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.app.json' },
      },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'pages', pattern: 'src/pages/*', capture: ['slice'] },
        { type: 'widgets', pattern: 'src/widgets/*', capture: ['slice'] },
        { type: 'features', pattern: 'src/features/*', capture: ['slice'] },
        { type: 'entities', pattern: 'src/entities/*', capture: ['slice'] },
        { type: 'shared', pattern: 'src/shared/*', capture: ['segment'] },
      ],
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],

      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            layer('app', [slices(...SLICE_LAYERS), shared]),
            layer('pages', [slices('widgets', 'features', 'entities'), shared]),
            layer('widgets', [slices('features', 'entities'), shared]),
            layer('features', [slices('entities'), shared]),
            layer('entities', [slices('entities'), shared]),
            layer('shared', [shared]),
          ],
        },
      ],
    },
  },
  {
    files: ['server/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.strictTypeChecked],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    extends: [js.configs.recommended, tseslint.configs.strictTypeChecked],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: { '@typescript-eslint/consistent-type-imports': 'error' },
  },
  prettier,
]);
