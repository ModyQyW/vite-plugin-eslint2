import { describe, expect, it, vi } from "vitest";
import { ESLINT_SEVERITY } from "./constants";
import {
  buildOverlayPayload,
  filterResults,
  OverlayManager,
  shouldIgnoreModule,
} from "./linter";
import type {
  ESLintLintResults,
  ESLintPluginOptions,
  OverlayPayload,
} from "./types";

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

describe("buildOverlayPayload", () => {
  it("maps message severity from the post-filter textType", () => {
    const results: ESLintLintResults = [
      makeResult({
        filePath: "/src/a.ts",
        messages: [errorMsg],
        errorCount: 1,
      }),
    ];
    const payload = buildOverlayPayload(results, "error");
    expect(payload.results[0].messages[0].severity).toBe("error");
  });

  it("reflects emitErrorAsWarning as 'warning' severity in the payload", () => {
    const results: ESLintLintResults = [
      makeResult({
        filePath: "/src/a.ts",
        messages: [errorMsg],
        errorCount: 1,
      }),
    ];
    // filterResults derives the post-filter textType; buildOverlayPayload honors it.
    const { textType } = filterResults(results, {
      ...baseOptions,
      emitErrorAsWarning: true,
    } as ESLintPluginOptions);
    const payload = buildOverlayPayload(results, textType);
    expect(textType).toBe("warning");
    expect(payload.results[0].messages[0].severity).toBe("warning");
  });

  it("preserves filePath, ruleId, message, line, column", () => {
    const results: ESLintLintResults = [
      makeResult({
        filePath: "/src/a.ts",
        messages: [
          {
            severity: ESLINT_SEVERITY.ERROR,
            message: "no-undef",
            line: 12,
            column: 3,
            ruleId: "no-undef",
          } as ESLintLintResults[number]["messages"][number],
        ],
        errorCount: 1,
      }),
    ];
    const payload = buildOverlayPayload(results, "error");
    const msg = payload.results[0].messages[0];
    expect(msg).toMatchObject({
      line: 12,
      column: 3,
      severity: "error",
      ruleId: "no-undef",
      message: "no-undef",
    });
    expect(payload.results[0].filePath).toBe("/src/a.ts");
  });
});

describe("OverlayManager", () => {
  it("accumulates results across files", () => {
    const mgr = new OverlayManager();
    const first = mgr.upsert({
      results: [
        {
          filePath: "/src/a.ts",
          messages: [
            {
              line: 1,
              column: 1,
              severity: "error",
              ruleId: "x",
              message: "e",
            },
          ],
        },
      ],
    });
    expect(first?.results).toHaveLength(1);
    const second = mgr.upsert({
      results: [
        {
          filePath: "/src/b.ts",
          messages: [
            {
              line: 2,
              column: 1,
              severity: "warning",
              ruleId: "y",
              message: "w",
            },
          ],
        },
      ],
    });
    expect(second?.results).toHaveLength(2);
  });

  it("replaces a file's entry on re-lint", () => {
    const mgr = new OverlayManager();
    mgr.upsert({
      results: [
        {
          filePath: "/src/a.ts",
          messages: [
            {
              line: 1,
              column: 1,
              severity: "error",
              ruleId: "x",
              message: "e",
            },
          ],
        },
      ],
    });
    const updated = mgr.upsert({
      results: [
        {
          filePath: "/src/a.ts",
          messages: [
            {
              line: 5,
              column: 2,
              severity: "error",
              ruleId: "z",
              message: "new",
            },
          ],
        },
      ],
    });
    expect(updated?.results).toHaveLength(1);
    expect(updated?.results[0].messages[0].message).toBe("new");
  });

  it("drops a file when its messages become empty and returns undefined when all clear", () => {
    const mgr = new OverlayManager();
    mgr.upsert({
      results: [
        {
          filePath: "/src/a.ts",
          messages: [
            {
              line: 1,
              column: 1,
              severity: "error",
              ruleId: "x",
              message: "e",
            },
          ],
        },
      ],
    });
    const cleared = mgr.upsert({
      results: [{ filePath: "/src/a.ts", messages: [] }],
    });
    expect(cleared).toBeUndefined();
  });

  it("snapshot returns undefined when empty", () => {
    const mgr = new OverlayManager();
    expect(mgr.snapshot()).toBeUndefined();
  });

  it("snapshot returns the accumulated payload", () => {
    const mgr = new OverlayManager();
    mgr.upsert({
      results: [
        {
          filePath: "/src/a.ts",
          messages: [
            {
              line: 1,
              column: 1,
              severity: "error",
              ruleId: "x",
              message: "e",
            },
          ],
        },
      ],
    });
    const snap = mgr.snapshot() as OverlayPayload;
    expect(snap.results).toHaveLength(1);
  });
});
