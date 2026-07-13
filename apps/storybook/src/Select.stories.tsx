import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { Select } from "@om/ui/select";
import type { SelectOption } from "@om/ui/select";

const recordOptions = [
  {
    value: "baptism",
    label: "Baptism",
    description: "Sacramental baptism records"
  },
  {
    value: "marriage",
    label: "Marriage",
    description: "Marriage records"
  },
  {
    value: "chrismation",
    label: "Chrismation",
    description: "Chrismation records"
  }
] as const satisfies readonly SelectOption[];

const longOptions = Array.from({ length: 40 }, (_, index) => {
  const optionNumber = String(index + 1);
  return {
    value: `record-type-${optionNumber}`,
    label: `Long option label ${optionNumber} for scroll behavior`,
    description: "Experimental option description for preview only."
  };
}) satisfies readonly SelectOption[];

const meta = {
  title: "UI/Select",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Select API. React Aria Components owns internal selection and overlay behavior; @om/ui owns the public string/null value contract. Styles consume @om/tokens. Appearance is not the final OM visual language. ComboBox and search behavior remain deferred."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <SelectExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <Select label="Light mode" options={recordOptions} defaultValue="baptism" />
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <Select label="Dark mode" options={recordOptions} defaultValue="marriage" />
      </div>
      <div data-om-theme="light" data-om-liturgical-color="red" style={panelStyle}>
        <Select
          label="Liturgical overlay"
          options={recordOptions}
          isInvalid
          errorMessage="Validation and focus treatment stay protected."
        />
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <Select label="High contrast" options={recordOptions} defaultValue="baptism" />
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <Select label="Enhanced focus" options={recordOptions} />
      </div>
      <div data-om-theme="light" data-om-motion="reduced" style={panelStyle}>
        <Select label="Reduced motion" options={recordOptions} />
      </div>
      <div data-om-theme="light" data-om-text-scale="large" style={panelStyle}>
        <Select
          label="Large text"
          options={recordOptions}
          description="Label, trigger, options, description, and errors remain visible."
          isInvalid
          errorMessage="Large-text error remains visible."
        />
      </div>
    </div>
  )
};

function SelectExamples(): ReactElement {
  const [value, setValue] = useState<string | null>("marriage");

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <Select label="Placeholder" options={recordOptions} />
      <Select label="Selected value" options={recordOptions} defaultValue="baptism" />
      <Select label="Controlled" options={recordOptions} value={value} onValueChange={setValue} />
      <Select label="Required" options={recordOptions} isRequired />
      <Select label="Disabled" options={recordOptions} isDisabled />
      <Select label="Read only" options={recordOptions} defaultValue="baptism" isReadOnly />
      <Select
        label="Invalid"
        options={recordOptions}
        isInvalid
        errorMessage="Example select error."
      />
      <Select
        label="Description"
        options={recordOptions}
        description="Description is associated with the Select trigger."
      />
      <Select
        label="Hidden select label"
        labelVisibility="visually-hidden"
        options={recordOptions}
      />
      <Select
        label="Disabled option"
        options={[
          ...recordOptions,
          {
            value: "disabled-option",
            label: "Disabled option",
            description: "This option is visible but cannot be selected.",
            isDisabled: true
          }
        ]}
      />
      <Select label="Empty options" options={[]} description="No configured record types." />
      <Select label="Small" options={recordOptions} size="sm" />
      <Select label="Medium" options={recordOptions} size="md" />
      <Select label="Large" options={recordOptions} size="lg" />
      <Select label="Long option list" options={longOptions} />
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
  display: "grid",
  gap: "var(--om-primitive-space-4)",
  padding: "var(--om-primitive-space-4)"
};
