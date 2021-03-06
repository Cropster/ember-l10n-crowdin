module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'script'
  },

  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:prettier/recommended'
  ],
  env: {
    browser: false,
    node: true
  },
  rules: {},
  overrides: [
    {
      files: ['node-tests/**/*-test.js'],
      env: {
        browser: false,
        node: true,
        mocha: true
      }
    }
  ]
};
