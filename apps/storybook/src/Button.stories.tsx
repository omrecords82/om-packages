import type { Meta, StoryObj } from "@storybook/react-vite";

import "@om/tokens/css";
import "@om/ui/css";
import { Button } from "@om/ui/button";

const meta = {
  title: "UI/Button",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Button API. Behavior is built on React Aria Components; styling is controlled by @om/tokens and @om/ui. Appearance is not the final OM visual language."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Variants: Story = {
  render: () => (
    <div data-om-theme="light" style={storyGridStyle}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="quiet">Quiet</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  )
};

export const Sizes: Story = {
  render: () => (
    <div data-om-theme="light" style={storyGridStyle}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  )
};

export const States: Story = {
  render: () => (
    <div data-om-theme="light" style={storyGridStyle}>
      <Button isDisabled>Disabled</Button>
      <Button isPending accessibleLabel="Pending action">
        Pending
      </Button>
      <Button fullWidth>Full width</Button>
    </div>
  )
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <Button>Light mode</Button>
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <Button>Dark mode</Button>
      </div>
      <div data-om-theme="light" data-om-liturgical-color="red" style={panelStyle}>
        <Button variant="secondary">Liturgical overlay</Button>
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <Button>Enhanced focus</Button>
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <Button>High contrast</Button>
      </div>
    </div>
  )
};

const storyGridStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "32rem"
};

const panelStyle = {
  background: "var(--om-semantic-background-canvas)",
  color: "var(--om-semantic-text-primary)",
  padding: "var(--om-primitive-space-4)"
};
