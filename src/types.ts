import type * as ESLint from 'eslint';

export type FilterPattern = string | string[];

export interface ESLintPluginOptions extends ESLint.ESLint.Options {
  cache?: boolean;
  cacheLocation?: string;
  include?: FilterPattern;
  exclude?: FilterPattern;
  eslintPath?: string;
  formatter?: string;
  lintOnStart?: boolean;
  emitError?: boolean;
  emitErrorAsWarning?: boolean;
  emitWarning?: boolean;
  emitWarningAsError?: boolean;
}
