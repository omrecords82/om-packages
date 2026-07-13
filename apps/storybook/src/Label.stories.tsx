import type { Meta, StoryObj } from "@storybook/react-vite";

import "@om/tokens/css";
import "@om/ui/css";
import { Label } from "@om/ui/label";

const meta = {
  title: "UI/Label",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Label API. React Aria Components is internal; token values are controlled by @om/tokens and @om/ui. Appearance is not the final OM visual language."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => (
    <div data-om-theme="light" style={storyGridStyle}>
      <Label htmlFor="example-visible">Visible label</Label>
      <Label htmlFor="example-required" isRequired>
        Required label
      </Label>
      <Label htmlFor="example-hidden" visibility="visually-hidden">
        Visually hidden label
      </Label>
    </div>
  )
};

const storyGridStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "32rem"
};
