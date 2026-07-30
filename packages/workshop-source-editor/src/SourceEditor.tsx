import { useCallback, useEffect, useMemo, useReducer, useState, type JSX } from "react";
import type { WorkshopClient } from "@om/workshop-sdk";
import type { WorkspaceFileTreeEntry } from "@om/workshop-contracts";
import * as MonacoReact from "@monaco-editor/react";
import { WorkshopSdkError } from "@om/workshop-sdk";

type MonacoEditorComponent = (props: {
  readonly height?: string;
  readonly language?: string;
  readonly value?: string;
  readonly path?: string;
  readonly onChange?: (value: string | undefined) => void;
  readonly options?: Record<string, unknown>;
}) => JSX.Element;

const Editor = (MonacoReact as unknown as { default: MonacoEditorComponent }).default;

import {
  anyDirty,
  createInitialState,
  sourceEditorReducer,
  tabKey,
  type EditorTab
} from "./EditorTabs/tab-state.js";

export type SourceEditorIdentity = {
  readonly systemKey: string;
  readonly repositoryKey: string;
  readonly branchOrRef: string;
  readonly baseCommit: string;
  readonly workspaceKey: string;
  readonly routeOrArtifact: string;
};

export type SourceEditorProps = {
  readonly client: WorkshopClient;
  readonly workspaceId: string;
  readonly repositoryId: string;
  readonly identity: SourceEditorIdentity;
  readonly initialPath?: string;
};

function languageToMonaco(language: string): string {
  switch (language) {
    case "typescriptreact":
      return "typescript";
    case "javascriptreact":
      return "javascript";
    default:
      return language;
  }
}

