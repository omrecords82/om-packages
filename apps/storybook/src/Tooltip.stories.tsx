import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { Button } from "@om/ui/button";
import { IconButton } from "@om/ui/icon-button";
import { Tooltip } from "@om/ui/tooltip";
import type { TooltipPlacement } from "@om/ui/tooltip";

const placements = [
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
  "right",
  "right-start",
  "right-end"
] as const satisfies readonly TooltipPlacement[];

const meta = {
  title: "UI/Tooltip",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Tooltip API. React Aria Components owns internal hover, focus, dismissal, placement, and viewport behavior; @om/ui owns the public string-only content contract. Styles consume @om/tokens. Tooltip content supplements the trigger accessible name; it does not replace it. Tooltip is not a Popover or HoverCard and cannot contain interactive controls. Native disabled controls may not expose Tooltip interaction reliably."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <TooltipExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <Tooltip trigger={<Button>Light tooltip trigger</Button>} content="Light mode tooltip." />
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <Tooltip trigger={<Button>Dark tooltip trigger</Button>} content="Dark mode tooltip." />
      </div>
      <div data-om-theme="light" data-om-liturgical-color="red" style={panelStyle}>
        <Tooltip
          trigger={<Button>Liturgical tooltip trigger</Button>}
          content="Liturgical overlays do not replace trigger focus treatment."
        />
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <Tooltip
          trigger={<Button>High contrast tooltip trigger</Button>}
          content="High contrast keeps the tooltip boundary perceivable."
        />
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <Tooltip
          trigger={<Button>Enhanced focus tooltip trigger</Button>}
          content="Enhanced focus remains on the trigger."
        />
      </div>
      <div data-om-theme="light" data-om-motion="reduced" style={panelStyle}>
        <Tooltip
          trigger={<Button>Reduced motion tooltip trigger</Button>}
          content="Reduced motion minimizes entry and exit transitions."
        />
      </div>
      <div data-om-theme="light" data-om-text-scale="large" style={panelStyle}>
        <Tooltip
          trigger={<Button>Large text tooltip trigger</Button>}
          content="Large text tooltip content wraps rather than clipping."
        />
      </div>
    </div>
  )
};

function TooltipExamples(): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [activationCount, setActivationCount] = useState(0);

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <p style={noteStyle}>
        Tooltips are supplemental descriptions. Icon-only triggers need their own accessible names,
        and Tooltip content is never copied into aria-label.
      </p>
      <Tooltip
        trigger={
          <Button onAction={() => setActivationCount((count) => count + 1)}>
            Visible text trigger
          </Button>
        }
        content="Supplemental visible text trigger description."
        delay="immediate"
      />
      <p aria-live="polite" style={noteStyle}>
        Activated count: {activationCount}
      </p>
      <Tooltip
        trigger={
          <IconButton icon={<span aria-hidden="true">?</span>} accessibleLabel="Open help" />
        }
        content="Icon-only trigger has an independent accessible name."
        delay="immediate"
      />
      <Tooltip
        trigger={<Button>Immediate delay trigger</Button>}
        content="Immediate delay opens without an intentional wait."
        delay="immediate"
      />
      <Tooltip
        trigger={<Button>Standard delay trigger</Button>}
        content="Standard delay uses the package-owned 700ms opening delay."
      />
      <Tooltip
        trigger={<Button>Controlled tooltip trigger</Button>}
        content="Controlled Tooltip is open."
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
      <Button onAction={() => setIsOpen((nextOpen) => !nextOpen)}>Toggle controlled tooltip</Button>
      <Tooltip
        isDisabled
        trigger={<Button>Disabled Tooltip trigger</Button>}
        content="Disabled Tooltip behavior remains closed."
      />
      <Tooltip
        trigger={
          <button type="button" disabled>
            Native disabled trigger
          </button>
        }
        content="Native disabled controls may not expose Tooltip interaction reliably."
      />
      {placements.map((placement) => (
        <Tooltip
          key={placement}
          trigger={<Button>{`Placement ${placement}`}</Button>}
          content={`Preferred placement ${placement}.`}
          placement={placement}
          delay="immediate"
        />
      ))}
      <Tooltip
        trigger={<Button>Arrow shown trigger</Button>}
        content="Arrow is decorative and shown by default."
        delay="immediate"
      />
      <Tooltip
        trigger={<Button>Arrow hidden trigger</Button>}
        content="This Tooltip hides the decorative arrow."
        delay="immediate"
        showArrow={false}
      />
      <div style={narrowStyle}>
        <Tooltip
          trigger={<Button>Long content trigger</Button>}
          content="This is intentionally long supplemental Tooltip content to demonstrate wrapping inside narrow and zoomed viewports without adding interactive controls."
          delay="immediate"
        />
      </div>
      <div style={edgeStyle}>
        <Tooltip
          trigger={<Button>Viewport edge trigger</Button>}
          content="Placement may adjust near viewport edges."
          placement="right-end"
          delay="immediate"
        />
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
  maxWidth: "16rem",
  padding: "var(--om-primitive-space-4)"
};

const edgeStyle = {
  display: "flex",
  justifyContent: "flex-end",
  minHeight: "8rem",
  padding: "var(--om-primitive-space-4)"
};

const noteStyle = {
  margin: 0
};
