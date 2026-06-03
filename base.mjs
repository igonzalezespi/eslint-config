import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Studio shared flat ESLint base config.
 *
 * Pipeline (order matters): JS recommended → typescript-eslint recommended →
 * security recommended → sonarjs recommended → sonarjs tuning → prettier
 * (disables stylistic rules so Prettier owns formatting) → TS rule layer.
 *
 * This base intentionally does NOT encode any repo-specific boundary policy
 * (workspace aliases, internal/ restrictions, etc.). Each consumer composes
 * its own `no-restricted-imports` / `no-restricted-syntax` blocks on top.
 */
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/coverage/**',
      '.claude/**',
      '.spec-gen/**',
      'plop-templates/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  sonarjs.configs.recommended,
  {
    // sonarjs overrides — applied globally after recommended config
    rules: {
      // keep cognitive-complexity + no-identical-functions
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-identical-functions': 'warn',
      // Disable security rules that overlap with eslint-plugin-security
      'sonarjs/publicly-writable-directories': 'off',
      'sonarjs/no-clear-text-protocols': 'off',
      'sonarjs/no-hardcoded-ip': 'off',
      'sonarjs/no-hardcoded-passwords': 'off',
      'sonarjs/no-hardcoded-secrets': 'off',
      'sonarjs/hardcoded-secret-signatures': 'off',
      'sonarjs/os-command': 'off',
      'sonarjs/no-os-command-from-path': 'off',
      'sonarjs/code-eval': 'off',
      'sonarjs/pseudo-random': 'off',
      // Disable style-opinion rules too aggressive for general use
      'sonarjs/public-static-readonly': 'off',
      'sonarjs/void-use': 'off',
      'sonarjs/no-nested-template-literals': 'off',
      'sonarjs/single-character-alternation': 'off',
      'sonarjs/concise-regex': 'off',
      'sonarjs/regex-complexity': 'off',
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/assertions-in-tests': 'off',
      // Downgrade to warnings
      'sonarjs/slow-regex': 'warn',
      'sonarjs/no-nested-conditional': 'warn'
    }
  },
  prettier,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { jsdoc },
    rules: {
      'no-undef': 'off',
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: false,
            ClassDeclaration: false,
            ClassExpression: false,
            FunctionExpression: false,
            ArrowFunctionExpression: false,
            MethodDefinition: false
          },
          checkConstructors: false,
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration',
            'ExportNamedDeclaration > ClassDeclaration'
          ]
        }
      ],
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-tag-names': ['error', { typed: true }],
      'jsdoc/require-param': ['warn', { checkDestructured: false }],
      'jsdoc/require-returns': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
      ],
      // Allow `interface X extends Y {}`: used for module augmentation.
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' }
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 10
        }
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'debug'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      complexity: ['warn', 20],
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-child-process': 'warn',
      'security/detect-object-injection': 'off'
    }
  },
  {
    // Test files — relax security + complexity heuristics that fight test code.
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
      'sonarjs/cognitive-complexity': 'off'
    }
  },
  {
    // Dev scripts — console, fs, and Node globals are expected.
    files: ['scripts/**/*.ts', 'scripts/**/*.mjs', 'plopfile.mjs'],
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-object-injection': 'off'
    }
  },
  {
    // CommonJS files (`.cjs`) — ESLint defaults to ESM parsing under flat config,
    // which fires `no-undef` on CJS wrapper globals (module, require, exports,
    // __dirname, __filename) and on Node runtime globals (Buffer, process, etc.).
    // `globals.node` is the superset: CJS wrappers + Node builtins.
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    }
  }
);
