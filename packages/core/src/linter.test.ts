import { describe, expect, it, vi } from "vitest";
import { ESLINT_SEVERITY } from "./constants";
import { filterResults, shouldIgnoreModule } from "./linter";
import type { ESLintLintResults, ESLintPluginOptions } from "./types";

describe("shouldIgnoreModule", () => {
  it("ignores virtual modules", async () => {
    const filter = () => true;
    const eslintInstance = { isPathIgnored: vi.fn() };
    // null-byte prefixed (\0-prefixed) modules
    expect(await shouldIgnoreModule("\0virtual:foo", filter as never)).toBe(
      true,
    );
    // virtual: scheme
    expect(await shouldIgnoreModule("virtual:foo", filter as never)).toBe(true);
    // no slash (e.g. bare names resolved as virtual)
    expect(await shouldIgnoreModule("bare-id", filter as never)).toBe(true);
    // virtual modules should not even consult eslint
    expect(eslintInstance.isPathIgnored).not.toHaveBeenCalled();
  });

  it("ignores paths excluded by the filter", async () => {
    const filter = () => false;
    expect(
      await shouldIgnoreModule("/src/foo.ts", filter as never, undefined),
    ).toBe(true);
  });

  it("ignores .vue/.svelte ?type=style submodules", async () => {
    const filter = () => true;
    expect(
      await shouldIgnoreModule(
        "/src/App.vue?type=style",
        filter as never,
        undefined,
      ),
    ).toBe(true);
    expect(
      await shouldIgnoreModule(
        "/src/Comp.svelte?type=style",
        filter as never,
        undefined,
      ),
    ).toBe(true);
  });

  it("does not ignore normal .ts files when eslint does not ignore them", async () => {
    const filter = () => true;
    const eslintInstance = { isPathIgnored: vi.fn().mockResolvedValue(false) };
    expect(
      await shouldIgnoreModule(
        "/src/foo.ts",
        filter as never,
        eslintInstance as never,
      ),
    ).toBe(false);
    expect(eslintInstance.isPathIgnored).toHaveBeenCalledWith("/src/foo.ts");
  });
});

const baseOptions: Pick<
  ESLintPluginOptions,
  "emitError" | "emitWarning" | "emitErrorAsWarning" | "emitWarningAsError"
> = {
  emitError: true,
  emitWarning: true,
  emitErrorAsWarning: false,
  emitWarningAsError: false,
};

const makeResult = (overrides: Partial<ESLintLintResults[number]> = {}) =>
  ({
    filePath: "/src/foo.ts",
    messages: [],
    suppressedMessages: [],
    errorCount: 0,
    fatalErrorCount: 0,
    warningCount: 0,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    ...overrides,
  }) as ESLintLintResults[number];

// Minimal LintMessage with the fields filterResults actually inspects.
const errorMsg = {
  severity: ESLINT_SEVERITY.ERROR,
  message: "e",
  line: 1,
  column: 1,
  ruleId: "test/no-error",
} as ESLintLintResults[number]["messages"][number];
const warningMsg = {
  severity: ESLINT_SEVERITY.WARNING,
  message: "w",
  line: 1,
  column: 1,
  ruleId: "test/no-warn",
} as ESLintLintResults[number]["messages"][number];

describe("filterResults", () => {
  it("filters out error-only results when emitError is false", () => {
    const results: ESLintLintResults = [
      makeResult({ messages: [errorMsg], errorCount: 1 }),
    ];
    const { results: filtered } = filterResults(results, {
      ...baseOptions,
      emitError: false,
    } as ESLintPluginOptions);
    // removing errors drops errorCount to 0, so filterESLintLintResults drops it
    expect(filtered).toHaveLength(0);
  });

  it("filters out warning-only results when emitWarning is false", () => {
    const results: ESLintLintResults = [
      makeResult({ messages: [warningMsg], warningCount: 1 }),
    ];
    const { results: filtered } = filterResults(results, {
      ...baseOptions,
      emitWarning: false,
    } as ESLintPluginOptions);
    expect(filtered).toHaveLength(0);
  });

  it("returns textType 'error' when results have errors", () => {
    const results: ESLintLintResults = [
      makeResult({ messages: [errorMsg], errorCount: 1 }),
    ];
    const { textType } = filterResults(
      results,
      baseOptions as ESLintPluginOptions,
    );
    expect(textType).toBe("error");
  });

  it("returns textType 'warning' when emitErrorAsWarning flips errors", () => {
    const results: ESLintLintResults = [
      makeResult({ messages: [errorMsg], errorCount: 1 }),
    ];
    const { textType } = filterResults(results, {
      ...baseOptions,
      emitErrorAsWarning: true,
    } as ESLintPluginOptions);
    expect(textType).toBe("warning");
  });

  it("returns textType 'warning' for warning-only results", () => {
    const results: ESLintLintResults = [
      makeResult({ messages: [warningMsg], warningCount: 1 }),
    ];
    const { textType } = filterResults(
      results,
      baseOptions as ESLintPluginOptions,
    );
    expect(textType).toBe("warning");
  });

  it("returns textType 'error' when emitWarningAsError flips warnings", () => {
    const results: ESLintLintResults = [
      makeResult({ messages: [warningMsg], warningCount: 1 }),
    ];
    const { textType } = filterResults(results, {
      ...baseOptions,
      emitWarningAsError: true,
    } as ESLintPluginOptions);
    expect(textType).toBe("error");
  });
});
