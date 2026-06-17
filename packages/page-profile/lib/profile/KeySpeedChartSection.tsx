import { KeySpeedChart, Marker } from "@keybr/chart";
import { LessonKey, Target } from "@keybr/lesson";
import { KeyDetails, KeySelector } from "@keybr/lesson-ui";
import { hasData } from "@keybr/math";
import { type KeyStatsMap } from "@keybr/result";
import { useSettings } from "@keybr/settings";
import { Explainer, Figure, Para } from "@keybr/widget";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { ChartWrapper } from "./ChartWrapper.tsx";
import { hasKanaStats } from "./labels.ts";
import { SmoothnessRange } from "./SmoothnessRange.tsx";

export function KeySpeedChartSection({
  keyStatsMap,
}: {
  keyStatsMap: KeyStatsMap;
}) {
  const { settings } = useSettings();
  const { letters } = keyStatsMap;
  const [current, setCurrent] = useState(() => letters[0]);
  const [smoothness, setSmoothness] = useState(0.5);
  const target = new Target(settings);
  const kana = hasKanaStats(keyStatsMap);

  useEffect(() => {
    if (letters.length > 0 && !letters.includes(current)) {
      setCurrent(letters[0]);
    }
  }, [current, letters]);

  if (letters.length === 0) {
    return null;
  }

  const effectiveCurrent = letters.includes(current) ? current : letters[0];
  const keyStats = keyStatsMap.get(effectiveCurrent);
  const { samples } = keyStats;

  return (
    <Figure>
      <Figure.Caption>
        {kana ? (
          <FormattedMessage
            id="profile.chart.kanaSpeed.caption"
            defaultMessage="Kana Typing Speed"
          />
        ) : (
          <FormattedMessage
            id="profile.chart.keySpeed.caption"
            defaultMessage="Key Typing Speed"
          />
        )}
      </Figure.Caption>

      <Explainer>
        <Figure.Description>
          {kana ? (
            <FormattedMessage
              id="profile.chart.kanaSpeed.description"
              defaultMessage="This chart shows the typing speed change for each individual kana."
            />
          ) : (
            <FormattedMessage
              id="profile.chart.keySpeed.description"
              defaultMessage="This chart shows the typing speed change for each individual physical key."
            />
          )}
        </Figure.Description>
      </Explainer>

      <Para align="center">
        <KeySelector
          keyStatsMap={keyStatsMap}
          current={effectiveCurrent}
          onSelect={(current) => {
            setCurrent(current);
          }}
        />
      </Para>

      <Para align="center">
        <KeyDetails lessonKey={LessonKey.from(keyStats, target)} />
      </Para>

      <ChartWrapper>
        <KeySpeedChart
          samples={samples}
          smoothness={smoothness}
          width="100%"
          height="25rem"
        />
      </ChartWrapper>

      <SmoothnessRange
        disabled={!hasData(samples)}
        value={smoothness}
        onChange={setSmoothness}
      />

      <Figure.Legend>
        {kana ? (
          <FormattedMessage
            id="profile.chart.kanaSpeed.legend"
            defaultMessage="Horizontal axis: lesson number. Vertical axis: {label1} – typing speed for the currently selected kana, {label2} – target typing speed."
            values={{
              label1: <Marker type="speed" />,
              label2: <Marker type="threshold" />,
            }}
          />
        ) : (
          <FormattedMessage
            id="profile.chart.keySpeed.legend"
            defaultMessage="Horizontal axis: lesson number. Vertical axis: {label1} – typing speed for the currently selected physical key, {label2} – target typing speed."
            values={{
              label1: <Marker type="speed" />,
              label2: <Marker type="threshold" />,
            }}
          />
        )}
      </Figure.Legend>
    </Figure>
  );
}
