// @ts-check

/**
 * @type {import('lint-staged').Config}
 */
const config = {
  '*.?(c|m){js,ts}?(x)': ['prettier --write', 'eslint --quiet --fix'],
  '*.{css,md,json}': ['prettier --write'],
};

module.exports = config;
