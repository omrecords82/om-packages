import type { Meta, StoryObj } from "@storybook/react-vite";

import "@om/tokens/css";
import "@om/ui/css";
import { IconButton } from "@om/ui/icon-button";

const meta = {
  title: "UI/IconButton",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM IconButton API. Behavior composes OM Button on React Aria Components. No icon library is bundled. Accessible labels are required and shown in these examples."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Sizes: Story = {
  render: () => (
    <div data-om-theme="light" style={storyGridStyle}>
      <LabeledIconButton label="Small add action" size="sm" />
      <LabeledIconButton label="Medium add action" size="md" />
      <LabeledIconButton label="Large add action" size="lg" />
    </div>
  )
};

export const States: Story = {
  render: () => (
    <div data-om-theme="light" style={storyGridStyle}>
      <LabeledIconButton label="Disabled add action" isDisabled />
      <LabeledIconButton label="Pending add action" isPending />
    </div>
  )
};

function LabeledIconButton(props: {
  readonly label: string;
  readonly size?: "sm" | "md" | "lg";
  readonly isDisabled?: boolean;
  readonly isPending?: boolean;
}) {
  return (
    <div style={labeledControlStyle}>
      <IconButton
        icon={<span aria-hidden="true">+</span>}
        accessibleLabel={props.label}
        {...(props.size === undefined ? {} : { size: props.size })}
        {...(props.isDisabled === undefined ? {} : { isDisabled: props.isDisabled })}
        {...(props.isPending === undefined ? {} : { isPending: props.isPending })}
      />
      <span>{props.label}</span>
    </div>
  );
}

const storyGridStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "32rem"
};

const labeledControlStyle = {
  alignItems: "center",
  display: "flex",
  gap: "var(--om-primitive-space-4)"
};
