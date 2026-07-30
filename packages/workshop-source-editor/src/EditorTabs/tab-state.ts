export type EditorTab = {
  readonly key: string;
  readonly workspaceId: string;
  readonly repositoryId: string;
  readonly relativePath: string;
  readonly language: string;
  readonly loadedSha256: string;
  readonly savedSha256: string;
  readonly serverContent: string;
  readonly bufferContent: string;
  readonly dirty: boolean;
  readonly conflict: boolean;
  readonly readOnly: boolean;
  readonly conflictServerContent?: string;
  readonly conflictServerSha256?: string;
};

export type SourceEditorState = {
  readonly tabs: readonly EditorTab[];
  readonly activeKey: string | null;
  readonly treeFilter: string;
  readonly panel: "problems" | "diff" | "validation" | "preview";
  readonly workspaceDirty: boolean;
  readonly previewUsesSaved: boolean;
};

export type SourceEditorAction =
  | { type: "open_tab"; tab: EditorTab }
  | { type: "close_tab"; key: string }
  | { type: "close_others"; key: string }
  | { type: "close_saved" }
  | { type: "activate"; key: string }
  | { type: "set_buffer"; key: string; content: string }
  | { type: "mark_saved"; key: string; contentSha256: string; content: string; workspaceDirty: boolean }
  | { type: "mark_conflict"; key: string; serverContent: string; serverSha256: string }
  | { type: "resolve_conflict_discard"; key: string }
  | { type: "resolve_conflict_keep_local"; key: string }
  | { type: "set_tree_filter"; value: string }
  | { type: "set_panel"; panel: SourceEditorState["panel"] }
  | { type: "set_workspace_dirty"; dirty: boolean }
  | { type: "set_preview_uses_saved"; value: boolean };

export function tabKey(workspaceId: string, repositoryId: string, relativePath: string): string {
  return `${workspaceId}::${repositoryId}::${relativePath}`;
}

export function createInitialState(): SourceEditorState {
  return {
    tabs: [],
    activeKey: null,
    treeFilter: "",
    panel: "diff",
    workspaceDirty: false,
    previewUsesSaved: true
  };
}

function withDirty(tab: EditorTab, bufferContent: string): EditorTab {
  const dirty = bufferContent !== tab.serverContent;
  return { ...tab, bufferContent, dirty, conflict: dirty ? tab.conflict : false };
}

export function sourceEditorReducer(
  state: SourceEditorState,
  action: SourceEditorAction
): SourceEditorState {
  switch (action.type) {
    case "open_tab": {
      const existing = state.tabs.find((t) => t.key === action.tab.key);
      if (existing) {
        return { ...state, activeKey: existing.key };
      }
      return { ...state, tabs: [...state.tabs, action.tab], activeKey: action.tab.key };
    }
    case "close_tab": {
      const tabs = state.tabs.filter((t) => t.key !== action.key);
      const activeKey =
        state.activeKey === action.key ? (tabs[tabs.length - 1]?.key ?? null) : state.activeKey;
      return { ...state, tabs, activeKey };
    }
    case "close_others":
      return {
        ...state,
        tabs: state.tabs.filter((t) => t.key === action.key),
        activeKey: action.key
      };
    case "close_saved": {
      const tabs = state.tabs.filter((t) => t.dirty || t.conflict);
      const activeKey = tabs.some((t) => t.key === state.activeKey)
        ? state.activeKey
        : (tabs[0]?.key ?? null);
      return { ...state, tabs, activeKey };
    }
    case "activate":
      return { ...state, activeKey: action.key };
    case "set_buffer":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.key === action.key ? withDirty(t, action.content) : t
        ),
        previewUsesSaved: false
      };
    case "mark_saved":
      return {
        ...state,
        workspaceDirty: action.workspaceDirty,
        previewUsesSaved: true,
        tabs: state.tabs.map((t) => {
          if (t.key !== action.key) return t;
          const {
            conflictServerContent: _c,
            conflictServerSha256: _s,
            ...rest
          } = t;
          return {
            ...rest,
            bufferContent: action.content,
            serverContent: action.content,
            loadedSha256: action.contentSha256,
            savedSha256: action.contentSha256,
            dirty: false,
            conflict: false
          };
        })
      };
    case "mark_conflict":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.key === action.key
            ? {
                ...t,
                conflict: true,
                conflictServerContent: action.serverContent,
                conflictServerSha256: action.serverSha256
              }
            : t
        )
      };
    case "resolve_conflict_discard":
      return {
        ...state,
        tabs: state.tabs.map((t) => {
          if (t.key !== action.key || t.conflictServerContent == null || !t.conflictServerSha256) {
            return t;
          }
          return {
            key: t.key,
            workspaceId: t.workspaceId,
            repositoryId: t.repositoryId,
            relativePath: t.relativePath,
            language: t.language,
            loadedSha256: t.conflictServerSha256,
            savedSha256: t.conflictServerSha256,
            serverContent: t.conflictServerContent,
            bufferContent: t.conflictServerContent,
            dirty: false,
            conflict: false,
            readOnly: t.readOnly
          };
        }),
        previewUsesSaved: true
      };
    case "resolve_conflict_keep_local":
      return {
        ...state,
        tabs: state.tabs.map((t) => {
          if (t.key !== action.key || !t.conflictServerSha256) return t;
          return {
            key: t.key,
            workspaceId: t.workspaceId,
            repositoryId: t.repositoryId,
            relativePath: t.relativePath,
            language: t.language,
            loadedSha256: t.conflictServerSha256,
            savedSha256: t.savedSha256,
            serverContent: t.conflictServerContent ?? t.serverContent,
            bufferContent: t.bufferContent,
            dirty: true,
            conflict: false,
            readOnly: t.readOnly
          };
        })
      };
    case "set_tree_filter":
      return { ...state, treeFilter: action.value };
    case "set_panel":
      return { ...state, panel: action.panel };
    case "set_workspace_dirty":
      return { ...state, workspaceDirty: action.dirty };
    case "set_preview_uses_saved":
      return { ...state, previewUsesSaved: action.value };
    default:
      return state;
  }
}

export function anyDirty(state: SourceEditorState): boolean {
  return state.tabs.some((t) => t.dirty || t.conflict);
}
