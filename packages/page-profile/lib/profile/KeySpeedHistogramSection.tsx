import { KeySpeedHistogram } from "@keybr/chart";
import { type KeyStatsMap } from "@keybr/result";
import { Explainer, Figure } from "@keybr/widget";
import { FormattedMessage } from "react-intl";
import { ChartWrapper } from "./ChartWrapper.tsx";
import { hasKanaStats } from "./labels.ts";

export function KeySpeedHistogramSection({
  keyStatsMap,
}: {
  keyStatsMap: KeyStatsMap;
}) {
  const minWidthRem = 45;
  const perKeyRem = 1.4;
  const widthRem = Math.max(
    minWidthRem,
    keyStatsMap.letters.length * perKeyRem,
  );
  const kana = hasKanaStats(keyStatsMap);
  return (
    <Figure>
      <Figure.Caption>
        {kana ? (
          <FormattedMessage
            id="profile.chart.kanaSpeedHistogram.caption"
            defaultMessage="Kana Typing Speed Histogram"
          />
        ) : (
          <FormattedMessage
            id="profile.chart.keySpeedHistogram.caption"
            defaultMessage="Key Typing Speed Histogram"
          />
        )}
      </Figure.Caption>

      <Explainer>
        <Figure.Description>
          {kana ? (
            <FormattedMessage
              id="profile.chart.kanaSpeedHistogram.description"
              defaultMessage="This chart shows the average typing speed for each individual kana."
            />
          ) : (
            <FormattedMessage
              id="profile.chart.keySpeedHistogram.description"
              defaultMessage="This chart shows the average typing speed for each individual physical key."
            />
          )}
        </Figure.Description>
      </Explainer>

      <ChartWrapper scrollX={true}>
        <KeySpeedHistogram
          keyStatsMap={keyStatsMap}
          width={`${widthRem}rem`}
          height="18rem"
        />
      </ChartWrapper>
    </Figure>
  );
}
