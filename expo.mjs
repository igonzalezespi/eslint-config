import expo from 'eslint-config-expo/flat.js';
import prettier from 'eslint-config-prettier';

/**
 * Studio ESLint config for Expo / React-Native apps.
 *
 * Composes `eslint-config-expo` (React Native + React Hooks + TS rules) and
 * Prettier. It intentionally does NOT spread the studio `base` preset: Expo's
 * flat config already registers the typescript-eslint / react / react-native
 * plugins, and spreading our base on top would trigger ESLint's
 * "plugin redefined" conflict. Consumers add their own `no-restricted-imports`
 * / boundary blocks after this spread.
 */
export default [
  ...expo,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }]
    }
  },
  prettier
];
