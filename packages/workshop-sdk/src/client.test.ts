import { describe, expect, it, vi } from "vitest";

import { createWorkshopClient } from "./client.js";
import { WorkshopSdkError } from "./errors.js";

function jsonResponse(status: number, body: unknown, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Correlation-Id": "omw-test-correlation",
      ...headers
    }
  });
}

describe("@om/workshop-sdk client", () => {
  it("returns host status on success and preserves correlation id", async () => {
    const transport = vi.fn((_url: string, init: RequestInit & { correlationId: string }) => {
      expect(init.headers).toMatchObject({
        "X-Correlation-Id": init.correlationId
      });
      expect(init.credentials).toBe("same-origin");
      return Promise.resolve(
        jsonResponse(200, {
          hostApiVersion: "1.0.0",
          environmentKey: "authoring",
          systemKey: "omworkshop",
          healthy: true
        })
      );
    });

    const client = createWorkshopClient({
      baseUrl: "https://workshop.example",
      transport,
      getCorrelationId: () => "omw-fixed-correlation"
    });

    const status = await client.getHostStatus();
    expect(status.healthy).toBe(true);
    expect(transport).toHaveBeenCalledOnce();
    expect(String(transport.mock.calls[0]?.[0])).toContain(
      "https://workshop.example/__server/host/status"
    );
  });

  it("maps 401 to UNAUTHORIZED", async () => {
    const client = createWorkshopClient({
      transport: () => Promise.resolve(jsonResponse(401, { error: "nope" })),
      getCorrelationId: () => "omw-auth-fail"
    });
    await expect(client.getHostStatus()).rejects.toMatchObject({
      code: "UNAUTHORIZED"
    });
  });

  it("maps capability unavailable payloads", async () => {
    const client = createWorkshopClient({
      transport: () =>
        Promise.resolve(
          jsonResponse(403, {
            code: "CAPABILITY_UNAVAILABLE",
            message: "host.status.read unavailable",
            correlationId: "omw-cap-unavailable"
          })
        ),
      getCorrelationId: () => "omw-cap-unavailable"
    });
    await expect(client.getHostCapabilities()).rejects.toBeInstanceOf(WorkshopSdkError);
    await expect(client.getHostCapabilities()).rejects.toMatchObject({
      code: "CAPABILITY_UNAVAILABLE"
    });
  });

  it("maps invalid payloads", async () => {
    const client = createWorkshopClient({
      transport: () => Promise.resolve(jsonResponse(200, { unexpected: true })),
      getCorrelationId: () => "omw-invalid"
    });
    await expect(client.getHostStatus()).rejects.toMatchObject({
      code: "INVALID_PAYLOAD"
    });
  });

  it("maps network failures", async () => {
    const client = createWorkshopClient({
      transport: () => Promise.reject(new TypeError("Failed to fetch")),
      getCorrelationId: () => "omw-network"
    });
    await expect(client.getHostStatus()).rejects.toMatchObject({
      code: "NETWORK_ERROR"
    });
  });

  it("discovers available capabilities", async () => {
    const client = createWorkshopClient({
      transport: () =>
        Promise.resolve(
          jsonResponse(200, {
            hostApiVersion: "1.0.0",
            capabilities: [
              { id: "host.status.read", available: true },
              { id: "host.git.write", available: false, reason: "not authorized" }
            ],
            permissions: ["workshop.module.read"]
          })
        ),
      getCorrelationId: () => "omw-caps"
    });
    await expect(client.hasCapability("host.status.read")).resolves.toBe(true);
    await expect(client.hasCapability("host.git.write")).resolves.toBe(false);
  });
});
