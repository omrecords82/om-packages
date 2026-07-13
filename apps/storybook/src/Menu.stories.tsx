import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { useState } from "react";
import "@om/tokens/css";
import "@om/ui/css";
import { Button } from "@om/ui/button";
import { IconButton } from "@om/ui/icon-button";
import { Menu } from "@om/ui/menu";
import type { MenuEntry } from "@om/ui/menu";

const basicItems = [
  {
    type: "action",
    id: "edit",
    label: "Edit",
    description: "Open the record editor."
  },
  {
    type: "action",
    id: "duplicate",
    label: "Duplicate"
  },
  {
    type: "separator",
    id: "primary-divider"
  },
  {
    type: "link",
    id: "details",
    label: "View details",
    description: "Open a non-production detail URL.",
    href: "/example/details"
  },
  {
    type: "action",
    id: "delete",
    label: "Delete",
    description: "Destructive action styling is protected from liturgical overlays.",
    intent: "destructive"
  }
] as const satisfies readonly MenuEntry[];

const longItems = Array.from({ length: 80 }, (_, index) => ({
  type: "action" as const,
  id: `long-action-${String(index + 1)}`,
  label: `Long menu action ${String(index + 1)}`,
  description: "Experimental scrolling menu item."
})) satisfies readonly MenuEntry[];

const placements = ["bottom-start", "bottom-end", "top-start", "top-end"] as const;

const meta = {
  title: "UI/Menu",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Menu API. React Aria Components owns internal collection, keyboard, typeahead, overlay, and focus behavior; @om/ui owns the public serializable item contract. Styles consume @om/tokens. Appearance is not the final OM visual language. Standalone Popover, submenus, ContextMenu, Menubar, router adapters, and icons remain deferred."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <MenuExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <Menu trigger={<Button>Light menu</Button>} items={basicItems} />
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <Menu trigger={<Button>Dark menu</Button>} items={basicItems} />
      </div>
      <div data-om-theme="light" data-om-liturgical-color="red" style={panelStyle}>
        <Menu
          trigger={<Button>Liturgical menu</Button>}
          items={basicItems}
          accessibleLabel="Open liturgical action menu"
        />
        <p style={noteStyle}>Liturgical color does not replace destructive or focus treatment.</p>
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <Menu trigger={<Button>High contrast menu</Button>} items={basicItems} />
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <Menu trigger={<Button>Enhanced focus menu</Button>} items={basicItems} />
      </div>
      <div data-om-theme="light" data-om-motion="reduced" style={panelStyle}>
        <Menu trigger={<Button>Reduced motion menu</Button>} items={basicItems} />
      </div>
      <div data-om-theme="light" data-om-text-scale="large" style={panelStyle}>
        <Menu trigger={<Button>Large text menu</Button>} items={basicItems} />
      </div>
    </div>
  )
};

function MenuExamples(): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [lastAction, setLastAction] = useState("No action invoked.");

  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <p style={noteStyle}>
        Menu entries are serializable action, link, and separator definitions. APIs are experimental
        and not final portal designs.
      </p>
      <Menu
        trigger={<Button>Basic action menu</Button>}
        items={basicItems}
        onAction={setLastAction}
      />
      <p aria-live="polite" style={noteStyle}>
        Last action: {lastAction}
      </p>
      <Menu
        trigger={<Button>Controlled menu</Button>}
        items={basicItems}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onAction={setLastAction}
      />
      <Button onAction={() => setIsOpen((nextOpen) => !nextOpen)}>Toggle controlled menu</Button>
      <Menu
        trigger={<Button>Link menu</Button>}
        items={[
          {
            type: "link",
            id: "safe-link",
            label: "Documentation link",
            href: "https://example.test/docs",
            target: "_blank"
          },
          {
            type: "link",
            id: "disabled-link",
            label: "Disabled link",
            href: "/disabled",
            isDisabled: true
          }
        ]}
      />
      <Menu
        trigger={<Button>Destructive action menu</Button>}
        items={[
          {
            type: "action",
            id: "archive",
            label: "Archive"
          },
          {
            type: "action",
            id: "delete",
            label: "Delete",
            description: "Destructive state is not color-only.",
            intent: "destructive"
          }
        ]}
      />
      <Menu
        trigger={<Button>Disabled item menu</Button>}
        items={[
          {
            type: "action",
            id: "active",
            label: "Active item"
          },
          {
            type: "action",
            id: "disabled",
            label: "Disabled item",
            isDisabled: true
          }
        ]}
      />
      <Menu trigger={<Button>Disabled menu</Button>} items={basicItems} isDisabled />
      <Menu
        trigger={<Button>Description menu</Button>}
        items={[
          {
            type: "action",
            id: "with-description",
            label: "Action with description",
            description: "Descriptions remain associated with the menu item."
          }
        ]}
      />
      <Menu
        trigger={<Button>Separator menu</Button>}
        items={[
          {
            type: "action",
            id: "first",
            label: "First action"
          },
          {
            type: "separator",
            id: "separator"
          },
          {
            type: "action",
            id: "second",
            label: "Second action"
          }
        ]}
      />
      <Menu trigger={<Button>Empty menu</Button>} items={[]} />
      <Menu
        trigger={
          <IconButton icon={<span aria-hidden="true">...</span>} accessibleLabel="More actions" />
        }
        items={basicItems}
      />
      {placements.map((placement) => (
        <Menu
          key={placement}
          trigger={<Button>{`Placement ${placement}`}</Button>}
          items={basicItems}
          placement={placement}
        />
      ))}
      <Menu trigger={<Button>Long scrolling menu</Button>} items={longItems} />
      <Menu
        trigger={<Button>Profile actions</Button>}
        items={[
          {
            type: "action",
            id: "open-profile",
            label: "Open profile"
          },
          {
            type: "action",
            id: "account-settings",
            label: "Account settings"
          },
          {
            type: "separator",
            id: "profile-divider"
          },
          {
            type: "action",
            id: "sign-out",
            label: "Sign out"
          }
        ]}
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

const noteStyle = {
  color: "var(--om-semantic-text-primary)",
  margin: 0
};
