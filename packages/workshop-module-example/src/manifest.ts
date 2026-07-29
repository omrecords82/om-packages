import { defineWorkshopModule } from "@om/workshop-contracts";

export const exampleModuleManifest = defineWorkshopModule({
  id: "@om/workshop-module-example",
  version: "0.1.0",
  displayName: "Workshop Example",
  description: "Minimal example module that reads host status and capabilities.",
  hostCompatibility: "^1.0.0",
  routes: [
    {
      id: "example-status",
      path: "/modules/example",
      title: "Workshop Example",
      elementExport: "ExampleModulePage",
      requiredCapabilities: ["host.status.read"],
      requiredPermissions: ["workshop.module.read"]
    }
  ],
  navigation: [
    {
      id: "example-nav",
      label: "Example Module",
      routeId: "example-status",
      order: 100
    }
  ],
  requiredCapabilities: ["host.status.read"],
  requiredPermissions: ["workshop.module.read"],
  featureFlags: [
    {
      key: "example.showDiagnostics",
      defaultEnabled: true,
      description: "Show raw host status diagnostics on the example page."
    }
  ],
  diagnostic: {
    status: "ready",
    message: "Example module ready"
  }
});
