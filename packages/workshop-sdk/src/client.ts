import type {
  CorrelationId,
  CreateChangeSetRequest,
  CreateChangeSetResult,
  CreateRevisionRequest,
  CreateRevisionResult,
  DiagnosticsJob,
  DecideApprovalRequest,
  DecideApprovalResult,
  DirtyWorkspaceResult,
  GetEditableRouteResult,
  ListEditableRoutesResult,
  FormatWorkspaceFileRequest,
  FormatWorkspaceFileResult,
  PushApprovedRevisionRequest,
  PushApprovedRevisionResult,
  RevisionDetail,
  RevertWorkspaceFileRequest,
  RuntimeAttachRequest,
  RuntimeLocateRequest,
  RuntimeLocateResult,
  RuntimeLogs,
  RuntimePrepareResult,
  RuntimeStartRequest,
  RuntimeStatus,
  SaveWorkspaceFileRequest,
  SaveWorkspaceFileResponse,
  SealRevisionRequest,
  StartDiagnosticsRequest,
  SubmitApprovalRequest,
  SubmitApprovalResult,
  StructuredEditAnalyzeResult,
  StructuredEditApplyRequest,
  StructuredEditApplyResult,
  StructuredEditPreviewRequest,
  StructuredEditPreviewResult,
  WorkspaceDiff,
  WorkspaceFileContent,
  WorkspaceFileTree,
  WorkshopHostCapabilities,
  WorkshopHostStatus,
  WorkspaceSearchRequest,
  WorkspaceSearchResult
} from "@om/workshop-contracts";

import {
  createChangeSetResultSchema,
  createCorrelationId,
  createRevisionResultSchema,
  decideApprovalResultSchema,
  diagnosticsJobSchema,
  dirtyWorkspaceResultSchema,
  formatWorkspaceFileResultSchema,
  getEditableRouteResultSchema,
  listEditableRoutesResultSchema,
  pushApprovedRevisionResultSchema,
  revisionDetailSchema,
  runtimeLocateResultSchema,
  runtimeLogsSchema,
  runtimePrepareResultSchema,
  runtimeStatusSchema,
  saveWorkspaceFileResponseSchema,
  submitApprovalResultSchema,
  structuredEditAnalyzeResultSchema,
  structuredEditApplyResultSchema,
  structuredEditPreviewResultSchema,
  workshopErrorSchema,
  workshopHostCapabilitiesSchema,
  workshopHostStatusSchema,
  workspaceDiffSchema,
  workspaceFileContentSchema,
  workspaceFileTreeSchema,
  workspaceSearchResultSchema
} from "@om/workshop-contracts";

import { WorkshopSdkError, toSdkError } from "./errors.js";

export type WorkshopTransport = (
  input: string,
  init: RequestInit & { readonly correlationId: CorrelationId }
) => Promise<Response>;

export type CreateWorkshopClientOptions = {
  readonly baseUrl?: string;
  readonly transport?: WorkshopTransport;
  readonly credentials?: RequestCredentials;
  readonly getCorrelationId?: () => CorrelationId;
};

