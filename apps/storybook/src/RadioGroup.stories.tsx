import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { Radio } from "@om/ui/radio";
import { RadioGroup } from "@om/ui/radio-group";

const meta = {
  title: "UI/RadioGroup",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM RadioGroup and Radio APIs. Behavior is built on React Aria Components internally; styles consume @om/tokens through @om/ui. Appearance is not the final OM visual language."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <RadioGroupExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <RadioGroup label="Light mode" defaultValue="one">
          <Radio value="one">One</Radio>
          <Radio value="two">Two</Radio>
        </RadioGroup>
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <RadioGroup label="Dark mode" defaultValue="one">
          <Radio value="one">One</Radio>
          <Radio value="two">Two</Radio>
        </RadioGroup>
      </div>
    </div>
  )
};

function RadioGroupExamples(): ReactElement {
  const [value, setValue] = useState("baptism");

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <p style={noteStyle}>
        Keyboard navigation follows the native radio pattern: tab enters the group and arrow keys
        move between options.
      </p>
      <RadioGroup label="Default vertical" defaultValue="baptism">
        <Radio value="baptism">Baptism</Radio>
        <Radio value="marriage">Marriage</Radio>
      </RadioGroup>
      <RadioGroup label="Horizontal" orientation="horizontal" defaultValue="baptism">
        <Radio value="baptism">Baptism</Radio>
        <Radio value="marriage">Marriage</Radio>
      </RadioGroup>
      <RadioGroup label="Controlled" value={value} onValueChange={setValue}>
        <Radio value="baptism">Controlled baptism</Radio>
        <Radio value="marriage">Controlled marriage</Radio>
      </RadioGroup>
      <RadioGroup label="Required" isRequired>
        <Radio value="one">One</Radio>
        <Radio value="two">Two</Radio>
      </RadioGroup>
      <RadioGroup label="Disabled group" isDisabled>
        <Radio value="one">Disabled one</Radio>
        <Radio value="two">Disabled two</Radio>
      </RadioGroup>
      <RadioGroup label="Disabled option" defaultValue="one">
        <Radio value="one">Enabled option</Radio>
        <Radio value="two" isDisabled>
          Disabled option
        </Radio>
      </RadioGroup>
      <RadioGroup label="Read only" isReadOnly defaultValue="one">
        <Radio value="one">Read-only one</Radio>
        <Radio value="two">Read-only two</Radio>
      </RadioGroup>
      <RadioGroup label="Invalid" isInvalid errorMessage="Example radio group error.">
        <Radio value="one">Invalid one</Radio>
        <Radio value="two">Invalid two</Radio>
      </RadioGroup>
      <RadioGroup label="Description" description="Description is associated with the group.">
        <Radio value="one" description="Option description is associated.">
          Described option
        </Radio>
        <Radio value="two">Other option</Radio>
      </RadioGroup>
    </div>
  );
}

const storyGridStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "36rem"
};

const panelStyle = {
  background: "var(--om-semantic-background-canvas)",
  color: "var(--om-semantic-text-primary)",
  padding: "var(--om-primitive-space-4)"
};

const noteStyle = {
  margin: 0
};
