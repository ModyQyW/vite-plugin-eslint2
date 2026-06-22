import { describe, expect, it, vi } from "vitest";
import { shouldIgnoreModule } from "./linter";

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
