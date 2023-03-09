module.exports = {
  'package.json': 'sort-package-json',
  '*.md': 'markdownlint --fix --ignore=CHANGELOG.md --ignore-path=.gitignore',
  './src/*.{js,cjs,mjs,ts,cts,mts}': 'eslint --fix --cache --ignore-path=.gitignore',
};
