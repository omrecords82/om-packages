import type { Meta, StoryObj } from "@storybook/react-vite";

import "@om/tokens/css";
import "@om/ui/css";
import { FieldError } from "@om/ui/field-error";

const meta = {
  title: "UI/FieldError",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM FieldError API. React Aria Components is internal; error styling uses protected validation tokens. Appearance is not the final OM visual language."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => (
    <div data-om-theme="light" style={storyGridStyle}>
      <FieldError>Example field error.</FieldError>
    </div>
  )
};

const storyGridStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "32rem"
};
