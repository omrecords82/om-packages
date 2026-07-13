import type { Meta, StoryObj } from "@storybook/react-vite";

import { BootstrapNotice } from "@om/ui";

const meta = {
  title: "Bootstrap/BootstrapNotice",
  component: BootstrapNotice,
  args: {
    label: "Orthodox Metrics package bootstrap"
  }
} satisfies Meta<typeof BootstrapNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
