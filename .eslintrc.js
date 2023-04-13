const path = require("path");

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['turbo', 'prettier'],
  plugins: ['@typescript-eslint', 'unused-imports', 'prettier', 'import'],
  rules: {
    'turbo/no-undeclared-env-vars': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    'no-multi-spaces': ['error'],
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'import/no-duplicates': ['error'],
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
      },
    ],
  },
  parserOptions: {
    project: path.resolve(__dirname, "./tsconfig.json"),
  },
};
