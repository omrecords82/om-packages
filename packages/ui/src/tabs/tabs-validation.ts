import type {
  TabItem,
  TabsActivationMode,
  TabsOrientation,
  TabsPanelMounting
} from "../shared/tabs-types.js";

const orientations = new Set<TabsOrientation>(["horizontal", "vertical"]);
const activationModes = new Set<TabsActivationMode>(["automatic", "manual"]);
const panelMountingModes = new Set<TabsPanelMounting>(["active", "all"]);

export function validateTabsConfiguration({
  accessibleLabel,
  items,
  selectedId,
  defaultSelectedId,
  orientation,
  activationMode,
  panelMounting
}: {
  readonly accessibleLabel: string;
  readonly items: readonly TabItem[];
  readonly selectedId: string | null | undefined;
  readonly defaultSelectedId: string | null | undefined;
  readonly orientation: TabsOrientation;
  readonly activationMode: TabsActivationMode;
  readonly panelMounting: TabsPanelMounting;
}): void {
  if (accessibleLabel.trim().length === 0) {
    throw new Error("Tabs require a non-empty accessibleLabel.");
  }

  if (!orientations.has(orientation)) {
    throw new Error(`Unsupported Tabs orientation: ${orientation}`);
  }

  if (!activationModes.has(activationMode)) {
    throw new Error(`Unsupported Tabs activationMode: ${activationMode}`);
  }

  if (!panelMountingModes.has(panelMounting)) {
    throw new Error(`Unsupported Tabs panelMounting mode: ${panelMounting}`);
  }

  validateTabItems(items);
  assertKnownDefaultSelectedId(defaultSelectedId, items);
  warnUnknownControlledSelectedId(selectedId, items);

  if (items.length === 0) {
    warnDevelopment("Tabs contains no tab items.");
  } else if (items.every((item) => item.isDisabled === true)) {
    warnDevelopment("Tabs contains only disabled tab items.");
  }
}

export function validateTabItems(items: readonly TabItem[]): void {
  const ids = new Set<string>();
  const labels = new Set<string>();
  const duplicateLabels = new Set<string>();

  for (const item of items) {
    if (item.id.trim().length === 0) {
      throw new Error("Tab items require non-empty string ids.");
    }

    if (ids.has(item.id)) {
      throw new Error(`Tab item ids must be unique: ${item.id}`);
    }
    ids.add(item.id);

    if (item.label.trim().length === 0) {
      throw new Error("Tab items require non-empty labels.");
    }

    if (labels.has(item.label)) {
      duplicateLabels.add(item.label);
    }
    labels.add(item.label);
  }

  for (const label of duplicateLabels) {
    warnDevelopment(`Tabs contains duplicate tab labels: ${label}`);
  }
}

export function assertKnownDefaultSelectedId(
  defaultSelectedId: string | null | undefined,
  items: readonly TabItem[]
): void {
  if (defaultSelectedId === undefined || defaultSelectedId === null) {
    return;
  }

  if (!items.some((item) => item.id === defaultSelectedId)) {
    throw new Error(`Tabs defaultSelectedId must match a tab item id: ${defaultSelectedId}`);
  }
}

export function warnUnknownControlledSelectedId(
  selectedId: string | null | undefined,
  items: readonly TabItem[]
): void {
  if (
    selectedId === undefined ||
    selectedId === null ||
    items.some((item) => item.id === selectedId)
  ) {
    return;
  }

  warnDevelopment(`Tabs selectedId does not match a tab item id: ${selectedId}`);
}

export function getKnownSelectedId(
  selectedId: string | null | undefined,
  items: readonly TabItem[]
): string | null | undefined {
  if (selectedId === undefined || selectedId === null) {
    return selectedId;
  }

  return items.some((item) => item.id === selectedId) ? selectedId : null;
}

export function getFirstEnabledTabId(items: readonly TabItem[]): string | null {
  return items.find((item) => item.isDisabled !== true)?.id ?? null;
}

function warnDevelopment(message: string): void {
  const runtime = globalThis as { process?: { env?: { NODE_ENV?: string } } };
  if (runtime.process?.env?.NODE_ENV !== "production") {
    console.warn(message);
  }
}