export type WorkshopClient = {
  readonly getHostStatus: () => Promise<WorkshopHostStatus>;
  readonly getHostCapabilities: () => Promise<WorkshopHostCapabilities>;
  readonly hasCapability: (capabilityId: string) => Promise<boolean>;
  readonly listWorkspaceFiles: (
    workspaceId: string,
    repositoryId: string,
    options?: { readonly path?: string; readonly depth?: number }
  ) => Promise<WorkspaceFileTree>;
  readonly getWorkspaceFile: (
    workspaceId: string,
    repositoryId: string,
    relativePath: string
  ) => Promise<WorkspaceFileContent>;
  readonly saveWorkspaceFile: (
    workspaceId: string,
    repositoryId: string,
    body: SaveWorkspaceFileRequest
  ) => Promise<SaveWorkspaceFileResponse>;
  readonly revertWorkspaceFile: (
    workspaceId: string,
    repositoryId: string,
    body: RevertWorkspaceFileRequest
  ) => Promise<WorkspaceFileContent>;
  readonly getWorkspaceFileDiff: (
    workspaceId: string,
    repositoryId: string,
    relativePath: string
  ) => Promise<WorkspaceDiff>;
  readonly getWorkspaceDiff: (workspaceId: string, repositoryId: string) => Promise<WorkspaceDiff>;
  readonly searchWorkspace: (
    workspaceId: string,
    repositoryId: string,
    body: WorkspaceSearchRequest
  ) => Promise<WorkspaceSearchResult>;
  readonly formatWorkspaceFile: (
    workspaceId: string,
    repositoryId: string,
    body: FormatWorkspaceFileRequest
  ) => Promise<FormatWorkspaceFileResult>;
  readonly startWorkspaceDiagnostics: (
    workspaceId: string,
    repositoryId: string,
    body?: Partial<StartDiagnosticsRequest>
  ) => Promise<DiagnosticsJob>;
  readonly getWorkspaceDiagnostics: (
    workspaceId: string,
    repositoryId: string,
    runId: string
  ) => Promise<DiagnosticsJob>;
  readonly cancelWorkspaceDiagnostics: (
    workspaceId: string,
    repositoryId: string,
    runId: string
  ) => Promise<DiagnosticsJob>;
  readonly analyzeStructuredEdits: (
    workspaceId: string,
    repositoryId: string,
    relativePath: string
  ) => Promise<StructuredEditAnalyzeResult>;
  readonly previewStructuredEdit: (
    workspaceId: string,
    repositoryId: string,
    body: StructuredEditPreviewRequest
  ) => Promise<StructuredEditPreviewResult>;
  readonly applyStructuredEdit: (
    workspaceId: string,
    repositoryId: string,
    body: StructuredEditApplyRequest
  ) => Promise<StructuredEditApplyResult>;
  readonly listDirtyWorkspaceFiles: (
    workspaceId: string,
    repositoryId: string
  ) => Promise<DirtyWorkspaceResult>;
  readonly createChangeSet: (body: CreateChangeSetRequest) => Promise<CreateChangeSetResult>;
  readonly createRevision: (
    changeSetId: string,
    body: CreateRevisionRequest
  ) => Promise<CreateRevisionResult>;
  readonly getRevision: (revisionId: string) => Promise<RevisionDetail>;
  readonly sealRevision: (
    revisionId: string,
    body: SealRevisionRequest
  ) => Promise<RevisionDetail>;
  readonly prepareRuntimeWorkspace: (body?: {
    workspaceKey?: string;
    sourceCommit?: string;
  }) => Promise<RuntimePrepareResult>;
  readonly attachRuntimeWorkspace: (body: RuntimeAttachRequest) => Promise<RuntimePrepareResult>;
  readonly startRuntimePreview: (body?: RuntimeStartRequest) => Promise<RuntimeStatus>;
  readonly stopRuntimePreview: (body?: { workspaceKey?: string }) => Promise<RuntimeStatus>;
  readonly getRuntimeStatus: (workspaceKey?: string) => Promise<RuntimeStatus>;
  readonly getRuntimeLogs: (workspaceKey?: string) => Promise<RuntimeLogs>;
  readonly locateRuntimeSource: (body?: RuntimeLocateRequest) => Promise<RuntimeLocateResult>;
  readonly submitApproval: (body: SubmitApprovalRequest) => Promise<SubmitApprovalResult>;
  readonly decideApproval: (body: DecideApprovalRequest) => Promise<DecideApprovalResult>;
  readonly pushApprovedRevision: (
    body: PushApprovedRevisionRequest
  ) => Promise<PushApprovedRevisionResult>;
  readonly listEditableRoutes: () => Promise<ListEditableRoutesResult>;
  readonly getEditableRoute: (route: string) => Promise<GetEditableRouteResult>;
};

