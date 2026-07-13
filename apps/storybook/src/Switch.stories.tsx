import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { Switch } from "@om/ui/switch";

const meta = {
  title: "UI/Switch",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Switch API. Behavior is built on React Aria Components internally; styles consume @om/tokens through @om/ui. Appearance is not the final OM visual language."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <SwitchExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <Switch>Light mode</Switch>
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <Switch defaultSelected>Dark mode</Switch>
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <Switch defaultSelected>High contrast</Switch>
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <Switch>Enhanced focus</Switch>
      </div>
    </div>
  )
};

function SwitchExamples(): ReactElement {
  const [selected, setSelected] = useState(false);

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <Switch>Off</Switch>
      <Switch defaultSelected>On</Switch>
      <Switch isSelected={selected} onSelectionChange={setSelected}>
        Controlled
      </Switch>
      <Switch isRequired>Required</Switch>
      <Switch isDisabled>Disabled</Switch>
      <Switch isReadOnly defaultSelected>
        Read only
      </Switch>
      <Switch isInvalid errorMessage="Example switch error.">
        Invalid
      </Switch>
      <Switch description="Description is associated with the switch.">Description</Switch>
      <Switch size="sm">Small</Switch>
      <Switch size="md">Medium</Switch>
      <Switch size="lg">Large</Switch>
    </div>
  );
}

const storyGridStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "34rem"
};

const panelStyle = {
  background: "var(--om-semantic-background-canvas)",
  color: "var(--om-semantic-text-primary)",
  display: "grid",
  gap: "var(--om-primitive-space-4)",
  padding: "var(--om-primitive-space-4)"
};
