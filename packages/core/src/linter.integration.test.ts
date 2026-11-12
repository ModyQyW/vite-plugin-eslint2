import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { normalizePath } from "@rollup/pluginutils";
import { afterEach, describe, expect, it } from "vitest";
import { createLinter } from "./linter";
import type { OverlayPayload } from "./types";
import { getOptions } from "./utils";

// These tests run the installed ESLint for real, against a throwaway project.
// They are what catches an ESLint major changing the constructor, `lintFiles`
// or the shape of `LintMessage`; the unit tests only cover our own logic.
//
// Ids go through `normalizePath`, which is the form Vite hands to `transform`.
// `shouldIgnoreModule` treats an id without a `/` as a virtual module, so a raw
// Windows path would be skipped and the test would prove nothing.

const createdDirs: string[] = [];

const makeProject = async (files: Record<string, string>) => {
  const dir = await mkdtemp(path.join(tmpdir(), "vite-plugin-eslint2-"));
  createdDirs.push(dir);
  await Promise.all(
    Object.entries(files).map(async ([name, content]) => {
      const filePath = path.join(dir, name);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, content);
    }),
  );
  return dir;
};

const baseProject = {
  "eslint.config.mjs":
    "export default [{ rules: { 'no-unused-vars': 'error' } }];\n",
  "src/a.js": "const unusedValue = 1;\n",
};

afterEach(async () => {
  await Promise.all(
    createdDirs.map((dir) => rm(dir, { recursive: true, force: true })),
  );
  createdDirs.length = 0;
});

describe("createLinter integration", () => {
  it("reports a real ESLint error through the emit adapter", async () => {
    const dir = await makeProject(baseProject);
    const emitted: string[] = [];
    const linter = createLinter(
      getOptions({
        cwd: dir,
        include: [normalizePath(path.join(dir, "src/**/*.js"))],
      }),
      { emit: ({ formattedText }) => emitted.push(formattedText) },
    );

    await linter.lint(normalizePath(path.join(dir, "src/a.js")));

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toContain("no-unused-vars");
    expect(normalizePath(emitted[0])).toContain("src/a.js");
  });

  it("pushes a structured payload built from real ESLint results", async () => {
    const dir = await makeProject(baseProject);
    const payloads: (OverlayPayload | undefined)[] = [];
    const linter = createLinter(
      getOptions({
        cwd: dir,
        include: [normalizePath(path.join(dir, "src/**/*.js"))],
      }),
      {
        onOverlayPayload: (nextPayload) => payloads.push(nextPayload),
      },
    );

    await linter.lint(normalizePath(path.join(dir, "src/a.js")));

    const [payload] = payloads;
    expect(payload).toBeDefined();
    expect(payload?.results).toHaveLength(1);
    const [result] = payload?.results ?? [];
    expect(normalizePath(result?.filePath ?? "")).toBe(
      normalizePath(path.join(dir, "src/a.js")),
    );
    const [message] = result?.messages ?? [];
    expect(message).toMatchObject({
      line: 1,
      severity: "error",
      ruleId: "no-unused-vars",
    });
  });

  it("skips files outside include without consulting ESLint", async () => {
    const dir = await makeProject({
      ...baseProject,
      "other/b.js": "const anotherUnused = 1;\n",
    });
    const emitted: string[] = [];
    const linter = createLinter(
      getOptions({
        cwd: dir,
        include: [normalizePath(path.join(dir, "src/**/*.js"))],
      }),
      { emit: ({ formattedText }) => emitted.push(formattedText) },
    );

    await linter.lint(normalizePath(path.join(dir, "other/b.js")));

    expect(emitted).toHaveLength(0);
  });
});
