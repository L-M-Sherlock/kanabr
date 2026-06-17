import { KeyLegendList, names } from "@keybr/lesson-ui";
import { Slide, Tour } from "@keybr/widget";
import { memo } from "react";
import { FormattedMessage } from "react-intl";
import { KeyDetailsChartDemo } from "./KeyDetailsChartDemo.tsx";

export const PracticeTour = memo(function PracticeTour({
  onClose,
}: {
  readonly onClose?: () => void;
}) {
  return (
    <Tour onClose={onClose}>
      <Slide size="large">
        <FormattedMessage
          id="m_tour01"
          defaultMessage={
            "<h1>Practice Kana with Romaji Input</h1>" +
            "<p>kanabr helps you practice Japanese kana by typing romaji. It tracks speed and accuracy for each kana practice unit, then builds lessons around the kana that need the most attention.</p>" +
            "<p>This short tutorial explains how the practice screen works.</p>" +
            "<p>You can use the left and right arrow keys to navigate through these slides.</p>"
          }
        />
      </Slide>
      <Slide size="large">
        <FormattedMessage
          id="m_tour02"
          defaultMessage={
            "<p>Our teaching method is based on these principles:</p>" +
            "<p>No fixed drill sequence. The lesson text changes as your local statistics change, so practice stays focused on your current weak spots.</p>" +
            "<p>The algorithm generates kana practice items from the currently unlocked kana set. The size of that set and the frequency of individual kana are adjusted from your typing history.</p>"
          }
        />
      </Slide>
      <Slide size="large">
        <FormattedMessage
          id="m_tour03"
          defaultMessage={
            "<p>At first kanabr generates lessons from a small subset of kana.</p>" +
            "<p>As you type romaji for each kana, the application measures timing and accuracy for every kana in that subset. The more familiar you become with a kana, the less time it takes to enter it.</p>" +
            "<p>Once you become confident with the current subset, the algorithm expands it by adding more kana.</p>"
          }
        />
      </Slide>
      <Slide size="large">
        <FormattedMessage
          id="m_tour04"
          defaultMessage={
            "<p>When the algorithm adds a new kana to the current subset, that kana appears more often in the lesson.</p>" +
            "<p>The algorithm can also rearrange kana frequencies to emphasize the practice units with the weakest time-to-type metric.</p>" +
            "<p>This means you spend more time on the kana that are least familiar.</p>"
          }
        />
      </Slide>
      <Slide size="small" anchor={`#${names.textInput}`} position="block-end">
        <FormattedMessage
          id="m_tour05"
          defaultMessage="<p>This is the text board. It displays the kana practice text. In Japanese Romaji mode you read the kana and type the romaji spelling. The text changes for each new lesson and is generated from the current kana subset.</p>"
        />
      </Slide>
      <Slide size="small" anchor={`#${names.keyboard}`} position="block-start">
        <FormattedMessage
          id="m_tour06"
          defaultMessage="<p>This is the virtual keyboard. It shows your selected physical layout while you type romaji. Use it as a reference when you need to find a key, then return your attention to the kana text.</p>"
        />
      </Slide>
      <Slide size="small" anchor={`#${names.speed}`} position="block-end">
        <FormattedMessage
          id="m_tour07"
          defaultMessage={
            "<p>This is the typing speed indicator and the difference from the average value. Your goal is to increase this metric, meaning higher values are better.</p>" +
            "<p>Typing speed is measured in either <em>Words per Minute (WPM)</em> or <em>Characters per Minute (CPM)</em>. WPM is standardized as five kana or characters, so <em>10WPM</em> is equal to <em>50CPM</em>.</p>" +
            "<p>You can switch between the <em>WPM</em> and the <em>CPM</em> display modes on the Settings page.</p>"
          }
        />
      </Slide>
      <Slide size="small" anchor={`#${names.accuracy}`} position="block-end">
        <FormattedMessage
          id="m_tour08"
          defaultMessage={
            "<p>This is the accuracy indicator and the difference from the average value. Your goal is to increase this metric, meaning higher values are better.</p>" +
            "<p>Accuracy is computed as the percentage of characters typed without errors. Many typos in the same position count as one error.</p>"
          }
        />
      </Slide>
      <Slide size="small" anchor={`#${names.score}`} position="block-end">
        <FormattedMessage
          id="m_tour09"
          defaultMessage={
            "<p>This is the typing score indicator in abstract points and the difference from the average value.</p>" +
            "<p>The score is calculated from your typing speed, error count, and the current size of the kana set. The formula rewards speed and penalizes mistakes, so typing fast with many errors will not produce a strong score.</p>" +
            "<p>In server mode, signed-in users can optionally appear on the high score table.</p>"
          }
        />
      </Slide>
      <Slide size="small" anchor={`#${names.keySet}`} position="block-end">
        <FormattedMessage
          id="m_tour10"
          defaultMessage="<p>This indicator shows the current subset of kana used to generate the lessons, and your confidence level for every kana in the subset:</p>"
        />
        <KeyLegendList />
      </Slide>
      <Slide size="small" anchor={`#${names.keySet}`} position="block-end">
        <FormattedMessage
          id="m_tour11"
          defaultMessage="<p>This indicator can also predict the remaining number of lessons needed to unlock a kana, like in the example chart below. Visit it regularly to see how your learning is changing.</p>"
        />
        <KeyDetailsChartDemo />
      </Slide>
      <Slide size="small" anchor={`#${names.currentKey}`} position="block-end">
        <FormattedMessage
          id="m_tour12"
          defaultMessage={
            "<p>This indicator shows details about the focused kana, which appears more often in the current lesson:</p>" +
            "<dl>" +
            "<dt>Best typing speed</dt>" +
            "<dd>Your best typing speed for this individual kana.</dd>" +
            "<dt>Confidence level</dt>" +
            "<dd>A number from zero to one computed from your typing speed. It indicates your familiarity with this kana. A kana is considered fully learned when its confidence level reaches one.</dd>" +
            "<dt>Learning rate</dt>" +
            "<dd>How your typing speed is changing with each lesson.</dd>" +
            "</dl>"
          }
        />
      </Slide>
    </Tour>
  );
});