export function SourceEditor({
  client,
  workspaceId,
  repositoryId,
  identity,
  initialPath
}: SourceEditorProps) {
  const [state, dispatch] = useReducer(sourceEditorReducer, undefined, createInitialState);
  const [entries, setEntries] = useState<WorkspaceFileTreeEntry[]>([]);
  const [diffText, setDiffText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const active = useMemo(
    () => state.tabs.find((t) => t.key === state.activeKey) ?? null,
    [state.tabs, state.activeKey]
  );

  const refreshTree = useCallback(async () => {
    const tree = await client.listWorkspaceFiles(workspaceId, repositoryId, { depth: 8 });
    setEntries(tree.entries.filter((e) => e.kind === "file"));
    dispatch({ type: "set_workspace_dirty", dirty: tree.workspaceDirty });
  }, [client, repositoryId, workspaceId]);

  const openPath = useCallback(
    async (relativePath: string) => {
      setBusy(true);
      setStatus(null);
      try {
        const file = await client.getWorkspaceFile(workspaceId, repositoryId, relativePath);
        const next: EditorTab = {
          key: tabKey(workspaceId, repositoryId, file.relativePath),
          workspaceId,
          repositoryId,
          relativePath: file.relativePath,
          language: file.language,
          loadedSha256: file.contentSha256,
          savedSha256: file.contentSha256,
          serverContent: file.content,
          bufferContent: file.content,
          dirty: false,
          conflict: false,
          readOnly: file.readOnly
        };
        dispatch({ type: "open_tab", tab: next });
        dispatch({ type: "set_workspace_dirty", dirty: file.workspaceDirty });
        dispatch({ type: "set_preview_uses_saved", value: true });
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Failed to open file");
      } finally {
        setBusy(false);
      }
    },
    [client, repositoryId, workspaceId]
  );

  useEffect(() => {
    void refreshTree().catch((err: unknown) => {
      setStatus(err instanceof Error ? err.message : "Failed to load tree");
    });
  }, [refreshTree]);

  useEffect(() => {
    if (initialPath) {
      void openPath(initialPath);
    }
  }, [initialPath, openPath]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!anyDirty(state)) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [state]);

  const saveTab = async (tab: EditorTab) => {
    if (tab.readOnly) return;
    setBusy(true);
    setStatus(null);
    try {
      const result = await client.saveWorkspaceFile(workspaceId, repositoryId, {
        relativePath: tab.relativePath,
        expectedOriginalSha256: tab.loadedSha256,
        content: tab.bufferContent
      });
      dispatch({
        type: "mark_saved",
        key: tab.key,
        contentSha256: result.contentSha256,
        content: tab.bufferContent,
        workspaceDirty: result.workspaceDirty
      });
      await refreshTree();
    } catch (err) {
      if (err instanceof WorkshopSdkError && err.code === "SOURCE_CHANGED") {
        const server = await client.getWorkspaceFile(workspaceId, repositoryId, tab.relativePath);
        dispatch({
          type: "mark_conflict",
          key: tab.key,
          serverContent: server.content,
          serverSha256: server.contentSha256
        });
        setStatus("SOURCE_CHANGED — resolve conflict before saving");
      } else {
        setStatus(err instanceof Error ? err.message : "Save failed");
      }
    } finally {
      setBusy(false);
    }
  };

  const saveAll = async () => {
    for (const tab of state.tabs.filter((t) => t.dirty && !t.readOnly)) {
      await saveTab(tab);
    }
  };

  const revertActive = async () => {
    if (!active || active.readOnly) return;
    if (!window.confirm(`Revert ${active.relativePath} to repository HEAD?`)) return;
    setBusy(true);
    try {
      const file = await client.revertWorkspaceFile(workspaceId, repositoryId, {
        relativePath: active.relativePath,
        expectedOriginalSha256: active.loadedSha256,
        target: "repository_head"
      });
      dispatch({
        type: "mark_saved",
        key: active.key,
        contentSha256: file.contentSha256,
        content: file.content,
        workspaceDirty: file.workspaceDirty
      });
      await refreshTree();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Revert failed");
    } finally {
      setBusy(false);
    }
  };

  const loadDiff = async () => {
    if (!active) return;
    try {
      const diff = await client.getWorkspaceFileDiff(
        workspaceId,
        repositoryId,
        active.relativePath
      );
      setDiffText(diff.unifiedDiff || "(no diff)");
      dispatch({ type: "set_panel", panel: "diff" });
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Diff failed");
    }
  };

  const filtered = entries.filter((e) =>
    e.relativePath.toLowerCase().includes(state.treeFilter.toLowerCase())
  );

  return (
    <div className="om-source-editor" data-testid="om-source-editor">
      <header className="om-source-editor__identity" aria-label="Source identity">
        <div>
          <strong>System</strong>
          {identity.systemKey}
        </div>
        <div>
          <strong>Repository</strong>
          {identity.repositoryKey}
        </div>
        <div>
          <strong>Branch / ref</strong>
          {identity.branchOrRef}
        </div>
        <div>
          <strong>Base commit</strong>
          <code>{identity.baseCommit.slice(0, 12)}</code>
        </div>
        <div>
          <strong>Workspace</strong>
          {identity.workspaceKey}
        </div>
        <div>
          <strong>Route / artifact</strong>
          {identity.routeOrArtifact}
        </div>
        <div>
          <strong>Writable</strong>
          <span className="om-source-editor__badge">
            {active?.readOnly ? "read-only" : "writable"}
          </span>
        </div>
        <div>
          <strong>Workspace dirty</strong>
          <span
            className={`om-source-editor__badge ${state.workspaceDirty ? "om-source-editor__badge--warn" : "om-source-editor__badge--ok"}`}
          >
            {state.workspaceDirty ? "dirty" : "clean"}
          </span>
        </div>
        <div>
          <strong>Preview</strong>
          <span
            className={`om-source-editor__badge ${state.previewUsesSaved ? "om-source-editor__badge--ok" : "om-source-editor__badge--warn"}`}
          >
            {state.previewUsesSaved ? "saved source" : "Not in preview"}
          </span>
        </div>
      </header>

      <div className="om-source-editor__body">
        <aside className="om-source-editor__tree" aria-label="Source tree">
          <input
            aria-label="Filter source files"
            placeholder="Filter…"
            value={state.treeFilter}
            onChange={(e) => dispatch({ type: "set_tree_filter", value: e.target.value })}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <button type="button" onClick={() => void refreshTree()} disabled={busy}>
            Refresh
          </button>
          {filtered.map((entry) => (
            <button
              key={entry.relativePath}
              type="button"
              data-active={active?.relativePath === entry.relativePath ? "true" : "false"}
              data-changed={
                state.tabs.some((t) => t.relativePath === entry.relativePath && t.dirty)
                  ? "true"
                  : "false"
              }
              onClick={() => void openPath(entry.relativePath)}
            >
              {entry.relativePath}
            </button>
          ))}
        </aside>

        <section className="om-source-editor__main">
          <div className="om-source-editor__tabs" role="tablist" aria-label="Open files">
            {state.tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className="om-source-editor__tab"
                role="tab"
                aria-selected={tab.key === state.activeKey}
                data-active={tab.key === state.activeKey ? "true" : "false"}
                onClick={() => dispatch({ type: "activate", key: tab.key })}
              >
                {tab.dirty || tab.conflict ? "● " : ""}
                {tab.relativePath.split("/").pop()}
              </button>
            ))}
          </div>
          <div className="om-source-editor__toolbar">
            <button
              type="button"
              disabled={!active || !active.dirty || active.readOnly || busy}
              onClick={() => active && void saveTab(active)}
            >
              Save
            </button>
            <button type="button" disabled={busy} onClick={() => void saveAll()}>
              Save all
            </button>
            <button
              type="button"
              disabled={!active || active.readOnly || busy}
              onClick={() => void revertActive()}
            >
              Revert
            </button>
            <button type="button" disabled={!active} onClick={() => void loadDiff()}>
              Diff
            </button>
            <button
              type="button"
              disabled={!active}
              onClick={() => active && dispatch({ type: "close_tab", key: active.key })}
            >
              Close
            </button>
            <button
              type="button"
              disabled={!active}
              onClick={() => active && dispatch({ type: "close_others", key: active.key })}
            >
              Close others
            </button>
            <button type="button" onClick={() => dispatch({ type: "close_saved" })}>
              Close saved
            </button>
          </div>

          {active?.conflict ? (
            <div className="om-source-editor__conflict" role="alertdialog" aria-label="Stale save conflict">
              <p>
                Server content changed (`SOURCE_CHANGED`). Local buffer preserved. Choose how to
                continue — overwrite is never automatic.
              </p>
              <pre style={{ maxHeight: "6rem", overflow: "auto" }}>
                {active.conflictServerContent}
              </pre>
              <button
                type="button"
                onClick={() => dispatch({ type: "resolve_conflict_discard", key: active.key })}
              >
                Discard local / use server
              </button>{" "}
              <button
                type="button"
                onClick={() => dispatch({ type: "resolve_conflict_keep_local", key: active.key })}
              >
                Keep local (rebase SHA)
              </button>
            </div>
          ) : null}

          {active ? (
            <Editor
              height="18rem"
              language={languageToMonaco(active.language)}
              value={active.bufferContent}
              path={active.relativePath}
              onChange={(value: string | undefined) => {
                if (active.readOnly) return;
                dispatch({ type: "set_buffer", key: active.key, content: value ?? "" });
              }}
              options={{
                readOnly: active.readOnly,
                minimap: { enabled: true },
                wordWrap: "on",
                automaticLayout: true,
                ariaLabel: `Editor ${active.relativePath}`
              }}
            />
          ) : (
            <p style={{ padding: "1rem" }}>Select a source file to open.</p>
          )}
        </section>
      </div>

      <footer className="om-source-editor__panels" aria-label="Editor panels">
        <div>
          Panels:{" "}
          {(["problems", "diff", "validation", "preview"] as const).map((panel) => (
            <button
              key={panel}
              type="button"
              onClick={() => dispatch({ type: "set_panel", panel })}
              style={{ marginRight: "0.35rem" }}
            >
              {panel}
            </button>
          ))}
        </div>
        {state.panel === "diff" ? diffText || "Open Diff to load worktree diff." : null}
        {state.panel === "problems" ? "Problems panel (host diagnostics land in E03)." : null}
        {state.panel === "validation" ? "Validation panel placeholder." : null}
        {state.panel === "preview" ? "Preview logs surface (runtime wires in E05)." : null}
        {status ? (
          <p role="status" style={{ color: "#b45309" }}>
            {status}
          </p>
        ) : null}
      </footer>
    </div>
  );
}
