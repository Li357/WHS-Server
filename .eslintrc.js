module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'function-paren-newline': 'off',
    'object-shorthand': ['error', 'always', { avoidQuotes: false }],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
