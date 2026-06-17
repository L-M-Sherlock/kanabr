import { KeyFrequencyHistogram, Marker } from "@keybr/chart";
import { type KeyStatsMap } from "@keybr/result";
import { Explainer, Figure } from "@keybr/widget";
import { FormattedMessage } from "react-intl";
import { ChartWrapper } from "./ChartWrapper.tsx";
import { hasKanaStats } from "./labels.ts";

export function KeyFrequencyHistogramSection({
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
            id="profile.chart.kanaFrequencyHistogram.caption"
            defaultMessage="Kana Frequency Histogram"
          />
        ) : (
          <FormattedMessage
            id="profile.chart.keyFrequencyHistogram.caption"
            defaultMessage="Key Frequency Histogram"
          />
        )}
      </Figure.Caption>

      <Explainer>
        <Figure.Description>
          {kana ? (
            <FormattedMessage
              id="profile.chart.kanaFrequencyHistogram.description"
              defaultMessage="This chart shows relative kana frequencies."
            />
          ) : (
            <FormattedMessage
              id="profile.chart.keyFrequencyHistogram.description"
              defaultMessage="This chart shows relative physical key frequencies."
            />
          )}
        </Figure.Description>
      </Explainer>

      <ChartWrapper scrollX={true}>
        <KeyFrequencyHistogram
          keyStatsMap={keyStatsMap}
          width={`${widthRem}rem`}
          height="28rem"
        />
      </ChartWrapper>

      <Figure.Legend>
        <FormattedMessage
          id="profile.chart.keyFrequencyHistogram.legend"
          defaultMessage="Bar color: {label1} – hit count, {label2} – miss count, {label3} – miss/hit ratio (relative miss frequency)."
          values={{
            label1: <Marker type="histogram-h" />,
            label2: <Marker type="histogram-m" />,
            label3: <Marker type="histogram-r" />,
          }}
        />
      </Figure.Legend>
    </Figure>
  );
}
