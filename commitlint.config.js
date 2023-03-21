module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: ['workspace-scopes'],
  rules: {
    scopeEnum: [2, 'always', []],
  },
};
