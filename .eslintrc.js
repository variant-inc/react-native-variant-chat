module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  ignorePatterns: ['node_modules', '.eslintrc.js'],
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/eslint-recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'react-native/no-inline-styles': 'off',
    'prettier/prettier': 'warn',
    'prefer-const': 'error',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/ban-ts-comment': 'off',
  },
  plugins: ['prettier', 'jest', 'detox', '@typescript-eslint', 'sonarjs'],
  env: {
    'jest/globals': true,
  },
};
