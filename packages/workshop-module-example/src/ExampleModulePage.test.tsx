/** @vitest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { WorkshopClient } from "@om/workshop-sdk";

import { ExampleModulePage } from "./ExampleModulePage.js";
import { exampleModuleManifest } from "./manifest.js";

function createMockClient(mode: "success" | "unavailable" | "error"): WorkshopClient {
  if (mode === "success") {
    return {
      getHostStatus: () =>
        Promise.resolve({
          hostApiVersion: "1.0.0",
          environmentKey: "authoring",
          systemKey: "omworkshop",
          healthy: true
        }),
      getHostCapabilities: () =>
        Promise.resolve({
          hostApiVersion: "1.0.0",
          capabilities: [{ id: "host.status.read", available: true }],
          permissions: ["workshop.module.read"]
        }),
      hasCapability: () => Promise.resolve(true)
    };
  }
  if (mode === "unavailable") {
    return {
      getHostStatus: () =>
        Promise.resolve({
          hostApiVersion: "1.0.0",
          environmentKey: "authoring",
          systemKey: "omworkshop",
          healthy: true
        }),
      getHostCapabilities: () =>
        Promise.resolve({
          hostApiVersion: "1.0.0",
          capabilities: [
            { id: "host.status.read", available: false, reason: "disabled in fixture" }
          ],
          permissions: []
        }),
      hasCapability: () => Promise.resolve(false)
    };
  }
  return {
    getHostStatus: () => Promise.reject(new Error("boom")),
    getHostCapabilities: () => Promise.reject(new Error("boom")),
    hasCapability: () => Promise.resolve(false)
  };
}

describe("@om/workshop-module-example", () => {
  it("exports a validated manifest with one route and navigation item", () => {
    expect(exampleModuleManifest.routes).toHaveLength(1);
    expect(exampleModuleManifest.navigation).toHaveLength(1);
  });

  it("renders success state", async () => {
    render(<ExampleModulePage client={createMockClient("success")} />);
    await waitFor(() => {
      expect(screen.getByText(/omworkshop \/ authoring/i)).toBeTruthy();
    });
  });

  it("renders unavailable state", async () => {
    render(<ExampleModulePage client={createMockClient("unavailable")} />);
    await waitFor(() => {
      expect(screen.getByText(/Capability unavailable/i)).toBeTruthy();
    });
  });
});
