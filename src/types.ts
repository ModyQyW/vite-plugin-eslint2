import { createFilter } from '@rollup/pluginutils';
import type { ESLint } from 'eslint';
import type { PluginContext } from 'rollup';

export type FilterPattern = string | string[];
export type Filter = ReturnType<typeof createFilter>;

export interface ESLintPluginOptions extends ESLint.Options {
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
export type ESLintPluginUserOptions = Partial<ESLintPluginOptions>;

export type ESLintInstance = ESLint;
export type ESLintOptions = ESLint.Options;
export type ESLintFormatter = ESLint.Formatter;
export type ESLintOutputFixes = typeof ESLint.outputFixes;
export type ESLintLintResult = ESLint.LintResult;
export type ESLintLintResults = ESLintLintResult[];

export type LintFiles = (ctx: PluginContext, files: FilterPattern) => Promise<void>;
