import { KanaFrequencyHeatmap, Marker } from "@keybr/chart";
import { type KeyStatsMap } from "@keybr/result";
import { Explainer, Figure } from "@keybr/widget";
import { FormattedMessage } from "react-intl";
import { hasKanaStats } from "./labels.ts";

export function KanaFrequencyHeatmapSection({
  keyStatsMap,
}: {
  keyStatsMap: KeyStatsMap;
}) {
  if (!hasKanaStats(keyStatsMap)) {
    return null;
  }
  return (
    <Figure>
      <Figure.Caption>
        <FormattedMessage
          id="profile.chart.kanaFrequencyHeatmap.caption"
          defaultMessage="Kana Frequency Heatmap"
        />
      </Figure.Caption>

      <Explainer>
        <Figure.Description>
          <FormattedMessage
            id="profile.chart.kanaFrequencyHeatmap.description"
            defaultMessage="This chart shows relative kana frequencies in gojuon order."
          />
        </Figure.Description>
      </Explainer>

      <KanaFrequencyHeatmap keyStatsMap={keyStatsMap} />

      <Figure.Legend>
        <FormattedMessage
          id="profile.chart.kanaFrequencyHeatmap.legend"
          defaultMessage="Circle color: {label1} – hit count, {label2} – miss count."
          values={{
            label1: <Marker type="histogram-h" />,
            label2: <Marker type="histogram-m" />,
          }}
        />
      </Figure.Legend>
    </Figure>
  );
}
