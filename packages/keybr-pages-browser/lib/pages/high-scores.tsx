import { LoadingProgress } from "@keybr/pages-shared";
import { lazy, Suspense } from "react";
import { HighScoresLoader } from "../loader/HighScoresLoader.tsx";
import { KEYBR_STATIC } from "../static.ts";
import { StaticNotice } from "../StaticNotice.tsx";

const HighScoresPage = lazy(() =>
  import("@keybr/page-highscores").then((m) => ({ default: m.HighScoresPage })),
);

export default function Page() {
  if (KEYBR_STATIC) {
    return <StaticNotice feature="High Scores" />;
  }
  return (
    <Suspense fallback={<LoadingProgress />}>
      <HighScoresLoader>
        {(entries) => <HighScoresPage entries={entries} />}
      </HighScoresLoader>
    </Suspense>
  );
}
