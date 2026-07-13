import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { TextArea } from "@om/ui/text-area";

const meta = {
  title: "UI/TextArea",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM TextArea API. Behavior is built on React Aria Components internally; styling is controlled by @om/tokens and @om/ui. Appearance is not the final OM visual language."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <TextAreaExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <TextArea label="Light mode" defaultValue="Light text area" />
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <TextArea label="Dark mode" defaultValue="Dark text area" />
      </div>
      <div data-om-theme="light" data-om-text-scale="large" style={panelStyle}>
        <TextArea
          label="Large text"
          description="Description remains available."
          isInvalid
          errorMessage="Error remains available."
        />
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <TextArea label="Enhanced focus" defaultValue="Focus" />
      </div>
    </div>
  )
};

function TextAreaExamples(): ReactElement {
  const [value, setValue] = useState("Controlled text");

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <TextArea label="Default" />
      <TextArea label="Description" description="Description is associated with the text area." />
      <TextArea label="Required" isRequired />
      <TextArea label="Disabled" isDisabled defaultValue="Disabled value" />
      <TextArea label="Read only" isReadOnly defaultValue="Read-only value" />
      <TextArea label="Invalid" isInvalid errorMessage="Example validation error." />
      <TextArea label="Controlled" value={value} onValueChange={setValue} />
      <TextArea label="Rows" rows={5} />
      <TextArea label="Resize none" resize="none" />
      <TextArea label="Resize vertical" resize="vertical" />
      <TextArea label="Resize horizontal" resize="horizontal" />
      <TextArea label="Resize both" resize="both" />
      <TextArea label="Small" size="sm" />
      <TextArea label="Medium" size="md" />
      <TextArea label="Large" size="lg" />
    </div>
  );
}

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
