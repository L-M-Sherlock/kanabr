import { type ReactElement, type ReactNode } from "react";
import { type FocusProps } from "../types.ts";

export type TabListProps = {
  readonly children?: readonly ReactElement<TabProps>[];
  readonly selectedIndex?: number;
  readonly onSelect?: (selectedIndex: number) => void;
} & FocusProps;

export type TabProps = {
  readonly children?: ReactNode;
  readonly disabled?: boolean;
  readonly label: ReactNode;
  readonly title?: string;
};
