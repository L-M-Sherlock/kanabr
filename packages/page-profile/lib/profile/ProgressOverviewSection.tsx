import { Marker, ProgressOverviewChart } from "@keybr/chart";
import { type KeyStatsMap } from "@keybr/result";
import { Explainer, Figure } from "@keybr/widget";
import { FormattedMessage } from "react-intl";
import { ChartWrapper } from "./ChartWrapper.tsx";
import { hasKanaStats } from "./labels.ts";

export function ProgressOverviewSection({
  keyStatsMap,
}: {
  keyStatsMap: KeyStatsMap;
}) {
  const minRowHeightRem = 1.2;
  const minHeightRem = 35;
  const heightRem = Math.max(
    minHeightRem,
    keyStatsMap.letters.length * minRowHeightRem,
  );
  const kana = hasKanaStats(keyStatsMap);
  return (
    <Figure>
      <Figure.Caption>
        <FormattedMessage
          id="profile.chart.progressOverview.caption"
          defaultMessage="Learning Progress Overview"
        />
      </Figure.Caption>

      <Explainer>
        <Figure.Description>
          {kana ? (
            <FormattedMessage
              id="profile.chart.kanaProgressOverview.description"
              defaultMessage="This chart shows the learning progress overview for all kana."
            />
          ) : (
            <FormattedMessage
              id="profile.chart.progressOverview.description"
              defaultMessage="This chart shows the learning progress overview for all physical keys."
            />
          )}
        </Figure.Description>
      </Explainer>

      <ChartWrapper>
        <ProgressOverviewChart
          keyStatsMap={keyStatsMap}
          width="100%"
          height={`${heightRem}rem`}
        />
      </ChartWrapper>

      <Figure.Legend>
        {kana ? (
          <FormattedMessage
            id="profile.chart.kanaProgressOverview.legend"
            defaultMessage="Horizontal axis: lesson number. Vertical axis: typing speed for each individual kana, {label1} – slow, {label2} – fast."
            values={{
              label1: <Marker type="slow" />,
              label2: <Marker type="fast" />,
            }}
          />
        ) : (
          <FormattedMessage
            id="profile.chart.progressOverview.legend"
            defaultMessage="Horizontal axis: lesson number. Vertical axis: typing speed for each individual physical key, {label1} – slow, {label2} – fast."
            values={{
              label1: <Marker type="slow" />,
              label2: <Marker type="fast" />,
            }}
          />
        )}
      </Figure.Legend>
    </Figure>
  );
}
