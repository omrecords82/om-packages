import type { BootstrapContract } from "@om/contracts";
import { bootstrapContract } from "@om/contracts";
import { bootstrapTokens } from "@om/tokens";
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
  const contract: BootstrapContract = bootstrapContract;
  const style = {
    background: bootstrapTokens.colorSurface,
    color: bootstrapTokens.colorText,
    paddingInline: bootstrapTokens.spaceInline
  } satisfies CSSProperties;

  return (
    <section aria-label="Bootstrap package notice" data-om-phase={contract.phase} style={style}>
      <strong>{label}</strong>
      <span> {contract.packageName}</span>
    </section>
  );
}
