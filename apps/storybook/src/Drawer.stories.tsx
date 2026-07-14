import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { Button } from "@om/ui/button";
import { TextArea } from "@om/ui/text-area";
import { TextField } from "@om/ui/text-field";
import { Drawer } from "@om/ui/drawer";

const meta = {
  title: "UI/Drawer",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Drawer API. React Aria Components owns internal modal, focus, dismissal, and accessibility behavior; @om/ui owns the public modal overlay contract. Drawer is modal only, not a permanent navigation shell or bottom-sheet surface. Styling consumes @om/tokens. Appearance is not the final OM visual language."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <DrawerExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <Drawer title="Light mode drawer" trigger={<Button>Open light drawer</Button>}>
          Experimental light-mode drawer preview.
        </Drawer>
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <Drawer title="Dark mode drawer" trigger={<Button>Open dark drawer</Button>}>
          Experimental dark-mode drawer preview.
        </Drawer>
      </div>
      <div data-om-theme="light" data-om-liturgical-color="red" style={panelStyle}>
        <Drawer
          title="Liturgical accent drawer"
          description="Liturgical accents do not replace focus or boundary treatment."
          trigger={<Button>Open liturgical drawer</Button>}
        >
          Decorative accent behavior remains bounded.
        </Drawer>
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <Drawer title="High contrast drawer" trigger={<Button>Open high contrast drawer</Button>}>
          High contrast remains perceivable.
        </Drawer>
      </div>
      <div data-om-theme="light" data-om-contrast="forced" style={panelStyle}>
        <Drawer title="Forced colors drawer" trigger={<Button>Open forced colors drawer</Button>}>
          Forced colors retains the surface and controls.
        </Drawer>
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <Drawer title="Enhanced focus drawer" trigger={<Button>Open enhanced focus drawer</Button>}>
          Enhanced focus remains visible.
        </Drawer>
      </div>
      <div data-om-theme="light" data-om-motion="reduced" style={panelStyle}>
        <Drawer title="Reduced motion drawer" trigger={<Button>Open reduced motion drawer</Button>}>
          Reduced motion minimizes translation treatment.
        </Drawer>
      </div>
      <div data-om-theme="light" data-om-text-scale="large" style={panelStyle}>
        <Drawer
          title="Large text drawer"
          footer={<Button>Close example action</Button>}
          trigger={<Button>Open large text drawer</Button>}
        >
          Large text should not clip the title, body, close button, or footer.
        </Drawer>
      </div>
    </div>
  )
};

function DrawerExamples(): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [rtlOpen, setRtlOpen] = useState(false);

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <p style={noteStyle}>
        Drawers are experimental modal overlays. They keep sidebars and application navigation out
        of scope and remain distinct from gesture-driven sheets.
      </p>
      <Drawer title="Basic end drawer" trigger={<Button>Open basic drawer</Button>}>
        Experimental Drawer preview content.
      </Drawer>
      <Drawer
        title="Start placement drawer"
        placement="start"
        trigger={<Button>Open start drawer</Button>}
      >
        Start placement enters from the logical start edge.
      </Drawer>
      <Drawer
        title="End placement drawer"
        placement="end"
        trigger={<Button>Open end drawer</Button>}
      >
        End placement enters from the logical end edge.
      </Drawer>
      <Drawer
        title="Top placement drawer"
        placement="top"
        trigger={<Button>Open top drawer</Button>}
      >
        Top placement enters from the top edge.
      </Drawer>
      <Drawer
        title="Bottom placement drawer"
        placement="bottom"
        trigger={<Button>Open bottom drawer</Button>}
      >
        Bottom placement enters from the bottom edge.
      </Drawer>
      <Drawer
        title="Controlled drawer"
        trigger={<Button>Open controlled drawer</Button>}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        Controlled drawer content.
      </Drawer>
      <Drawer
        title="Described drawer"
        description="Description is associated with the drawer."
        trigger={<Button>Open described drawer</Button>}
      >
        Description behavior is visible in the accessibility tree.
      </Drawer>
      <Drawer
        title="Footer drawer"
        footer={
          <>
            <Button variant="secondary">Cancel</Button>
            <Button>Save</Button>
          </>
        }
        trigger={<Button>Open footer drawer</Button>}
      >
        Footer actions are supplied as bounded content.
      </Drawer>
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <Drawer
          key={size}
          title={`${size.toUpperCase()} drawer`}
          size={size}
          trigger={<Button>{`Open ${size} drawer`}</Button>}
        >
          Size controls the drawer dimensions only.
        </Drawer>
      ))}
      <Drawer
        title="Nondismissable drawer"
        isDismissable={false}
        trigger={<Button>Open nondismissable drawer</Button>}
      >
        Outside interaction does not close this drawer.
      </Drawer>
      <Drawer
        title="Keyboard dismissal disabled"
        isKeyboardDismissDisabled
        trigger={<Button>Open keyboard locked drawer</Button>}
      >
        Escape does not close this drawer.
      </Drawer>
      <Drawer
        title="Hidden close button drawer"
        hideCloseButton
        footer={<Button>Footer action remains available</Button>}
        trigger={<Button>Open no-close drawer</Button>}
      >
        Consumers must provide another close path when hiding the close button.
      </Drawer>
      <Drawer
        title="Long content drawer"
        footer={<Button variant="secondary">Footer action</Button>}
        trigger={<Button>Open long content drawer</Button>}
      >
        {Array.from({ length: 80 }, (_, index) => (
          <p key={index}>Long scrolling drawer content line {index + 1}.</p>
        ))}
      </Drawer>
      <Drawer
        title="Form-like drawer"
        footer={
          <>
            <Button variant="secondary">Cancel</Button>
            <Button>Save</Button>
          </>
        }
        trigger={<Button>Open form drawer</Button>}
      >
        <TextField label="Example title" />
        <TextArea label="Example notes" />
      </Drawer>
      <Drawer title="Narrow viewport drawer" trigger={<Button>Open narrow drawer</Button>}>
        Narrow viewport containment remains usable.
      </Drawer>
      <div dir="rtl" style={rtlPanelStyle}>
        <Button onAction={() => setRtlOpen(true)}>Open RTL drawer</Button>
        <Drawer
          title="RTL start drawer"
          isOpen={rtlOpen}
          onOpenChange={setRtlOpen}
          placement="start"
        >
          Logical start enters from the inline end in RTL.
        </Drawer>
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

const rtlPanelStyle = {
  direction: "rtl",
  display: "grid",
  gap: "var(--om-primitive-space-4)",
  padding: "var(--om-primitive-space-4)",
  border: "var(--om-primitive-border-width-1) solid var(--om-semantic-border-decorative)"
} satisfies CSSProperties;

const noteStyle = {
  margin: 0
};
