import { useCallback, useEffect, useMemo, useReducer, useState, type JSX } from "react";
import type { WorkshopClient } from "@om/workshop-sdk";
import type {
  CreateRevisionResult,
  DiagnosticItem,
  DirtyWorkspaceResult,
  RevisionDetail,
  RuntimeLocateResult,
  RuntimeStatus,
  StructuredEditAnalyzeResult,
  WorkspaceFileTreeEntry,
  WorkspaceSearchHit
} from "@om/workshop-contracts";
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
  /** Optional existing change set; created on demand from the Changes panel when empty. */
  readonly changeSetId?: string;
  /** Preview route for the real OM runtime (default /enroll). */
  readonly previewRoute?: string;
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
  initialPath,
  changeSetId: changeSetIdProp,
  previewRoute = "/enroll"
}: SourceEditorProps) {
  const [state, dispatch] = useReducer(sourceEditorReducer, undefined, createInitialState);
  const [entries, setEntries] = useState<WorkspaceFileTreeEntry[]>([]);
  const [diffText, setDiffText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHits, setSearchHits] = useState<WorkspaceSearchHit[]>([]);
  const [structured, setStructured] = useState<StructuredEditAnalyzeResult | null>(null);
  const [structuredPreview, setStructuredPreview] = useState<string>("");
  const [changeSetId, setChangeSetId] = useState(changeSetIdProp || "");
  const [dirtyInfo, setDirtyInfo] = useState<DirtyWorkspaceResult | null>(null);
  const [revision, setRevision] = useState<CreateRevisionResult | RevisionDetail | null>(null);
  const [runtimeKey, setRuntimeKey] = useState("");
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [runtimeLogs, setRuntimeLogs] = useState("");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [locateInfo, setLocateInfo] = useState<RuntimeLocateResult | null>(null);

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

  const formatActive = async (apply: boolean) => {
    if (!active || active.readOnly) return;
    setBusy(true);
    try {
      const result = await client.formatWorkspaceFile(workspaceId, repositoryId, {
        relativePath: active.relativePath,
        expectedOriginalSha256: active.loadedSha256,
        apply
      });
      if (apply && result.applied) {
        dispatch({
          type: "mark_saved",
          key: active.key,
          contentSha256: result.contentSha256,
          content: result.content,
          workspaceDirty: true
        });
      } else {
        dispatch({ type: "set_buffer", key: active.key, content: result.content });
      }
      setStatus(result.unchanged ? "Already formatted" : apply ? "Formatted" : "Format preview loaded");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Format failed");
    } finally {
      setBusy(false);
    }
  };

  const runDiagnostics = async () => {
    if (!active) return;
    setBusy(true);
    dispatch({ type: "set_panel", panel: "problems" });
    try {
      const job = await client.startWorkspaceDiagnostics(workspaceId, repositoryId, {
        scope: "file",
        relativePath: active.relativePath
      });
      setDiagnostics(job.diagnostics || []);
      setStatus(`Diagnostics ${job.status} (${job.diagnostics.length} findings)`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Diagnostics failed");
    } finally {
      setBusy(false);
    }
  };

  const runSearch = async () => {
    if (!searchQuery.trim()) return;
    setBusy(true);
    dispatch({ type: "set_panel", panel: "problems" });
    try {
      const result = await client.searchWorkspace(workspaceId, repositoryId, {
        query: searchQuery,
        mode: "literal",
        path: "",
        includeGlobs: [],
        excludeGlobs: [],
        maxResults: 100
      });
      setSearchHits(result.hits);
      setStatus(`Search: ${result.hits.length} hit(s)${result.truncated ? " (truncated)" : ""}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Search failed");
    } finally {
      setBusy(false);
    }
  };

  const refreshDirty = async () => {
    setBusy(true);
    dispatch({ type: "set_panel", panel: "changes" });
    try {
      const result = await client.listDirtyWorkspaceFiles(workspaceId, repositoryId);
      setDirtyInfo(result);
      dispatch({ type: "set_workspace_dirty", dirty: result.dirty });
      setStatus(
        result.dirty
          ? `${result.files.length} saved dirty file(s) in worktree (unsaved buffers listed separately)`
          : "Worktree clean — save is not a revision"
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Dirty listing failed");
    } finally {
      setBusy(false);
    }
  };

  const ensureChangeSet = async (): Promise<string> => {
    if (changeSetId) return changeSetId;
    const created = await client.createChangeSet({ workspaceId, repositoryId });
    setChangeSetId(created.changeSetId);
    return created.changeSetId;
  };

  const createRevisionAction = async () => {
    if (anyDirty(state)) {
      setStatus("Save or discard unsaved buffers before creating a revision");
      return;
    }
    setBusy(true);
    dispatch({ type: "set_panel", panel: "changes" });
    try {
      const csId = await ensureChangeSet();
      const result = await client.createRevision(csId, {
        workspaceId,
        repositoryId,
        summary: `Editor revision for ${identity.routeOrArtifact}`
      });
      setRevision(result);
      setStatus(
        `Revision #${result.revisionNumber} created (unsealed). Seal is separate from save/create.`
      );
      await refreshDirty();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Create revision failed");
    } finally {
      setBusy(false);
    }
  };

  const sealRevisionAction = async () => {
    if (!revision?.revisionId) {
      setStatus("Create a revision before sealing");
      return;
    }
    setBusy(true);
    try {
      const sealed = await client.sealRevision(revision.revisionId, {
        workspaceId,
        repositoryId
      });
      setRevision(sealed);
      setStatus(
        sealed.sealed
          ? `Revision sealed @ ${sealed.contentSha256.slice(0, 12)}… — approval/push remain separate`
          : "Seal returned without sealed flag"
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Seal failed");
    } finally {
      setBusy(false);
    }
  };

  const viewportWidth = viewport === "mobile" ? 390 : viewport === "tablet" ? 768 : 1100;

  const refreshRuntimeStatus = async (key = runtimeKey) => {
    if (!key) return;
    const st = await client.getRuntimeStatus(key);
    setRuntimeStatus(st);
  };

  const startPreview = async () => {
    if (anyDirty(state)) {
      setStatus("Save buffers first — unsaved content is Not in preview");
      dispatch({ type: "set_preview_uses_saved", value: false });
      dispatch({ type: "set_panel", panel: "preview" });
      return;
    }
    setBusy(true);
    dispatch({ type: "set_panel", panel: "preview" });
    try {
      let key = runtimeKey;
      if (!key) {
        const attached = await client.attachRuntimeWorkspace({
          workspaceId,
          repositoryId,
          route: previewRoute
        });
        if (!attached.ok || !attached.workspaceKey) {
          // Disposable prepare fallback when DB workspace is not an OM clone root
          const prepared = await client.prepareRuntimeWorkspace({});
          if (!prepared.ok || !prepared.workspaceKey) {
            setStatus(attached.error || prepared.error || "Runtime prepare failed");
            return;
          }
          key = prepared.workspaceKey;
          setStatus(
            `Prepared disposable runtime ${key} (registered attach: ${attached.error || "n/a"})`
          );
        } else {
          key = attached.workspaceKey;
        }
        setRuntimeKey(key);
      }
      const started = await client.startRuntimePreview({
        workspaceKey: key,
        route: previewRoute,
        mode: "mock"
      });
      setRuntimeStatus(started);
      dispatch({ type: "set_preview_uses_saved", value: true });
      setStatus(
        started.previewUrl
          ? `Preview ready @ ${started.previewUrl} (commit ${(started.sourceCommit || "").slice(0, 10)})`
          : started.error || "Preview start returned no URL"
      );
      const logs = await client.getRuntimeLogs(key);
      setRuntimeLogs(logs.logs || "");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Preview start failed");
    } finally {
      setBusy(false);
    }
  };

  const stopPreview = async () => {
    if (!runtimeKey) return;
    setBusy(true);
    try {
      const st = await client.stopRuntimePreview({ workspaceKey: runtimeKey });
      setRuntimeStatus(st);
      setStatus("Preview stopped");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Preview stop failed");
    } finally {
      setBusy(false);
    }
  };

  const openFromPreview = async () => {
    if (!runtimeKey) {
      setStatus("Start preview before Open in Source");
      return;
    }
    setBusy(true);
    try {
      const located = await client.locateRuntimeSource({
        workspaceKey: runtimeKey,
        route: previewRoute
      });
      setLocateInfo(located);
      if (located.ok && located.relativePath) {
        // Editor paths are relative to the registered repo root; strip front-end/ when needed.
        const editorPath = located.relativePath.replace(/^front-end\//, "");
        await openPath(editorPath).catch(() => openPath(located.relativePath!));
        setStatus(
          `Open in Source → ${located.relativePath}:${located.line}:${located.column}` +
            (located.structuredEditSupported ? " (structured edit supported)" : " (source mode)")
        );
      } else {
        setStatus(located.error || "Locate failed");
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Locate failed");
    } finally {
      setBusy(false);
    }
  };

  const analyzeStructured = async () => {
    if (!active) return;
    setBusy(true);
    dispatch({ type: "set_panel", panel: "validation" });
    try {
      const result = await client.analyzeStructuredEdits(
        workspaceId,
        repositoryId,
        active.relativePath
      );
      setStructured(result);
      setStructuredPreview("");
      setStatus(
        `Structured analysis: ${result.hits.filter((h) => h.kind === "supported").length} supported / ${result.hits.filter((h) => h.kind === "unsupported").length} unsupported`
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Structured analyze failed");
    } finally {
      setBusy(false);
    }
  };

  const previewAndApplyStructured = async (hit: StructuredEditAnalyzeResult["hits"][number]) => {
    if (!active || hit.kind !== "supported" || hit.value == null || !hit.form) return;
    const nextValue = window.prompt("New value for structured edit", hit.value);
    if (nextValue == null) return;
    const operation =
      hit.form === "jsx-text"
        ? "replace_jsx_text"
        : hit.form === "boolean-prop"
          ? "replace_boolean_prop"
          : hit.form === "className"
            ? "update_classname"
            : "replace_string_prop";
    setBusy(true);
    try {
      const preview = await client.previewStructuredEdit(workspaceId, repositoryId, {
        relativePath: active.relativePath,
        expectedOriginalSha256: active.loadedSha256,
        operation,
        span: {
          line: hit.line,
          column: hit.column,
          endLine: hit.endLine,
          endColumn: hit.endColumn,
          form: hit.form,
          originalValue: hit.value,
          ...(hit.propName ? { propName: hit.propName } : {})
        },
        nextValue
      });
      setStructuredPreview(preview.unifiedDiff || preview.previewContent);
      if (!window.confirm("Apply structured edit preview?")) return;
      const applied = await client.applyStructuredEdit(workspaceId, repositoryId, {
        relativePath: active.relativePath,
        expectedOriginalSha256: active.loadedSha256,
        previewChecksum: preview.previewChecksum,
        operation,
        span: {
          line: hit.line,
          column: hit.column,
          endLine: hit.endLine,
          endColumn: hit.endColumn,
          form: hit.form,
          originalValue: hit.value,
          ...(hit.propName ? { propName: hit.propName } : {})
        },
        nextValue,
        formatAfter: true
      });
      dispatch({
        type: "mark_saved",
        key: active.key,
        contentSha256: applied.contentSha256,
        content: applied.content,
        workspaceDirty: applied.workspaceDirty
      });
      setStatus("Structured edit applied");
      await analyzeStructured();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Structured edit failed");
    } finally {
      setBusy(false);
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
              disabled={!active || active.readOnly || busy}
              onClick={() => void formatActive(false)}
            >
              Format preview
            </button>
            <button
              type="button"
              disabled={!active || active.readOnly || busy}
              onClick={() => void formatActive(true)}
            >
              Format apply
            </button>
            <button type="button" disabled={!active || busy} onClick={() => void runDiagnostics()}>
              Diagnostics
            </button>
            <button
              type="button"
              disabled={!active || busy}
              onClick={() => void analyzeStructured()}
            >
              Structured analyze
            </button>
            <input
              aria-label="Workspace search"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "8rem" }}
            />
            <button type="button" disabled={busy || !searchQuery.trim()} onClick={() => void runSearch()}>
              Search
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
            <button type="button" disabled={busy} onClick={() => void refreshDirty()}>
              Changes
            </button>
            <button type="button" disabled={busy} onClick={() => void createRevisionAction()}>
              Create revision
            </button>
            <button
              type="button"
              disabled={busy || !revision || ("sealed" in revision && revision.sealed)}
              onClick={() => void sealRevisionAction()}
            >
              Seal revision
            </button>
            <button type="button" disabled={busy} onClick={() => void startPreview()}>
              Preview start
            </button>
            <button type="button" disabled={busy || !runtimeKey} onClick={() => void stopPreview()}>
              Preview stop
            </button>
            <button type="button" disabled={busy || !runtimeKey} onClick={() => void openFromPreview()}>
              Open in Source
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
          {(["problems", "diff", "validation", "preview", "changes"] as const).map((panel) => (
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
        {state.panel === "problems" ? (
          <div>
            <div style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
              Problems (Monaco ≠ host authority — tsc/eslint/build shown separately)
            </div>
            {diagnostics.length === 0 && searchHits.length === 0 ? (
              <div>No host diagnostics or search hits yet.</div>
            ) : null}
            {diagnostics.map((d, i) => (
              <button
                key={`d-${i}`}
                type="button"
                style={{ display: "block", width: "100%", textAlign: "left" }}
                onClick={() => void openPath(d.relativePath)}
              >
                [{d.source || "host"}:{d.severity}] {d.relativePath}:{d.line}:{d.column}{" "}
                {d.code ? `${d.code} ` : ""}
                {d.message}
                {d.fixAvailable ? " (fix available)" : ""}
              </button>
            ))}
            {searchHits.map((h, i) => (
              <button
                key={`s-${i}`}
                type="button"
                style={{ display: "block", width: "100%", textAlign: "left" }}
                onClick={() => void openPath(h.relativePath)}
              >
                [search] {h.relativePath}:{h.line}:{h.column} {h.preview}
              </button>
            ))}
          </div>
        ) : null}
        {state.panel === "validation" ? (
          <div>
            <div style={{ fontWeight: 600 }}>Structured edits (AST/span-checked)</div>
            {!structured ? <div>Run Structured analyze on the active file.</div> : null}
            {structured?.hits.map((hit, i) => (
              <div key={`h-${i}`} style={{ marginTop: "0.35rem" }}>
                <button
                  type="button"
                  disabled={hit.kind !== "supported" || busy || active?.readOnly}
                  onClick={() => void previewAndApplyStructured(hit)}
                >
                  {hit.kind}: {hit.form || "?"} {hit.value ?? hit.reason} @ {hit.line}:{hit.column}
                </button>
              </div>
            ))}
            {structuredPreview ? <pre>{structuredPreview}</pre> : null}
          </div>
        ) : null}
        {state.panel === "preview" ? (
          <div>
            <div style={{ fontWeight: 600 }}>
              Real OM runtime preview — saved worktree only (unsaved = Not in preview)
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.5rem 0" }}>
              {(["desktop", "tablet", "mobile"] as const).map((v) => (
                <button key={v} type="button" onClick={() => setViewport(v)} disabled={viewport === v}>
                  {v}
                </button>
              ))}
              <button
                type="button"
                disabled={busy || !runtimeKey}
                onClick={() => void refreshRuntimeStatus()}
              >
                Refresh status
              </button>
              <span>
                {runtimeStatus?.running || runtimeStatus?.runtimeRunning
                  ? `running · route ${runtimeStatus.route || previewRoute}`
                  : "stopped"}
                {runtimeStatus?.sourceCommit
                  ? ` · ${(runtimeStatus.sourceCommit || "").slice(0, 10)}`
                  : ""}
              </span>
            </div>
            {!state.previewUsesSaved || anyDirty(state) ? (
              <p role="status">Not in preview — save buffers before claiming runtime fidelity.</p>
            ) : null}
            {runtimeStatus?.previewUrl ? (
              <iframe
                title="OM runtime preview"
                src={runtimeStatus.previewUrl}
                style={{
                  width: viewportWidth,
                  maxWidth: "100%",
                  height: "22rem",
                  border: "1px solid #ccc",
                  background: "#fff"
                }}
              />
            ) : (
              <p>Start preview to load the real OM route iframe (production comparison stays read-only).</p>
            )}
            {locateInfo?.notes ? <p>{locateInfo.notes}</p> : null}
            <pre style={{ maxHeight: "8rem", overflow: "auto", fontSize: "0.75rem" }}>
              {runtimeLogs || "(no runtime logs yet)"}
            </pre>
          </div>
        ) : null}
        {state.panel === "changes" ? (
          <div>
            <div style={{ fontWeight: 600 }}>
              Change drawer — save ≠ revision ≠ seal ≠ approval ≠ push
            </div>
            <p style={{ margin: "0.35rem 0" }}>
              Change set: {changeSetId || "(none yet — created on Create revision)"}
            </p>
            <div style={{ marginBottom: "0.5rem" }}>
              Unsaved buffers:{" "}
              {state.tabs.filter((t) => t.dirty).length
                ? state.tabs
                    .filter((t) => t.dirty)
                    .map((t) => t.relativePath)
                    .join(", ")
                : "none"}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              Saved dirty worktree files:{" "}
              {!dirtyInfo
                ? "Click Changes to refresh"
                : dirtyInfo.files.length === 0
                  ? "none"
                  : null}
              {dirtyInfo?.files.map((f) => (
                <button
                  key={f.relativePath}
                  type="button"
                  style={{ display: "block", width: "100%", textAlign: "left" }}
                  onClick={() => void openPath(f.relativePath)}
                >
                  [{f.changeType}] {f.relativePath}{" "}
                  {f.resultSha256 ? f.resultSha256.slice(0, 10) : "(deleted)"}…
                </button>
              ))}
            </div>
            {revision ? (
              <div>
                Revision #{revision.revisionNumber} id={revision.revisionId}{" "}
                {revision.sealed ? "SEALED" : "draft"} sha={revision.contentSha256.slice(0, 12)}…
              </div>
            ) : (
              <div>No revision created in this session.</div>
            )}
          </div>
        ) : null}
        {status ? (
          <p role="status" style={{ color: "#b45309" }}>
            {status}
          </p>
        ) : null}
      </footer>
    </div>
  );
}
