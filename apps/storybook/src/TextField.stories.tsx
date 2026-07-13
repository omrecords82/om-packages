import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { TextField } from "@om/ui/text-field";

const meta = {
  title: "UI/TextField",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM TextField API. Behavior is built on React Aria Components internally; styling is controlled by @om/tokens and @om/ui. Appearance is not the final OM visual language."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <TextFieldExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <TextField label="Light mode" defaultValue="Light" />
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <TextField label="Dark mode" defaultValue="Dark" />
      </div>
      <div data-om-theme="light" data-om-liturgical-color="red" style={panelStyle}>
        <TextField label="Liturgical overlay" isInvalid errorMessage="Error stays protected." />
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <TextField label="High contrast" defaultValue="Contrast" />
      </div>
      <div data-om-theme="light" data-om-text-scale="large" style={panelStyle}>
        <TextField
          label="Large text"
          description="Description remains visible."
          isInvalid
          errorMessage="Error remains visible."
        />
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <TextField label="Enhanced focus" defaultValue="Focus" />
      </div>
      <div data-om-theme="light" style={panelStyle}>
        <p style={noteStyle}>Forced colors are supported through component CSS media queries.</p>
        <TextField label="Forced-color documentation" defaultValue="System colors" />
      </div>
    </div>
  )
};

function TextFieldExamples(): ReactElement {
  const [value, setValue] = useState("Controlled value");

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <TextField label="Default" />
      <TextField label="Placeholder" placeholder="Placeholder text is not a label" />
      <TextField label="Description" description="Description is associated with the input." />
      <TextField label="Required" isRequired />
      <TextField label="Disabled" isDisabled defaultValue="Disabled value" />
      <TextField label="Read only" isReadOnly defaultValue="Read-only value" />
      <TextField label="Invalid" isInvalid errorMessage="Example validation error." />
      <TextField label="Hidden search label" labelVisibility="visually-hidden" type="search" />
      <TextField label="Controlled" value={value} onValueChange={setValue} />
      <TextField label="Small" size="sm" />
      <TextField label="Medium" size="md" />
      <TextField label="Large" size="lg" />
      <TextField label="Email" type="email" autoComplete="email" inputMode="email" />
      <TextField label="Password" type="password" />
      <TextField label="Search" type="search" inputMode="search" />
      <TextField label="Telephone" type="tel" inputMode="tel" />
      <TextField label="Website" type="url" inputMode="url" />
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
  display: "grid",
  gap: "var(--om-primitive-space-4)",
  padding: "var(--om-primitive-space-4)"
};

const noteStyle = {
  margin: 0
};
