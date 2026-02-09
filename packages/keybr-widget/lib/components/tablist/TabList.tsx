import { clsx } from "clsx";
import { Children, type ReactElement, type ReactNode, useState } from "react";
import { useHotkeysHandler } from "../../hooks/use-hotkeys.ts";
import * as styles from "./TabList.module.less";
import { type TabListProps, type TabProps } from "./TabList.types.ts";

export function TabList({
  disabled,
  children,
  selectedIndex = 0,
  onBlur,
  onFocus,
  onSelect,
}: TabListProps): ReactNode {
  const [focused, setFocused] = useState(false);
  const tabs = Children.toArray(children) as ReactElement<TabProps>[];
  const selectedTab = tabs[selectedIndex];

  const isTabDisabled = (index: number): boolean => {
    const tab = tabs[index];
    return disabled || tab == null || tab.props.disabled === true;
  };

  const findEnabled = (
    startIndex: number,
    direction: -1 | 1,
  ): number | null => {
    const { length } = tabs;
    if (length === 0) {
      return null;
    }
    for (let i = 0; i < length; i++) {
      const index = (startIndex + direction * (i + 1) + length) % length;
      if (!isTabDisabled(index)) {
        return index;
      }
    }
    return null;
  };

  const selectPrev = () => {
    const index = findEnabled(selectedIndex, -1);
    if (index != null && onSelect != null) {
      onSelect(index);
    }
  };
  const selectNext = () => {
    const index = findEnabled(selectedIndex, 1);
    if (index != null && onSelect != null) {
      onSelect(index);
    }
  };
  const hotkeys = useHotkeysHandler({
    ["ArrowLeft"]: selectPrev,
    ["ArrowUp"]: selectPrev,
    ["ArrowRight"]: selectNext,
    ["ArrowDown"]: selectNext,
  });
  const items: ReactNode[] = [];
  items.push(
    <span
      key="spacer-first"
      className={clsx(styles.spacer, styles.spacer_first)}
    />,
  );
  tabs.forEach((tab, index) => {
    const selected = tab === selectedTab;
    const itemDisabled = isTabDisabled(index);
    if (index > 0) {
      items.push(
        <span
          key={`spacer-${index}`}
          className={clsx(styles.spacer, styles.spacer_middle)}
        />,
      );
    }
    items.push(
      <span
        key={`item-${index}`}
        ref={(element) => {
          if (!itemDisabled && focused && selected) {
            element?.focus();
          }
        }}
        className={clsx(
          styles.item,
          selected ? styles.item_active : styles.item_inactive,
          itemDisabled && styles.disabled,
          itemDisabled && styles.item_disabled,
        )}
        tabIndex={!itemDisabled && selected ? 0 : undefined}
        title={tab.props.title}
        onFocus={(event) => {
          setFocused(true);
          if (onFocus != null) {
            onFocus(event);
          }
        }}
        onBlur={(event) => {
          setFocused(false);
          if (onBlur != null) {
            onBlur(event);
          }
        }}
        onClick={(event) => {
          event.preventDefault();
          if (!itemDisabled && onSelect != null) {
            onSelect(index);
            setFocused(true);
          }
        }}
        onKeyDown={!itemDisabled ? hotkeys : undefined}
      >
        {tab.props.label}
      </span>,
    );
  });
  items.push(
    <span
      key="spacer-last"
      className={clsx(styles.spacer, styles.spacer_last)}
    />,
  );
  return (
    <>
      <div className={styles.root}>{items}</div>
      {selectedTab.props.children}
    </>
  );
}

export function Tab(props: TabProps): ReactNode {
  return null;
}
