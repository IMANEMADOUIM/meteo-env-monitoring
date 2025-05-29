module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['coverage/', '*.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'prettier', '@typescript-eslint'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: true },
    ],
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
};
