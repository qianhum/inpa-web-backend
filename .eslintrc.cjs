module.exports = {
  extends: [
    'airbnb-base',
  ],
  overrides: [
    {
      files: [
        '*.ts',
      ],
      extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
};
