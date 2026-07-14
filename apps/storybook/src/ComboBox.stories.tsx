import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useMemo, useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { Button } from "@om/ui/button";
import { ComboBox } from "@om/ui/combo-box";
import type { ComboBoxOption } from "@om/ui/combo-box";

const options = [
  {
    value: "baptism",
    label: "Baptism",
    description: "Local static option"
  },
  {
    value: "marriage",
    label: "Marriage"
  },
  {
    value: "chrismation",
    label: "Chrismation",
    isDisabled: true
  }
] as const satisfies readonly ComboBoxOption[];

const longOptions = Array.from({ length: 40 }, (_, index) => {
  const optionNumber = String(index + 1);
  return {
    value: `combo-option-${optionNumber}`,
    label: `Long combo box option label ${optionNumber} for scroll behavior`,
    description: "Experimental option description for preview only."
  };
}) satisfies readonly ComboBoxOption[];

const longLabels = [
  {
    value: "long-alpha",
    label: "Alpha option with a deliberately long descriptive label for wrap testing"
  },
  {
    value: "long-beta",
    label: "Beta option with a second verbose label that must remain readable"
  }
] as const satisfies readonly ComboBoxOption[];

const formOptions = [
  {
    value: "option-a",
    label: "Option A"
  },
  {
    value: "option-b",
    label: "Option B"
  }
] as const satisfies readonly ComboBoxOption[];

const meta = {
  title: "UI/ComboBox",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM ComboBox API. React Aria Components owns internal input, collection, keyboard, and overlay behavior; @om/ui owns the public string/null selection contract and local filtering. Styling consumes @om/tokens. Appearance is not the final OM visual language. Remote fetching, fuzzy search, grouped options, custom values, and multi-select remain deferred."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <ComboBoxExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <ComboBox label="Light mode" options={options} defaultSelectedValue="baptism" />
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <ComboBox label="Dark mode" options={options} defaultSelectedValue="marriage" />
      </div>
      <div data-om-theme="light" data-om-liturgical-color="red" style={panelStyle}>
        <ComboBox
          label="Liturgical overlay"
          options={options}
          isInvalid
          errorMessage="Validation and focus treatment stay protected."
        />
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <ComboBox label="High contrast" options={options} defaultSelectedValue="baptism" />
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <ComboBox label="Enhanced focus" options={options} />
      </div>
      <div data-om-theme="light" data-om-motion="reduced" style={panelStyle}>
        <ComboBox label="Reduced motion" options={options} />
      </div>
      <div data-om-theme="light" data-om-text-scale="large" style={panelStyle}>
        <ComboBox
          label="Large text"
          options={options}
          description="Label, input, options, description, and errors remain visible."
          isInvalid
          errorMessage="Large-text error remains visible."
        />
      </div>
    </div>
  )
};

function ComboBoxExamples(): ReactElement {
  const [controlledSelectedValue, setControlledSelectedValue] = useState<string | null>("marriage");
  const [controlledInputValue, setControlledInputValue] = useState("Mar");
  const [formResult, setFormResult] = useState("No submission yet.");

  const formAction = useMemo(
    () => (formData: FormData) => {
      const result = formData.get("combo-value");
      setFormResult(typeof result === "string" ? result : "empty");
    },
    []
  );

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <p style={noteStyle}>
        ComboBox combines a text input with static local options. Typed text is not a committed
        value. Filtering is deterministic and label-based. Remote loading and custom values remain
        deferred.
      </p>
      <ComboBox label="Basic static options" options={options} />
      <ComboBox label="Selected value" options={options} defaultSelectedValue="baptism" />
      <ComboBox
        label="Controlled selection"
        options={options}
        selectedValue={controlledSelectedValue}
        onSelectedValueChange={setControlledSelectedValue}
      />
      <ComboBox
        label="Controlled input"
        options={options}
        inputValue={controlledInputValue}
        onInputValueChange={setControlledInputValue}
      />
      <ComboBox
        label="Fully controlled"
        options={options}
        selectedValue={controlledSelectedValue}
        onSelectedValueChange={setControlledSelectedValue}
        inputValue={controlledInputValue}
        onInputValueChange={setControlledInputValue}
      />
      <ComboBox label="Required" options={options} isRequired />
      <ComboBox label="Disabled" options={options} isDisabled />
      <ComboBox label="Read only" options={options} defaultSelectedValue="baptism" isReadOnly />
      <ComboBox
        label="Invalid"
        options={options}
        isInvalid
        errorMessage="Example combo box error."
      />
      <ComboBox label="Description" options={options} description="Description is associated." />
      <ComboBox label="Hidden label" labelVisibility="visually-hidden" options={options} />
      <ComboBox label="Contains filtering" options={options} filterMode="contains" />
      <ComboBox label="Starts-with filtering" options={options} filterMode="starts-with" />
      <ComboBox
        label="Disabled option"
        options={[
          ...options,
          {
            value: "disabled-option",
            label: "Disabled option",
            description: "This option is visible but cannot be selected.",
            isDisabled: true
          }
        ]}
      />
      <ComboBox
        label="No matching results"
        options={options}
        defaultInputValue="zzz"
        noResultsMessage="No matching options."
      />
      <ComboBox label="Empty options" options={[]} />
      <ComboBox label="Long option list" options={longOptions} />
      <ComboBox label="Long labels" options={longLabels} />
      <ComboBox label="Small" options={options} size="sm" />
      <ComboBox label="Medium" options={options} size="md" />
      <ComboBox label="Large" options={options} size="lg" />
      <div style={formPanelStyle}>
        <form
          aria-label="Combo form"
          onSubmit={(event) => {
            event.preventDefault();
            formAction(new FormData(event.currentTarget));
          }}
        >
          <ComboBox
            label="Form submission demonstration"
            options={formOptions}
            name="combo-value"
            defaultSelectedValue="option-b"
          />
          <Button type="submit">Submit form</Button>
        </form>
        <p aria-live="polite" style={noteStyle}>
          Form result: {formResult}
        </p>
      </div>
      <div style={narrowPanelStyle}>
        <ComboBox
          label="Narrow viewport"
          options={longOptions}
          description="The listbox stays inside the viewport."
        />
      </div>
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

const formPanelStyle = {
  ...panelStyle,
  gap: "0.75rem"
};

const narrowPanelStyle = {
  ...panelStyle,
  maxWidth: "20rem"
};

const noteStyle = {
  margin: 0
};
