import type { Meta, StoryObj } from "@storybook/react-vite";
import type { WorkshopClient } from "@om/workshop-sdk";

import "@om/tokens/css";
import "@om/ui/css";
import "@om/workshop-module-ui/css";
import { ExampleModulePage } from "@om/workshop-module-example";

function mockClient(mode: "success" | "unavailable" | "error"): WorkshopClient {
  if (mode === "success") {
    return {
      getHostStatus: () =>
        Promise.resolve({
          hostApiVersion: "1.0.0",
          environmentKey: "authoring",
          systemKey: "omworkshop",
          healthy: true,
          message: "Storybook fixture host"
        }),
      getHostCapabilities: () =>
        Promise.resolve({
          hostApiVersion: "1.0.0",
          capabilities: [
            { id: "host.status.read", available: true },
            { id: "host.git.write", available: false, reason: "fixture" }
          ],
          permissions: ["workshop.module.read"]
        }),
      hasCapability: (id) => Promise.resolve(id === "host.status.read")
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
            {
              id: "host.status.read",
              available: false,
              reason: "disabled in Storybook fixture"
            }
          ],
          permissions: []
        }),
      hasCapability: () => Promise.resolve(false)
    };
  }
  return {
    getHostStatus: () => Promise.reject(new Error("Simulated host failure")),
    getHostCapabilities: () => Promise.reject(new Error("Simulated host failure")),
    hasCapability: () => Promise.resolve(false)
  };
}

const meta = {
  title: "Workshop/ExampleModule",
  parameters: {
    docs: {
      description: {
        component:
          "Minimal @om/workshop-module-example page proving contracts, SDK client states, and module UI primitives."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Success: Story = {
  render: () => (
    <div data-om-theme="light">
      <ExampleModulePage client={mockClient("success")} />
    </div>
  )
};

export const CapabilityUnavailable: Story = {
  render: () => (
    <div data-om-theme="light">
      <ExampleModulePage client={mockClient("unavailable")} />
    </div>
  )
};

export const ErrorState: Story = {
  render: () => (
    <div data-om-theme="light">
      <ExampleModulePage client={mockClient("error")} />
    </div>
  )
};
