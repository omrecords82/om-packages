import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { AlertDialog } from "@om/ui/alert-dialog";
import { Button } from "@om/ui/button";

const meta = {
  title: "UI/AlertDialog",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM AlertDialog API for future replacement of ad-hoc confirmation patterns. React Aria Components owns internal modal and focus behavior; @om/ui owns the public confirmation contract. No OM application migration is included."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <AlertDialogExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <AlertDialog
          title="Light confirmation"
          description="Confirm a reversible experimental action."
          confirmLabel="Confirm"
          onConfirm={() => undefined}
          trigger={<Button>Open light alert dialog</Button>}
        />
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <AlertDialog
          title="Dark confirmation"
          description="Confirm a reversible experimental action."
          confirmLabel="Confirm"
          onConfirm={() => undefined}
          trigger={<Button>Open dark alert dialog</Button>}
        />
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <AlertDialog
          title="High contrast confirmation"
          description="High contrast remains perceivable."
          confirmLabel="Confirm"
          onConfirm={() => undefined}
          trigger={<Button>Open high contrast alert dialog</Button>}
        />
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <AlertDialog
          title="Enhanced focus confirmation"
          description="Enhanced focus remains visible."
          confirmLabel="Confirm"
          onConfirm={() => undefined}
          trigger={<Button>Open enhanced focus alert dialog</Button>}
        />
      </div>
    </div>
  )
};

function AlertDialogExamples(): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [status, setStatus] = useState("No confirmation yet.");

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <p aria-live="polite">{status}</p>
      <AlertDialog
        title="Confirm this action?"
        description="This experimental confirmation can be cancelled safely."
        confirmLabel="Confirm"
        onConfirm={() => setStatus("Confirmation action invoked.")}
        trigger={<Button>Open confirmation alert</Button>}
      />
      <AlertDialog
        title="Review this warning?"
        description="This experimental warning requires an explicit choice."
        confirmLabel="Continue"
        intent="warning"
        onConfirm={() => undefined}
        trigger={<Button>Open warning alert</Button>}
      />
      <AlertDialog
        title="Delete this item?"
        description="This experimental destructive action cannot be undone."
        confirmLabel="Delete"
        intent="destructive"
        onConfirm={() => undefined}
        trigger={<Button variant="destructive">Open destructive alert</Button>}
      />
      <Button onAction={() => setIsOpen(true)}>Open controlled alert</Button>
      <AlertDialog
        title="Controlled alert"
        description="Open state is controlled by the story."
        confirmLabel="Confirm"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={() => undefined}
      />
      <Button onAction={() => setManualOpen(true)}>Open manual alert</Button>
      <AlertDialog
        title="Manual close alert"
        description="Confirm does not close automatically in manual mode."
        confirmLabel="Confirm"
        confirmBehavior="manual"
        isOpen={manualOpen}
        onOpenChange={setManualOpen}
        onConfirm={() => undefined}
      />
      <AlertDialog
        title="Pending confirmation"
        description="Pending confirmation blocks cancel, confirm, and Escape dismissal."
        confirmLabel="Saving"
        isConfirmPending
        onConfirm={() => undefined}
        trigger={<Button>Open pending alert</Button>}
      />
      <AlertDialog
        title="Confirm focus alert"
        description="Confirm receives initial focus only when requested."
        confirmLabel="Proceed"
        initialFocus="confirm"
        onConfirm={() => undefined}
        trigger={<Button>Open confirm-focus alert</Button>}
      />
      <AlertDialog
        title="Long consequence description"
        description="This longer experimental consequence description demonstrates wrapping behavior on narrow screens and under increased text scale. The text is sample content only."
        confirmLabel="Acknowledge"
        onConfirm={() => undefined}
        trigger={<Button>Open long alert</Button>}
      />
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