function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl) {
    return path;
  }
  return `${baseUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function encodeQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw toSdkError("INVALID_PAYLOAD", "Host response was not valid JSON");
  }
}

export function createWorkshopClient(options: CreateWorkshopClientOptions = {}): WorkshopClient {
  const baseUrl = options.baseUrl ?? "";
  const credentials = options.credentials ?? "same-origin";
  const getCorrelationId = options.getCorrelationId ?? (() => createCorrelationId());

  const transport: WorkshopTransport =
    options.transport ??
    (async (input, init) => {
      try {
        return await fetch(input, init);
      } catch (cause) {
        throw toSdkError(
          "NETWORK_ERROR",
          cause instanceof Error ? cause.message : "Network request failed",
          init.correlationId
        );
      }
    });

  async function request<T>(
    path: string,
    schema: { parse: (input: unknown) => T },
    init: { readonly method?: string; readonly body?: unknown } = {}
  ): Promise<T> {
    const correlationId = getCorrelationId();
    const method = init.method ?? "GET";
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Correlation-Id": correlationId
    };
    const requestInit: RequestInit & { readonly correlationId: CorrelationId } = {
      method,
      credentials,
      headers,
      correlationId
    };
    if (init.body !== undefined) {
      headers["Content-Type"] = "application/json";
      requestInit.body = JSON.stringify(init.body);
    }

    let response: Response;
    try {
      response = await transport(joinUrl(baseUrl, path), requestInit);
    } catch (error) {
      if (error instanceof WorkshopSdkError) {
        throw error;
      }
      throw toSdkError(
        "NETWORK_ERROR",
        error instanceof Error ? error.message : "Network request failed",
        correlationId
      );
    }

    const payload = await parseJson(response);
    const responseCorrelation = response.headers.get("X-Correlation-Id") ?? correlationId;

    if (response.status === 401) {
      throw toSdkError("UNAUTHORIZED", "Authentication required", responseCorrelation);
    }
    if (response.status === 403) {
      const parsed = workshopErrorSchema.safeParse(payload);
      if (parsed.success && parsed.data.code === "CAPABILITY_UNAVAILABLE") {
        throw new WorkshopSdkError({
          ...parsed.data,
          correlationId: parsed.data.correlationId ?? responseCorrelation
        });
      }
      throw toSdkError("FORBIDDEN", "Permission denied", responseCorrelation);
    }
    if (!response.ok) {
      const parsed = workshopErrorSchema.safeParse(payload);
      if (parsed.success) {
        throw new WorkshopSdkError({
          ...parsed.data,
          correlationId: parsed.data.correlationId ?? responseCorrelation
        });
      }
      throw toSdkError(
        "INTERNAL_ERROR",
        `Host request failed with status ${String(response.status)}`,
        responseCorrelation
      );
    }

    try {
      return schema.parse(payload);
    } catch {
      throw toSdkError(
        "INVALID_PAYLOAD",
        "Host payload failed contract validation",
        responseCorrelation
      );
    }
  }

  function workspaceBase(workspaceId: string, repositoryId: string): string {
    return `/__server/workshop/workspaces/${encodeURIComponent(workspaceId)}/repositories/${encodeURIComponent(repositoryId)}`;
  }

  return {
    getHostStatus: () => request("/__server/host/status", workshopHostStatusSchema),
    getHostCapabilities: () =>
      request("/__server/host/capabilities", workshopHostCapabilitiesSchema),
    async hasCapability(capabilityId: string) {
      const capabilities = await this.getHostCapabilities();
      return capabilities.capabilities.some((item) => item.id === capabilityId && item.available);
    },
    listWorkspaceFiles(workspaceId, repositoryId, options = {}) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/files${encodeQuery({
          path: options.path,
          depth: options.depth
        })}`,
        workspaceFileTreeSchema
      );
    },
    getWorkspaceFile(workspaceId, repositoryId, relativePath) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/file${encodeQuery({ path: relativePath })}`,
        workspaceFileContentSchema
      );
    },
    saveWorkspaceFile(workspaceId, repositoryId, body) {
      return request(`${workspaceBase(workspaceId, repositoryId)}/file`, saveWorkspaceFileResponseSchema, {
        method: "PUT",
        body
      });
    },
    revertWorkspaceFile(workspaceId, repositoryId, body) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/file/revert`,
        workspaceFileContentSchema,
        { method: "POST", body }
      );
    },
    getWorkspaceFileDiff(workspaceId, repositoryId, relativePath) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/file/diff${encodeQuery({ path: relativePath })}`,
        workspaceDiffSchema
      );
    },
    getWorkspaceDiff(workspaceId, repositoryId) {
      return request(`${workspaceBase(workspaceId, repositoryId)}/diff`, workspaceDiffSchema);
    },
    searchWorkspace(workspaceId, repositoryId, body) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/search`,
        workspaceSearchResultSchema,
        { method: "POST", body }
      );
    },
    formatWorkspaceFile(workspaceId, repositoryId, body) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/file/format`,
        formatWorkspaceFileResultSchema,
        { method: "POST", body }
      );
    },
    startWorkspaceDiagnostics(workspaceId, repositoryId, body = { scope: "file" }) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/diagnostics`,
        diagnosticsJobSchema,
        { method: "POST", body }
      );
    },
    getWorkspaceDiagnostics(workspaceId, repositoryId, runId) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/diagnostics/${encodeURIComponent(runId)}`,
        diagnosticsJobSchema
      );
    },
    cancelWorkspaceDiagnostics(workspaceId, repositoryId, runId) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/diagnostics/${encodeURIComponent(runId)}/cancel`,
        diagnosticsJobSchema,
        { method: "POST", body: {} }
      );
    },
    analyzeStructuredEdits(workspaceId, repositoryId, relativePath) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/structured-edits/analyze`,
        structuredEditAnalyzeResultSchema,
        { method: "POST", body: { relativePath } }
      );
    },
    previewStructuredEdit(workspaceId, repositoryId, body) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/structured-edits/preview`,
        structuredEditPreviewResultSchema,
        { method: "POST", body }
      );
    },
    applyStructuredEdit(workspaceId, repositoryId, body) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/structured-edits/apply`,
        structuredEditApplyResultSchema,
        { method: "POST", body }
      );
    },
    listDirtyWorkspaceFiles(workspaceId, repositoryId) {
      return request(
        `${workspaceBase(workspaceId, repositoryId)}/dirty`,
        dirtyWorkspaceResultSchema
      );
    },
    createChangeSet(body) {
      return request("/__server/workshop/change-sets", createChangeSetResultSchema, {
        method: "POST",
        body
      });
    },
    createRevision(changeSetId, body) {
      return request(
        `/__server/workshop/change-sets/${encodeURIComponent(changeSetId)}/revisions`,
        createRevisionResultSchema,
        { method: "POST", body }
      );
    },
    getRevision(revisionId) {
      return request(
        `/__server/workshop/revisions/${encodeURIComponent(revisionId)}`,
        revisionDetailSchema
      );
    },
    sealRevision(revisionId, body) {
      return request(
        `/__server/workshop/revisions/${encodeURIComponent(revisionId)}/seal`,
        revisionDetailSchema,
        { method: "POST", body }
      );
    },
    prepareRuntimeWorkspace(body = {}) {
      return request("/__server/workshop/runtime/prepare", runtimePrepareResultSchema, {
        method: "POST",
        body
      });
    },
    attachRuntimeWorkspace(body) {
      return request("/__server/workshop/runtime/attach", runtimePrepareResultSchema, {
        method: "POST",
        body
      });
    },
    startRuntimePreview(body = {}) {
      return request("/__server/workshop/runtime/start", runtimeStatusSchema, {
        method: "POST",
        body
      });
    },
    stopRuntimePreview(body = {}) {
      return request("/__server/workshop/runtime/stop", runtimeStatusSchema, {
        method: "POST",
        body
      });
    },
    getRuntimeStatus(workspaceKey) {
      return request(
        `/__server/workshop/runtime/status${encodeQuery({ workspaceKey })}`,
        runtimeStatusSchema
      );
    },
    getRuntimeLogs(workspaceKey) {
      return request(
        `/__server/workshop/runtime/logs${encodeQuery({ workspaceKey })}`,
        runtimeLogsSchema
      );
    },
    locateRuntimeSource(body = {}) {
      return request("/__server/workshop/runtime/locate", runtimeLocateResultSchema, {
        method: "POST",
        body
      });
    },
    submitApproval(body) {
      return request("/__server/workshop/governance/requests", submitApprovalResultSchema, {
        method: "POST",
        body
      });
    },
    decideApproval(body) {
      return request("/__server/workshop/governance/decide", decideApprovalResultSchema, {
        method: "POST",
        body
      });
    },
    pushApprovedRevision(body) {
      return request(
        "/__server/workshop/push/approved-revision",
        pushApprovedRevisionResultSchema,
        { method: "POST", body }
      );
    },
    listEditableRoutes() {
      return request("/__server/workshop/routes", listEditableRoutesResultSchema);
    },
    getEditableRoute(route) {
      return request(
        `/__server/workshop/routes/${encodeURIComponent(route)}`,
        getEditableRouteResultSchema
      );
    }
  };
}
