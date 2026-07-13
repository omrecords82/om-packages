const vendorOrTenantPattern =
  /(^|\.)(mui|modernize|tailwind|chakra|radix|reactAria|church\d+)(\.|$)/u;
const tokenPathPattern = /^[a-z][A-Za-z0-9]*(?:\.[a-z0-9][A-Za-z0-9]*)+$/u;

export function isCanonicalTokenPath(path: string): boolean {
  return (
    tokenPathPattern.test(path) &&
    !path.includes("..") &&
    !/\s/u.test(path) &&
    !path.startsWith("--") &&
    !vendorOrTenantPattern.test(path)
  );
}

export function isTokenReference(value: string): boolean {
  return value.startsWith("{") && value.endsWith("}");
}

export function getReferencedTokenPath(reference: string): string | undefined {
  if (!isTokenReference(reference)) {
    return undefined;
  }

  const path = reference.slice(1, -1);
  return isCanonicalTokenPath(path) ? path : undefined;
}
