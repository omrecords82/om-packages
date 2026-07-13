import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";

import "@om/tokens/css";
import { supportedLiturgicalColors, tokenPathToCssCustomProperty } from "@om/tokens/tokens";

const roleTokens = [
  "semantic.background.canvas",
  "semantic.text.primary",
  "semantic.action.accent",
  "component.header.accent",
  "accessibility.focus.enhanced.width"
] as const;

function TokenArtifactsPreview() {
  return (
    <main aria-label="Experimental token artifact preview" style={previewRootStyle}>
      <h1 style={headingStyle}>Experimental token artifacts</h1>
      <p style={copyStyle}>
        Bootstrap token values remain experimental and are not a finalized Orthodox Metrics visual
        design system.
      </p>

      <section aria-label="Light and dark token examples" style={gridStyle}>
        <TokenSample title="Light scheme" theme="light" />
        <TokenSample title="Dark scheme" theme="dark" />
      </section>

      <section aria-label="Liturgical token identifiers" style={sectionStyle}>
        <h2 style={subheadingStyle}>Liturgical overlays</h2>
        <div style={chipGridStyle}>
          {supportedLiturgicalColors.map((color) => (
            <div key={color} data-om-liturgical-color={color} style={chipStyle}>
              {color}
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Accessibility token examples" style={gridStyle}>
        <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
          <h2 style={subheadingStyle}>High contrast</h2>
          <p style={copyStyle}>Attribute: data-om-contrast=&quot;high&quot;</p>
        </div>
        <div data-om-theme="light" data-om-motion="reduced" style={panelStyle}>
          <h2 style={subheadingStyle}>Reduced motion</h2>
          <p style={copyStyle}>Attribute and media-query support are generated.</p>
        </div>
        <div data-om-theme="light" data-om-text-scale="larger" style={panelStyle}>
          <h2 style={subheadingStyle}>Enlarged text</h2>
          <p style={copyStyle}>Attribute: data-om-text-scale=&quot;larger&quot;</p>
        </div>
        <div
          data-om-theme="light"
          data-om-focus-visibility="enhanced"
          data-om-color-independence="true"
          style={panelStyle}
        >
          <h2 style={subheadingStyle}>Enhanced focus</h2>
          <button style={buttonStyle}>Color-independent status</button>
        </div>
      </section>
    </main>
  );
}

function TokenSample(props: { readonly title: string; readonly theme: "light" | "dark" }) {
  return (
    <div data-om-theme={props.theme} style={panelStyle}>
      <h2 style={subheadingStyle}>{props.title}</h2>
      <dl style={definitionListStyle}>
        {roleTokens.map((path) => (
          <div key={path} style={definitionItemStyle}>
            <dt>{path}</dt>
            <dd>{tokenPathToCssCustomProperty(path)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const meta = {
  title: "Tokens/GeneratedArtifacts",
  component: TokenArtifactsPreview
} satisfies Meta<typeof TokenArtifactsPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};

const previewRootStyle = {
  maxWidth: "960px",
  color: "var(--om-semantic-text-primary)",
  fontFamily: "var(--om-primitive-typography-font-family-sans)"
} satisfies CSSProperties;

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "1rem",
  marginBlock: "1rem"
} satisfies CSSProperties;

const sectionStyle = {
  marginBlock: "1rem"
} satisfies CSSProperties;

const panelStyle = {
  background: "var(--om-semantic-background-canvas)",
  border: "var(--om-primitive-border-width-1) solid var(--om-semantic-border-decorative)",
  borderRadius: "var(--om-primitive-radius-2)",
  padding: "var(--om-primitive-space-4)"
} satisfies CSSProperties;

const chipGridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem"
} satisfies CSSProperties;

const chipStyle = {
  border: "var(--om-primitive-border-width-1) solid var(--om-component-header-accent)",
  borderRadius: "var(--om-primitive-radius-2)",
  padding: "0.375rem 0.625rem"
} satisfies CSSProperties;

const headingStyle = {
  fontSize: "1.25rem",
  margin: "0 0 0.5rem"
} satisfies CSSProperties;

const subheadingStyle = {
  fontSize: "1rem",
  margin: "0 0 0.5rem"
} satisfies CSSProperties;

const copyStyle = {
  margin: "0 0 0.75rem"
} satisfies CSSProperties;

const definitionListStyle = {
  display: "grid",
  gap: "0.5rem",
  margin: 0
} satisfies CSSProperties;

const definitionItemStyle = {
  display: "grid",
  gap: "0.125rem"
} satisfies CSSProperties;

const buttonStyle = {
  minHeight: "var(--om-primitive-size-control-md)",
  border: "var(--om-accessibility-focus-enhanced-width) solid var(--om-semantic-focus-ring)",
  background: "var(--om-semantic-action-accent)",
  color: "var(--om-semantic-background-canvas)"
} satisfies CSSProperties;
