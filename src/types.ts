import { createFilter } from '@rollup/pluginutils';
import type * as ESLint from 'eslint';
import type * as Rollup from 'rollup';

export type FilterPattern = string | string[];
export type Filter = ReturnType<typeof createFilter>;

export interface ESLintPluginOptions extends ESLint.ESLint.Options {
  cache: boolean;
  cacheLocation: string;
  include: FilterPattern;
  exclude: FilterPattern;
  eslintPath: string;
  formatter: string;
  lintOnStart: boolean;
  emitError: boolean;
  emitErrorAsWarning: boolean;
  emitWarning: boolean;
  emitWarningAsError: boolean;
}
export interface ESLintPluginUserOptions extends Partial<ESLintPluginOptions> {
  dev?: boolean;
  build?: boolean;
}

export type ESLintInstance = ESLint.ESLint;
export type ESLintConstructorOptions = ESLint.ESLint.Options;
export type ESLintFormatter = ESLint.ESLint.Formatter;
export type ESLintOutputFixes = typeof ESLint.ESLint.outputFixes;
export type ESLintLintResult = ESLint.ESLint.LintResult;
export type ESLintLintResults = ESLintLintResult[];

export type LintFiles = (ctx: Rollup.PluginContext, files: FilterPattern) => Promise<void>;