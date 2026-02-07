import { type ReactNode } from "react";
import * as styles from "./ChartWrapper.module.less";

export function ChartWrapper({
  children,
  scrollX = false,
}: {
  children: ReactNode;
  scrollX?: boolean;
}) {
  const className = scrollX ? `${styles.root} ${styles.scrollX}` : styles.root;
  return <div className={className}>{children}</div>;
}
