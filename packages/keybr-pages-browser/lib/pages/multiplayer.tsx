import { LoadingProgress } from "@keybr/pages-shared";
import { ResultLoader } from "@keybr/result-loader";
import { lazy, Suspense } from "react";
import { KEYBR_STATIC } from "../static.ts";
import { StaticNotice } from "../StaticNotice.tsx";

const MultiplayerPage = lazy(() =>
  import("@keybr/page-multiplayer").then((m) => ({
    default: m.MultiplayerPage,
  })),
);

export default function Page() {
  if (KEYBR_STATIC) {
    return <StaticNotice feature="Multiplayer" />;
  }
  return (
    <Suspense fallback={<LoadingProgress />}>
      <ResultLoader>
        <MultiplayerPage />
      </ResultLoader>
    </Suspense>
  );
}
