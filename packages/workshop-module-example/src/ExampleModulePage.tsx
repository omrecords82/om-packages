import type { WorkshopClient } from "@om/workshop-sdk";
import type { WorkshopHostCapabilities, WorkshopHostStatus } from "@om/workshop-contracts";

import { useEffect, useState } from "react";

import { WorkshopSdkError, createWorkshopClient } from "@om/workshop-sdk";
import {
  CapabilityUnavailable,
  ModuleErrorBoundary,
  ModuleLoadingState,
  ModulePage,
  createErrorState
} from "@om/workshop-module-ui";

import { exampleModuleManifest } from "./manifest.js";

export type ExampleModulePageProps = {
  readonly client?: WorkshopClient;
};

type ViewState =
  | { readonly kind: "loading" }
  | {
      readonly kind: "success";
      readonly status: WorkshopHostStatus;
      readonly capabilities: WorkshopHostCapabilities;
    }
  | { readonly kind: "unavailable"; readonly capabilityId: string; readonly message: string }
  | {
      readonly kind: "error";
      readonly title: string;
      readonly message: string;
      readonly code?: string;
    };

export function ExampleModulePage({ client }: ExampleModulePageProps) {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    const workshopClient = client ?? createWorkshopClient();

    async function load() {
      setState({ kind: "loading" });
      try {
        const [status, capabilities] = await Promise.all([
          workshopClient.getHostStatus(),
          workshopClient.getHostCapabilities()
        ]);
        if (cancelled) {
          return;
        }
        const statusCapability = capabilities.capabilities.find(
          (item) => item.id === "host.status.read"
        );
        if (!statusCapability?.available) {
          setState({
            kind: "unavailable",
            capabilityId: "host.status.read",
            message: statusCapability?.reason ?? "host.status.read is unavailable"
          });
          return;
        }
        setState({ kind: "success", status, capabilities });
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof WorkshopSdkError && error.code === "CAPABILITY_UNAVAILABLE") {
          setState({
            kind: "unavailable",
            capabilityId: "host.status.read",
            message: error.message
          });
          return;
        }
        if (error instanceof WorkshopSdkError) {
          const errorState = createErrorState(
            "Unable to load host status",
            error.message,
            error.code
          );
          setState({
            kind: "error",
            title: errorState.title,
            message: errorState.message,
            ...(errorState.code === undefined ? {} : { code: errorState.code })
          });
          return;
        }
        const errorState = createErrorState(
          "Unable to load host status",
          error instanceof Error ? error.message : "Unknown error"
        );
        setState({
          kind: "error",
          title: errorState.title,
          message: errorState.message
        });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [client]);

  return (
    <ModuleErrorBoundary>
      <ModulePage
        title={exampleModuleManifest.displayName}
        {...(exampleModuleManifest.description === undefined
          ? {}
          : { description: exampleModuleManifest.description })}
      >
        {state.kind === "loading" ? <ModuleLoadingState /> : null}
        {state.kind === "unavailable" ? (
          <CapabilityUnavailable capabilityId={state.capabilityId} message={state.message} />
        ) : null}
        {state.kind === "error" ? (
          <div className="om-module-state om-module-state--error" role="alert" data-state="error">
            <h2 className="om-module-state__title">{state.title}</h2>
            <p className="om-module-state__body">
              {state.code ? `[${state.code}] ` : ""}
              {state.message}
            </p>
          </div>
        ) : null}
        {state.kind === "success" ? (
          <div className="om-module-state" data-state="success">
            <h2 className="om-module-state__title">Host status</h2>
            <p className="om-module-state__body">
              {state.status.systemKey} / {state.status.environmentKey} — API{" "}
              {state.status.hostApiVersion} — {state.status.healthy ? "healthy" : "unhealthy"}
            </p>
            <p className="om-module-state__body">
              Capabilities available:{" "}
              {state.capabilities.capabilities.filter((item) => item.available).length}/
              {state.capabilities.capabilities.length}
            </p>
          </div>
        ) : null}
      </ModulePage>
    </ModuleErrorBoundary>
  );
}
