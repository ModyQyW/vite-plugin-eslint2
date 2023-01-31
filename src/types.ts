import type * as ESLint from 'eslint';
import type * as Rollup from 'rollup';
import type { CreateFilter } from '@rollup/pluginutils';

export type FilterPattern = string | string[];
export type Filter = ReturnType<CreateFilter>;

export interface ESLintPluginOptions extends ESLint.ESLint.Options {
  dev: boolean;
  build: boolean;
  cache: boolean;
  cacheLocation: string;
  include: FilterPattern;
  exclude: FilterPattern;
  eslintPath: string;
  formatter: string;
  lintInWorker: boolean;
  lintOnStart: boolean;
  chokidar: boolean;
  emitError: boolean;
  emitErrorAsWarning: boolean;
  emitWarning: boolean;
  emitWarningAsError: boolean;
}
export type ESLintPluginUserOptions = Partial<ESLintPluginOptions>;

export type ESLintInstance = ESLint.ESLint;
export type ESLintConstructorOptions = ESLint.ESLint.Options;
export type ESLintFormatter = ESLint.ESLint.Formatter;
export type ESLintOutputFixes = typeof ESLint.ESLint.outputFixes;
export type ESLintLintResult = ESLint.ESLint.LintResult;
export type ESLintLintResults = ESLintLintResult[];

export type LintFiles = (files: FilterPattern, context?: Rollup.PluginContext) => Promise<void>;

export type TextType = 'error' | 'warning' | 'plugin';
