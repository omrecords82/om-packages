export function joinClassNames(
  ...classNames: readonly (string | false | null | undefined)[]
): string | undefined {
  const joined = classNames.filter(Boolean).join(" ");
  return joined.length > 0 ? joined : undefined;
}

export function assertNonEmptyAccessibleLabel(label: string, componentName: string): void {
  if (label.trim().length === 0) {
    throw new Error(`${componentName} requires a non-empty accessibleLabel.`);
  }
}
