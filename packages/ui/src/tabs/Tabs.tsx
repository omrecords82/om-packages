import { forwardRef, useMemo, useState } from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs
} from "react-aria-components";

import { joinClassNames } from "../shared/class-names.js";
import type { TabItem, TabsProps } from "../shared/tabs-types.js";
import {
  getFirstEnabledTabId,
  getKnownSelectedId,
  validateTabsConfiguration
} from "./tabs-validation.js";

const noSelectedTabKey = "__om-tabs-no-selection__";

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    accessibleLabel,
    items,
    selectedId,
    defaultSelectedId,
    onSelectionChange,
    orientation = "horizontal",
    activationMode = "automatic",
    panelMounting = "active",
    isDisabled = false,
    className,
    tabListClassName,
    tabClassName,
    panelClassName
  },
  ref
) {
  validateTabsConfiguration({
    accessibleLabel,
    items,
    selectedId,
    defaultSelectedId,
    orientation,
    activationMode,
    panelMounting
  });

  const isControlled = selectedId !== undefined;
  const initialSelectedId = useMemo(
    () => getInitialSelectedId(defaultSelectedId, items),
    [defaultSelectedId, items]
  );
  const [uncontrolledSelectedId, setUncontrolledSelectedId] = useState(initialSelectedId);
  const knownControlledSelectedId = getKnownSelectedId(selectedId, items);
  const hasEnabledTabs = items.some((item) => item.isDisabled !== true);
  const activeId =
    hasEnabledTabs || isDisabled
      ? isControlled
        ? knownControlledSelectedId
        : getKnownSelectedId(uncontrolledSelectedId, items)
      : null;
  const selectedKey = activeId ?? noSelectedTabKey;
  const disabledKeys = useMemo(
    () =>
      isDisabled
        ? items.map((item) => item.id)
        : items.filter((item) => item.isDisabled === true).map((item) => item.id),
    [isDisabled, items]
  );
  const visiblePanelItems =
    panelMounting === "all" ? items : items.filter((item) => item.id === activeId);
  const isEmpty = items.length === 0;

  return (
    <div
      ref={ref}
      data-om-component="tabs"
      data-om-orientation={orientation}
      data-om-activation-mode={activationMode}
      data-om-panel-mounting={panelMounting}
      data-om-disabled={isDisabled || undefined}
      data-om-empty={isEmpty || undefined}
      className={joinClassNames("om-tabs", className) ?? "om-tabs"}
    >
      <AriaTabs
        selectedKey={selectedKey}
        orientation={orientation}
        keyboardActivation={activationMode}
        disabledKeys={disabledKeys}
        isDisabled={isDisabled}
        onSelectionChange={(nextKey) => {
          if (isDisabled || typeof nextKey !== "string" || nextKey === noSelectedTabKey) {
            return;
          }

          if (!isControlled) {
            setUncontrolledSelectedId(nextKey);
          }

          if (nextKey !== activeId) {
            onSelectionChange?.(nextKey);
          }
        }}
      >
        <AriaTabList
          aria-label={accessibleLabel}
          className={joinClassNames("om-tabs__list", tabListClassName) ?? "om-tabs__list"}
        >
          {items.map((item) => (
            <AriaTab
              key={item.id}
              id={item.id}
              isDisabled={isDisabled || item.isDisabled === true}
              className={joinClassNames("om-tabs__tab", tabClassName) ?? "om-tabs__tab"}
              data-om-component="tab"
              data-om-selected={item.id === activeId || undefined}
              data-om-disabled={isDisabled || item.isDisabled === true || undefined}
            >
              <span className="om-tabs__tab-label">{item.label}</span>
              <span className="om-tabs__indicator" aria-hidden="true" />
            </AriaTab>
          ))}
        </AriaTabList>
        <div className="om-tabs__panels">
          {visiblePanelItems.map((item) => (
            <AriaTabPanel
              key={item.id}
              id={item.id}
              shouldForceMount={panelMounting === "all"}
              className={joinClassNames("om-tabs__panel", panelClassName) ?? "om-tabs__panel"}
              data-om-component="tab-panel"
              data-om-selected={item.id === activeId || undefined}
            >
              {item.content}
            </AriaTabPanel>
          ))}
        </div>
      </AriaTabs>
    </div>
  );
});

function getInitialSelectedId(
  defaultSelectedId: string | null | undefined,
  items: readonly TabItem[]
): string | null {
  if (defaultSelectedId !== undefined) {
    return defaultSelectedId;
  }

  return getFirstEnabledTabId(items);
}
