import type { Meta, StoryObj } from "@storybook/react-vite";

import "@om/tokens/css";
import "@om/ui/css";
import { Link } from "@om/ui/link";

const meta = {
  title: "UI/Link",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Link API. Behavior is built on React Aria Components; styling is controlled by @om/tokens and @om/ui. Appearance is not the final OM visual language."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Variants: Story = {
  render: () => (
    <div data-om-theme="light" style={storyGridStyle}>
      <Link href="#inline">Inline link</Link>
      <Link href="#standalone" variant="standalone">
        Standalone link
      </Link>
      <Link href="#quiet" variant="quiet">
        Quiet link
      </Link>
      <Link href="#disabled" isDisabled>
        Disabled link
      </Link>
      <Link href="https://orthodoxmetrics.com" target="_blank">
        External target
      </Link>
    </div>
  )
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <Link href="#light">Light link</Link>
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <Link href="#dark">Dark link</Link>
      </div>
    </div>
  )
};

const storyGridStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "32rem"
};

const panelStyle = {
  background: "var(--om-semantic-background-canvas)",
  color: "var(--om-semantic-text-primary)",
  padding: "var(--om-primitive-space-4)"
};
