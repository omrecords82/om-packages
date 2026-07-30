import { useMemo, useState } from "react";
import { createWorkshopClient } from "@om/workshop-sdk";
import { ModuleHeader, ModulePage } from "@om/workshop-module-ui";
import { SourceEditor } from "@om/workshop-source-editor";

/**
 * Operator-facing OM Pages editor surface.
 * Workspace/repository IDs are provided by the host query string or props later;
 * defaults keep the module mountable while E01 disposable workspaces are selected.
 */
export function OmPagesModulePage(props?: {
  readonly workspaceId?: string;
  readonly repositoryId?: string;
  readonly initialPath?: string;
}) {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const workspaceId = props?.workspaceId || params.get("workspaceId") || "";
  const repositoryId = props?.repositoryId || params.get("repositoryId") || "";
  const initialPath = props?.initialPath || params.get("path") || undefined;
  const [manualWorkspace, setManualWorkspace] = useState(workspaceId);
  const [manualRepository, setManualRepository] = useState(repositoryId);

  const client = useMemo(() => createWorkshopClient({ baseUrl: "" }), []);

  const ready = Boolean(manualWorkspace && manualRepository);

  return (
    <ModulePage
      title="OM Pages Source Editor"
      description="Edit registered workspace TSX through the secure host file API."
    >
      <ModuleHeader
        title="Source workspace"
        description="Provide a workspace and repository already attached with a worktree path."
      />
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <label>
          Workspace ID
          <input
            value={manualWorkspace}
            onChange={(e) => setManualWorkspace(e.target.value)}
            style={{ display: "block", minWidth: "12rem" }}
          />
        </label>
        <label>
          Repository ID
          <input
            value={manualRepository}
            onChange={(e) => setManualRepository(e.target.value)}
            style={{ display: "block", minWidth: "12rem" }}
          />
        </label>
      </div>
      {ready ? (
        <SourceEditor
          client={client}
          workspaceId={manualWorkspace}
          repositoryId={manualRepository}
          {...(initialPath ? { initialPath } : {})}
          identity={{
            systemKey: "om",
            repositoryKey: manualRepository,
            branchOrRef: "workspace worktree",
            baseCommit: "worktree-tip",
            workspaceKey: manualWorkspace,
            routeOrArtifact: initialPath || "OM page source"
          }}
        />
      ) : (
        <p role="status">Enter workspace and repository identifiers to open the editor.</p>
      )}
    </ModulePage>
  );
}
