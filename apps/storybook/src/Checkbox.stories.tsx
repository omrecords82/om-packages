import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { Checkbox } from "@om/ui/checkbox";

const meta = {
  title: "UI/Checkbox",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Checkbox API. Behavior is built on React Aria Components internally; styles consume @om/tokens through @om/ui. Appearance is not the final OM visual language."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <CheckboxExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <Checkbox>Light mode</Checkbox>
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <Checkbox defaultSelected>Dark mode</Checkbox>
      </div>
      <div data-om-theme="light" data-om-liturgical-color="red" style={panelStyle}>
        <Checkbox isInvalid errorMessage="Validation stays protected.">
          Liturgical overlay
        </Checkbox>
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <Checkbox defaultSelected>High contrast</Checkbox>
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <Checkbox>Enhanced focus</Checkbox>
      </div>
      <div data-om-theme="light" data-om-text-scale="large" style={panelStyle}>
        <Checkbox
          isInvalid
          description="Description remains visible."
          errorMessage="Error remains visible."
        >
          Large text
        </Checkbox>
      </div>
    </div>
  )
};

function CheckboxExamples(): ReactElement {
  const [selected, setSelected] = useState(false);

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <Checkbox>Unselected</Checkbox>
      <Checkbox defaultSelected>Selected</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
      <Checkbox isSelected={selected} onSelectionChange={setSelected}>
        Controlled
      </Checkbox>
      <Checkbox isRequired>Required</Checkbox>
      <Checkbox isDisabled>Disabled</Checkbox>
      <Checkbox isReadOnly defaultSelected>
        Read only
      </Checkbox>
      <Checkbox isInvalid errorMessage="Example checkbox error.">
        Invalid
      </Checkbox>
      <Checkbox description="Description is associated with the checkbox.">Description</Checkbox>
      <Checkbox size="sm">Small</Checkbox>
      <Checkbox size="md">Medium</Checkbox>
      <Checkbox size="lg">Large</Checkbox>
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
