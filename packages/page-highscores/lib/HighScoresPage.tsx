import { Article, Figure } from "@keybr/widget";
import { type ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { HighScoresTable } from "./HighScoresTable.tsx";
import { type EntriesProps } from "./types.ts";

export function HighScoresPage({ entries }: EntriesProps): ReactNode {
  return (
    <Article>
      <FormattedMessage
        id="page.highScores.content"
        defaultMessage={
          "<h1>High Scores</h1>" +
          "<p>This server-backed leaderboard lists signed-in kanabr users from the last few days, arranged by score from best to worst. Score is measured from kana typing speed, lesson length, the size of the active kana or character set, and the number of errors.</p>"
        }
      />

      <Figure>
        <HighScoresTable entries={entries} />
      </Figure>
    </Article>
  );
}
