import { describe, expect, it } from "vitest";

import {
  defineWorkshopModule,
  parseWorkshopModuleManifest,
  safeParseWorkshopModuleManifest
} from "./manifest.js";

const validManifest = {
  id: "@om/workshop-module-example",
  version: "0.1.0",
  displayName: "Workshop Example",
  hostCompatibility: "^1.0.0",
  routes: [
    {
      id: "status",
      path: "/modules/example",
      title: "Example",
      elementExport: "ExampleModulePage",
      requiredCapabilities: ["host.status.read"],
      requiredPermissions: ["workshop.module.read"]
    }
  ],
  navigation: [
    {
      id: "example-nav",
      label: "Example",
      routeId: "status",
      order: 10
    }
  ],
  requiredCapabilities: ["host.status.read"],
  requiredPermissions: ["workshop.module.read"],
  featureFlags: [{ key: "example.demo", defaultEnabled: true }]
};

describe("@om/workshop-contracts manifest validation", () => {
  it("accepts a valid manifest via defineWorkshopModule", () => {
    const manifest = defineWorkshopModule(validManifest);
    expect(manifest.id).toBe("@om/workshop-module-example");
    expect(manifest.routes).toHaveLength(1);
    expect(Object.isFrozen(manifest)).toBe(true);
  });

  it("rejects invalid module ids", () => {
    const result = safeParseWorkshopModuleManifest({
      ...validManifest,
      id: "Not A Valid Id"
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid route paths", () => {
    expect(() =>
      parseWorkshopModuleManifest({
        ...validManifest,
        routes: [{ ...validManifest.routes[0], path: "relative/path" }]
      })
    ).toThrow();
  });

  it("rejects unknown capability identifiers", () => {
    const result = safeParseWorkshopModuleManifest({
      ...validManifest,
      requiredCapabilities: ["BAD CAP"]
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid permission identifiers", () => {
    const result = safeParseWorkshopModuleManifest({
      ...validManifest,
      requiredPermissions: ["***"]
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid host compatibility ranges", () => {
    const result = safeParseWorkshopModuleManifest({
      ...validManifest,
      hostCompatibility: "!!!"
    });
    expect(result.success).toBe(false);
  });

  it("rejects navigation that references a missing route", () => {
    const result = safeParseWorkshopModuleManifest({
      ...validManifest,
      navigation: [{ id: "broken", label: "Broken", routeId: "missing" }]
    });
    expect(result.success).toBe(false);
  });
});
