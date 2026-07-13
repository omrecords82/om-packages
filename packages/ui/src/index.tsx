import { CURRENT_THEME_SCHEMA_VERSION } from "@om/contracts";
import { phase1aTokenSourceStatus } from "@om/tokens";
import type { CSSProperties, ReactElement } from "react";

export type BootstrapNoticeProps = {
  readonly label?: string;
};

/**
 * Bootstrap-only component proving React, token, and contract integration.
 * Not a stable public API and not a production OM primitive.
 */
export function BootstrapNotice({
  label = "Orthodox Metrics packages bootstrap"
}: BootstrapNoticeProps): ReactElement {
  const style = {
    border: "1px solid currentColor",
    paddingInline: "0.75rem"
  } satisfies CSSProperties;

  return (
    <section
      aria-label="Bootstrap package notice"
      data-om-schema-version={CURRENT_THEME_SCHEMA_VERSION}
      data-om-token-source={phase1aTokenSourceStatus.canonicalSource}
      style={style}
    >
      <strong>{label}</strong>
      <span> @om/contracts + @om/tokens</span>
    </section>
  );
}
