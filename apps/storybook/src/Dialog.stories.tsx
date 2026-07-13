import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { Button } from "@om/ui/button";
import { Dialog } from "@om/ui/dialog";

const meta = {
  title: "UI/Dialog",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Dialog API. React Aria Components owns internal modal, focus, and dismissal behavior; @om/ui owns the public contract. Styles consume @om/tokens. Appearance is not the final OM visual language."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <DialogExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <Dialog title="Light mode dialog" trigger={<Button>Open light dialog</Button>}>
          Experimental light-mode dialog preview.
        </Dialog>
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <Dialog title="Dark mode dialog" trigger={<Button>Open dark dialog</Button>}>
          Experimental dark-mode dialog preview.
        </Dialog>
      </div>
      <div data-om-theme="light" data-om-liturgical-color="red" style={panelStyle}>
        <Dialog
          title="Liturgical accent dialog"
          description="Liturgical accent does not replace focus or validation treatment."
          trigger={<Button>Open liturgical dialog</Button>}
        >
          Decorative accent behavior remains bounded.
        </Dialog>
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <Dialog title="High contrast dialog" trigger={<Button>Open high contrast dialog</Button>}>
          High contrast remains perceivable.
        </Dialog>
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <Dialog title="Enhanced focus dialog" trigger={<Button>Open enhanced focus dialog</Button>}>
          Enhanced focus remains visible.
        </Dialog>
      </div>
      <div data-om-theme="light" data-om-motion="reduced" style={panelStyle}>
        <Dialog title="Reduced motion dialog" trigger={<Button>Open reduced motion dialog</Button>}>
          Reduced motion minimizes transition treatment.
        </Dialog>
      </div>
      <div data-om-theme="light" data-om-text-scale="large" style={panelStyle}>
        <Dialog
          title="Large text dialog"
          footer={<Button>Close example action</Button>}
          trigger={<Button>Open large text dialog</Button>}
        >
          Large text should not clip the title, body, close button, or footer.
        </Dialog>
      </div>
    </div>
  )
};

function DialogExamples(): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <Dialog title="Basic dialog" trigger={<Button>Open basic dialog</Button>}>
        Experimental Dialog preview content.
      </Dialog>
      <Button onAction={() => setIsOpen(true)}>Open controlled dialog</Button>
      <Dialog title="Controlled dialog" isOpen={isOpen} onOpenChange={setIsOpen}>
        Controlled Dialog preview content.
      </Dialog>
      <Dialog
        title="Described dialog"
        description="Description is associated with the dialog."
        trigger={<Button>Open described dialog</Button>}
      >
        Description behavior is visible in the accessibility tree.
      </Dialog>
      <Dialog
        title="Footer dialog"
        footer={
          <>
            <Button variant="secondary">Cancel</Button>
            <Button>Save</Button>
          </>
        }
        trigger={<Button>Open footer dialog</Button>}
      >
        Footer actions are supplied as bounded content.
      </Dialog>
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <Dialog
          key={size}
          title={`${size.toUpperCase()} dialog`}
          size={size}
          trigger={<Button>{`Open ${size} dialog`}</Button>}
        >
          Size controls maximum width only.
        </Dialog>
      ))}
      <Dialog
        title="Nondismissable dialog"
        isDismissable={false}
        trigger={<Button>Open nondismissable dialog</Button>}
      >
        Outside interaction does not close this dialog.
      </Dialog>
      <Dialog
        title="Keyboard dismissal disabled"
        isKeyboardDismissDisabled
        trigger={<Button>Open keyboard locked dialog</Button>}
      >
        Escape does not close this dialog.
      </Dialog>
      <Dialog
        title="Hidden close button"
        hideCloseButton
        footer={<Button>Footer action remains available</Button>}
        trigger={<Button>Open no-close dialog</Button>}
      >
        Consumers must provide another close path when hiding the close button.
      </Dialog>
      <Dialog title="Long content dialog" trigger={<Button>Open long content dialog</Button>}>
        {Array.from({ length: 80 }, (_, index) => (
          <p key={index}>Long scrolling dialog content line {index + 1}.</p>
        ))}
      </Dialog>
    </div>
  );
}

const storyGridStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "38rem"
};

const panelStyle = {
  background: "var(--om-semantic-background-canvas)",
  color: "var(--om-semantic-text-primary)",
  display: "grid",
  gap: "var(--om-primitive-space-4)",
  padding: "var(--om-primitive-space-4)"
};
