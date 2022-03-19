import path from 'path';
import type { ESLint } from 'eslint';

export interface Options {
  /** Path to ESLint instance that will be used for linting */
  eslintPath?: string;
  /** The cache is enabled by default to decrease execution time */
  cache?: boolean;
  /** Path to a file or directory for the cache location */
  cacheLocation?: string;
  /** auto fix source code */
  fix?: boolean;
  /** A single file, or array of files, to include when linting */
  include?: string | string[] | RegExp;
  /** A single file, or array of files, to exclude when linting */
  exclude?: string | string[] | RegExp;
  /** Custom error formatter or the name of a built-in formatter */
  formatter?: ESLint.Formatter | string;
  /** The warnings found will be emitted */
  throwOnWarning?: boolean;
  /** The errors found will be emitted */
  throwOnError?: boolean;
}

export function normalizePath(id: string): string {
  return path
    .relative(process.cwd(), id)
    .split('?')[0]
    .split(path.sep)
    .join('/');
}
