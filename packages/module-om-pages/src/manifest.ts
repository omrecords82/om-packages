import { defineWorkshopModule } from "@om/workshop-contracts";

export const omPagesModuleManifest = defineWorkshopModule({
  id: "@om/module-om-pages",
  version: "0.1.0",
  displayName: "OM Pages",
  description: "Edit real OM page source in a registered workspace with Monaco.",
  hostCompatibility: "^1.0.0",
  routes: [
    {
      id: "om-pages-source-editor",
      path: "/modules/om-pages/source-editor",
      title: "OM Pages Source Editor",
      elementExport: "OmPagesModulePage",
      requiredCapabilities: ["source.read", "workspace.read"],
      requiredPermissions: ["source.read", "workspace.read"]
    }
  ],
  navigation: [
    {
      id: "om-pages-source-nav",
      label: "OM Pages Editor",
      routeId: "om-pages-source-editor",
      order: 40
    }
  ],
  requiredCapabilities: ["source.read", "workspace.read"],
  requiredPermissions: ["source.read", "workspace.read"],
  featureFlags: [],
  diagnostic: {
    status: "ready",
    message: "OM Pages source editor module ready"
  }
});
