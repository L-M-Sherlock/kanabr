import { LoadingProgress } from "@keybr/pages-shared";
import { lazy, Suspense } from "react";
import { KEYBR_STATIC } from "../static.ts";
import { StaticNotice } from "../StaticNotice.tsx";

const AccountPage = lazy(() =>
  import("@keybr/page-account").then((m) => ({ default: m.AccountPage })),
);

export default function Page() {
  if (KEYBR_STATIC) {
    return <StaticNotice feature="Account" />;
  }
  return (
    <Suspense fallback={<LoadingProgress />}>
      <AccountPage />
    </Suspense>
  );
}
