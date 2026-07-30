import { describe, expect, it } from "vitest";

import {
  createInitialState,
  sourceEditorReducer,
  tabKey,
  type EditorTab
} from "./tab-state.js";

function tab(partial: Partial<EditorTab> & Pick<EditorTab, "relativePath">): EditorTab {
  const workspaceId = partial.workspaceId ?? "1";
  const repositoryId = partial.repositoryId ?? "2";
  const relativePath = partial.relativePath;
  const content = partial.bufferContent ?? "hello\n";
  return {
    key: tabKey(workspaceId, repositoryId, relativePath),
    workspaceId,
    repositoryId,
    relativePath,
    language: "typescriptreact",
    loadedSha256: "a".repeat(64),
    savedSha256: "a".repeat(64),
    serverContent: content,
    bufferContent: content,
    dirty: false,
    conflict: false,
    readOnly: false,
    ...partial
  };
}

describe("sourceEditorReducer", () => {
  it("opens tabs with stable keys and independent buffers", () => {
    let state = createInitialState();
    const a = tab({ relativePath: "src/a.tsx" });
    const b = tab({ relativePath: "src/b.tsx", bufferContent: "b\n", serverContent: "b\n" });
    state = sourceEditorReducer(state, { type: "open_tab", tab: a });
    state = sourceEditorReducer(state, { type: "open_tab", tab: b });
    expect(state.tabs).toHaveLength(2);
    state = sourceEditorReducer(state, { type: "set_buffer", key: a.key, content: "changed\n" });
    expect(state.tabs.find((t) => t.key === a.key)?.dirty).toBe(true);
    expect(state.tabs.find((t) => t.key === b.key)?.dirty).toBe(false);
  });

  it("marks conflict without overwriting local buffer", () => {
    let state = createInitialState();
    const a = tab({ relativePath: "src/a.tsx", bufferContent: "local\n", serverContent: "base\n", dirty: true });
    state = sourceEditorReducer(state, { type: "open_tab", tab: a });
    state = sourceEditorReducer(state, {
      type: "mark_conflict",
      key: a.key,
      serverContent: "server\n",
      serverSha256: "b".repeat(64)
    });
    const active = state.tabs[0];
    expect(active?.conflict).toBe(true);
    expect(active?.bufferContent).toBe("local\n");
    expect(active?.conflictServerContent).toBe("server\n");
  });

  it("close_saved keeps dirty tabs", () => {
    let state = createInitialState();
    const clean = tab({ relativePath: "clean.tsx" });
    const dirty = tab({
      relativePath: "dirty.tsx",
      bufferContent: "x\n",
      serverContent: "y\n",
      dirty: true
    });
    state = sourceEditorReducer(state, { type: "open_tab", tab: clean });
    state = sourceEditorReducer(state, { type: "open_tab", tab: dirty });
    state = sourceEditorReducer(state, { type: "close_saved" });
    expect(state.tabs.map((t) => t.relativePath)).toEqual(["dirty.tsx"]);
  });
});
