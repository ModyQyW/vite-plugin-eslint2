module.exports = {
  git: {
    commitMessage: 'chore(release): v${version}',
    tagName: 'v${version}',
  },
  plugins: {
    '@release-it/conventional-changelog': {
      header: '# Changelog',
      preset: 'conventionalcommits',
    },
  },
  npm: {
    publish: false,
  },
  hooks: {
    'before:init': 'pnpm install && pnpm run lint',
  },
};
