module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    plugins: ['@typescript-eslint'],
    root: true,
    env: {
      node: true,
      es6: true,
    },
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
  };