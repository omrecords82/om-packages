import { useEffect, useMemo, useState } from "react";
import { createWorkshopClient } from "@om/workshop-sdk";
import type { OmEditableRoute } from "@om/workshop-contracts";
import { ModuleHeader, ModulePage } from "@om/workshop-module-ui";
import { SourceEditor } from "@om/workshop-source-editor";

/**
 * Operator-facing OM Pages editor surface.
 * Route catalog comes from the host WorkshopRouteRegistry (/__server/workshop/routes).
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
  const changeSetId = params.get("changeSetId") || undefined;
  const routeParam = params.get("route") || "";

  const [manualWorkspace, setManualWorkspace] = useState(workspaceId);
  const [manualRepository, setManualRepository] = useState(repositoryId);
  const [routes, setRoutes] = useState<OmEditableRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState(routeParam || "/latest-news");
  const [routeDetail, setRouteDetail] = useState<OmEditableRoute | null>(null);
  const [status, setStatus] = useState("");
  const [openPath, setOpenPath] = useState(initialPath || "");

  const client = useMemo(() => createWorkshopClient({ baseUrl: "" }), []);

  useEffect(() => {
    void (async () => {
      try {
        const listed = await client.listEditableRoutes();
        setRoutes(listed.routes || []);
        const preferred =
          listed.routes?.find((r) => r.route === selectedRoute) ||
          listed.routes?.find((r) => r.route === "/latest-news") ||
          listed.routes?.[0];
        if (preferred) {
          setSelectedRoute(preferred.route);
          setRouteDetail(preferred);
          if (!openPath) setOpenPath(preferred.entryFile);
          if (!manualRepository) setManualRepository(preferred.repositoryKey);
        }
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Failed to load editable routes");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, [client]);

  const onSelectRoute = async (route: string) => {
    setSelectedRoute(route);
    setStatus("");
    try {
      const result = await client.getEditableRoute(route);
      if (result.route) {
        setRouteDetail(result.route);
        setOpenPath(result.route.entryFile);
        setManualRepository(result.route.repositoryKey);
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to resolve route");
    }
  };

  const ready = Boolean(manualWorkspace && manualRepository);
  const repo = routeDetail?.canonicalRepository;

  return (
    <ModulePage
      title="OM Pages Source Editor"
      description="Edit enrolled OM routes through the secure host file API and shared route registry."
    >
      <ModuleHeader
        title="Editable OM routes"
        description="Select an enrolled route (/enroll, /latest-news, …). Production comparison stays read-only."
      />

      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          Route catalog
          <select
            aria-label="OM editable route"
            value={selectedRoute}
            onChange={(e) => void onSelectRoute(e.target.value)}
            style={{ display: "block", minWidth: "16rem", marginTop: "0.25rem" }}
          >
            {routes.length === 0 ? <option value="">(loading…)</option> : null}
            {routes.map((r) => (
              <option key={r.routeKey} value={r.route}>
                {r.route} — {r.applicationKey || r.systemKey}
                {r.enabled === false ? " (disabled)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {routeDetail ? (
        <div
          style={{
            marginBottom: "0.75rem",
            fontSize: "0.85rem",
            lineHeight: 1.45,
            border: "1px solid #ddd",
            padding: "0.75rem"
          }}
        >
          <div>
            <strong>Repository:</strong> {routeDetail.repositoryKey}
            {repo?.baseCommit ? ` @ ${repo.baseCommit}` : ""}
          </div>
          <div>
            <strong>Branch/ref:</strong> {repo?.defaultBranch || "main"} (worktree tip when attached)
          </div>
          <div>
            <strong>Entry:</strong> {routeDetail.entryFile}
          </div>
          <div>
            <strong>Production URL (read-only):</strong>{" "}
            <a href={routeDetail.productionUrl} target="_blank" rel="noreferrer">
              {routeDetail.productionUrl}
            </a>
          </div>
          <div>
            <strong>Runtime profile:</strong> {routeDetail.runtimeProfile} ·{" "}
            <strong>Auth/data:</strong> {routeDetail.authDataProfile || "n/a"}
          </div>
          <div style={{ marginTop: "0.35rem" }}>
            <strong>Related files</strong>
            <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.25rem" }}>
              {(routeDetail.relatedFiles || []).map((f) => (
                <li key={f.path}>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "#1d4ed8",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                    onClick={() => setOpenPath(f.path)}
                  >
                    [{f.role}] {f.path}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <label>
          Workspace ID
          <input
            value={manualWorkspace}
            onChange={(e) => setManualWorkspace(e.target.value)}
            style={{ display: "block", minWidth: "12rem" }}
            placeholder="registered workspace key/id"
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
      {status ? (
        <p role="status" style={{ color: "#b45309" }}>
          {status}
        </p>
      ) : null}
      {ready ? (
        <SourceEditor
          client={client}
          workspaceId={manualWorkspace}
          repositoryId={manualRepository}
          {...(openPath ? { initialPath: openPath } : {})}
          {...(changeSetId ? { changeSetId } : {})}
          identity={{
            systemKey: routeDetail?.systemKey || "om",
            repositoryKey: manualRepository,
            branchOrRef: repo?.defaultBranch || "workspace worktree",
            baseCommit: repo?.baseCommit || "worktree-tip",
            workspaceKey: manualWorkspace,
            routeOrArtifact: selectedRoute || openPath || "OM page source",
            ...(routeDetail?.productionUrl ? { productionUrl: routeDetail.productionUrl } : {})
          }}
        />
      ) : (
        <p role="status">
          Enter a workspace and repository already attached to an isolated OM worktree, then open
          the enrolled route source above.
        </p>
      )}
    </ModulePage>
  );
}
