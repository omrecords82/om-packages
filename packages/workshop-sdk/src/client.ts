import type {
  CorrelationId,
  WorkshopHostCapabilities,
  WorkshopHostStatus
} from "@om/workshop-contracts";

import {
  createCorrelationId,
  workshopErrorSchema,
  workshopHostCapabilitiesSchema,
  workshopHostStatusSchema
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
};

function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl) {
    return path;
  }
  return `${baseUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
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

  async function request<T>(path: string, schema: { parse: (input: unknown) => T }): Promise<T> {
    const correlationId = getCorrelationId();
    let response: Response;
    try {
      response = await transport(joinUrl(baseUrl, path), {
        method: "GET",
        credentials,
        headers: {
          Accept: "application/json",
          "X-Correlation-Id": correlationId
        },
        correlationId
      });
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

  return {
    getHostStatus: () => request("/__server/host/status", workshopHostStatusSchema),
    getHostCapabilities: () =>
      request("/__server/host/capabilities", workshopHostCapabilitiesSchema),
    async hasCapability(capabilityId: string) {
      const capabilities = await this.getHostCapabilities();
      return capabilities.capabilities.some((item) => item.id === capabilityId && item.available);
    }
  };
}
