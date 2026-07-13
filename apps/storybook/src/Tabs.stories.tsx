import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { Button } from "@om/ui/button";
import { Tabs } from "@om/ui/tabs";
import type { TabItem } from "@om/ui/tabs";
import { TextField } from "@om/ui/text-field";

const panelContentStyle = {
  display: "grid",
  gap: "var(--om-primitive-space-4)"
};

const baseItems = [
  {
    id: "overview",
    label: "Overview",
    content: (
      <div style={panelContentStyle}>
        <p>Overview panel for experimental Tabs behavior.</p>
        <Button>Review overview</Button>
      </div>
    )
  },
  {
    id: "records",
    label: "Records",
    content: (
      <div style={panelContentStyle}>
        <TextField label="Example record filter" />
        <Button>Apply filter</Button>
      </div>
    )
  },
  {
    id: "activity",
    label: "Activity",
    content: <p>Activity panel with representative non-production content.</p>
  }
] as const satisfies readonly TabItem[];

const disabledItems = [
  ...baseItems,
  {
    id: "disabled",
    label: "Disabled",
    content: "Disabled panel",
    isDisabled: true
  }
] as const satisfies readonly TabItem[];

const allDisabledItems = [
  {
    id: "disabled-one",
    label: "Disabled one",
    content: "Disabled one",
    isDisabled: true
  },
  {
    id: "disabled-two",
    label: "Disabled two",
    content: "Disabled two",
    isDisabled: true
  }
] as const satisfies readonly TabItem[];

const longLabelItems = [
  {
    id: "long-one",
    label: "Long administrative workflow label one",
    content: "Long label one panel"
  },
  {
    id: "long-two",
    label: "Long administrative workflow label two",
    content: "Long label two panel"
  },
  {
    id: "long-three",
    label: "Long administrative workflow label three",
    content: "Long label three panel"
  }
] as const satisfies readonly TabItem[];

const scrollingItems = Array.from({ length: 14 }, (_, index) => {
  const itemNumber = String(index + 1);
  return {
    id: `scroll-${itemNumber}`,
    label: `Section ${itemNumber}`,
    content: `Scrollable tabs panel ${itemNumber}.`
  };
}) satisfies readonly TabItem[];

const meta = {
  title: "UI/Tabs",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Tabs API. React Aria Components owns internal selection, keyboard, focus, and ARIA behavior; @om/ui owns the public string-ID item contract. Styles consume @om/tokens. Appearance is not the final OM visual language. Router synchronization, icons, badges, closable tabs, reorderable tabs, wizards, steppers, and overflow menus remain deferred."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <TabsExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <Tabs accessibleLabel="Light mode sections" items={baseItems} />
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <Tabs accessibleLabel="Dark mode sections" items={baseItems} />
      </div>
      <div data-om-theme="light" data-om-liturgical-color="red" style={panelStyle}>
        <Tabs accessibleLabel="Liturgical sections" items={baseItems} />
        <p style={noteStyle}>Liturgical accents do not replace focus or selected-state clarity.</p>
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <Tabs accessibleLabel="High contrast sections" items={baseItems} />
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <Tabs accessibleLabel="Enhanced focus sections" items={baseItems} />
      </div>
      <div data-om-theme="light" data-om-motion="reduced" style={panelStyle}>
        <Tabs accessibleLabel="Reduced motion sections" items={baseItems} />
      </div>
      <div data-om-theme="light" data-om-text-scale="large" style={panelStyle}>
        <Tabs accessibleLabel="Large text sections" items={longLabelItems} />
      </div>
    </div>
  )
};

function TabsExamples(): ReactElement {
  const [selectedId, setSelectedId] = useState("records");

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <p style={noteStyle}>
        Tabs use stable string IDs and string labels. APIs are experimental and not finalized OM
        screen designs.
      </p>
      <Tabs accessibleLabel="Default horizontal" items={baseItems} />
      <Tabs accessibleLabel="Vertical sections" items={baseItems} orientation="vertical" />
      <Tabs
        accessibleLabel="Controlled sections"
        items={baseItems}
        selectedId={selectedId}
        onSelectionChange={setSelectedId}
      />
      <p aria-live="polite" style={noteStyle}>
        Selected tab: {selectedId}
      </p>
      <Tabs accessibleLabel="Manual activation" items={baseItems} activationMode="manual" />
      <Tabs accessibleLabel="Automatic activation" items={baseItems} activationMode="automatic" />
      <Tabs accessibleLabel="Disabled tab" items={disabledItems} />
      <Tabs accessibleLabel="Globally disabled" items={baseItems} isDisabled />
      <Tabs accessibleLabel="All disabled" items={allDisabledItems} />
      <Tabs accessibleLabel="Empty tabs" items={[]} />
      <Tabs accessibleLabel="Active panel mounting" items={baseItems} panelMounting="active" />
      <Tabs accessibleLabel="All panel mounting" items={baseItems} panelMounting="all" />
      <Tabs accessibleLabel="Long labels" items={longLabelItems} />
      <div style={narrowStyle}>
        <Tabs accessibleLabel="Narrow scrolling tabs" items={scrollingItems} />
      </div>
    </div>
  );
}

const storyGridStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "48rem"
};

const panelStyle = {
  background: "var(--om-semantic-background-canvas)",
  color: "var(--om-semantic-text-primary)",
  display: "grid",
  gap: "var(--om-primitive-space-4)",
  padding: "var(--om-primitive-space-4)"
};

const narrowStyle = {
  border: "var(--om-primitive-border-width-1) solid var(--om-semantic-border-decorative)",
  maxWidth: "18rem",
  padding: "var(--om-primitive-space-4)"
};

const noteStyle = {
  margin: 0
};
