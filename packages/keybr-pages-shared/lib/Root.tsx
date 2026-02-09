import { type ReactNode } from "react";

export function Root({
  children,
}: {
  readonly children?: ReactNode;
}): ReactNode {
  return <div id="root">{children}</div>;
}

Root.selector = `#root`;
