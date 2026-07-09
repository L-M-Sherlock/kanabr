import { keyboardProps, loadKeyboard } from "@keybr/keyboard";
import { KeyLayer, VirtualKeyboard, ZonesLayer } from "@keybr/keyboard-ui";
import { KeyLegendList } from "@keybr/lesson-ui";
import { useSettings } from "@keybr/settings";
import { singleLine, toTextDisplaySettings } from "@keybr/textinput";
import { StaticText } from "@keybr/textinput-ui";
import { Article, Figure } from "@keybr/widget";
import { FormattedMessage } from "react-intl";
import { ExampleLink } from "./ExampleLink.tsx";
import { KeySetIllustration } from "./figures.tsx";
import * as styles from "./HelpApp.module.less";
import { alphabet } from "./kana.ts";

export function HelpPage() {
  const { settings } = useSettings();
  const keyboard = loadKeyboard(settings.get(keyboardProps.layout));
  const textDisplaySettings = toTextDisplaySettings(settings);

  return (
    <Article>
      <FormattedMessage
        id="help.section1"
        defaultMessage={
          "<h1>Practice Japanese kana</h1>" +
          "<h2>Romaji input</h2>" +
          "<p>kanabr helps you practice hiragana and katakana by typing their romaji spellings. Each kana is tracked separately, so the lesson engine can focus on the kana that still take you the longest to enter.</p>"
        }
      />

      <FormattedMessage
        id="help.section2"
        defaultMessage={
          "<h2>The teaching method</h2>" +
          "<p>kanabr uses typing statistics to create kana practice lessons that match your current skill level. It repeats the following cycle:</p>" +
          "<ol>" +
          "<li>The algorithm generates kana practice items from the kana set that is currently unlocked for you.</li>" +
          "<li>You type the romaji for each kana, trying to make as few mistakes as possible.</li>" +
          "<li>As you type, kanabr records timing and accuracy for each kana. Those local statistics are then used to generate the next lesson.</li>" +
          "</ol>" +
          "<p>At each stage you practice the provided items, and the algorithm adjusts the next lesson.</p>"
        }
      />

      <FormattedMessage
        id="help.section3"
        defaultMessage={
          "<h2>The kana lesson generator</h2>" +
          "<p>Guided lessons start with a small hiragana set and expand it gradually. Once the hiragana block is learned, katakana is unlocked as its own practice block with separate timing statistics. In Japanese Romaji mode the displayed text is kana, while your input is romaji.</p>" +
          "<p>The kana set is selected using the following rules.</p>"
        }
      />

      <section className={styles.rule}>
        <h3 className={styles.ruleNumber}>1</h3>
        <h3>
          <FormattedMessage
            id="help.rule1.title"
            defaultMessage="The algorithm starts with the initial kana"
          />
        </h3>

        <div className={styles.example}>
          <KeySetIllustration
            confidences={[null, null, null, null, null, null]}
          />
        </div>

        <div className={styles.example}>
          <StaticText
            settings={textDisplaySettings}
            lines={singleLine("あい うえ おあ いえ あう えお いあ")}
          />
        </div>

        <FormattedMessage
          id="help.rule1.body"
          defaultMessage="<p>When you start practicing for the first time, kanabr has no timing data yet. It begins with a small set of common kana such as ‘<em>あ</em>’, ‘<em>い</em>’, ‘<em>う</em>’, ‘<em>え</em>’, ‘<em>お</em>’ and ‘<em>か</em>’. Lesson items are generated from this small kana set, while the remaining kana are kept locked. Unknown kana statistics are shown in gray.</p>"
        />
      </section>

      <section className={styles.rule}>
        <h3 className={styles.ruleNumber}>2</h3>
        <h3>
          <FormattedMessage
            id="help.rule2.title"
            defaultMessage="You learn the initial kana"
          />
        </h3>

        <div className={styles.example}>
          <KeySetIllustration confidences={[0.9, 0.6, 0.7, 0.4, 0.5, 0.5]} />
        </div>

        <div className={styles.example}>
          <StaticText
            settings={textDisplaySettings}
            lines={singleLine("あいか かい うか えか おか かう いか")}
          />
        </div>

        <FormattedMessage
          id="help.rule2.body"
          defaultMessage="<p>As you type the generated kana, kanabr records the time-to-type metric for each practice unit. Indicators move from red to green as your speed approaches the target. In this example one kana is highlighted because it has the weakest timing metric. That focused kana appears in every generated item, so each lesson spends extra time on the kana that needs the most practice.</p>"
        />
      </section>

      <section className={styles.rule}>
        <h3 className={styles.ruleNumber}>3</h3>
        <h3>
          <FormattedMessage
            id="help.rule3.title"
            defaultMessage="The algorithm adds more kana"
          />
        </h3>

        <div className={styles.example}>
          <KeySetIllustration confidences={[1, 1, 1, 1, 1, 1, null]} />
        </div>

        <div className={styles.example}>
          <StaticText
            settings={textDisplaySettings}
            lines={singleLine("きか きい きく かき きお いき きえ")}
          />
        </div>

        <FormattedMessage
          id="help.rule3.body"
          defaultMessage="<p>When your speed improves and the current kana become confident, kanabr adds a new kana such as ‘<em>き</em>’. Lessons are generated from the expanded kana set. The new kana is focused and appears often until enough data is collected, so its indicator starts gray.</p>"
        />
      </section>

      <section className={styles.rule}>
        <h3 className={styles.ruleNumber}>4</h3>
        <h3>
          <FormattedMessage
            id="help.rule4.title"
            defaultMessage="You learn additional kana"
          />
        </h3>

        <div className={styles.example}>
          <KeySetIllustration confidences={[1, 0.8, 0.9, 0.7, 0.6, 0.7, 0.3]} />
        </div>

        <div className={styles.example}>
          <StaticText
            settings={textDisplaySettings}
            lines={singleLine("きか すき かす きす すい うす すき")}
          />
        </div>

        <FormattedMessage
          id="help.rule4.body"
          defaultMessage="<p>Your goal is to bring the focused kana up to the target speed. Previous kana may become slower as the lesson gets more complex; that is expected. The algorithm keeps the current focus visible until the new kana is confident enough to unlock the next one.</p>"
        />
      </section>

      <section className={styles.rule}>
        <h3 className={styles.ruleNumber}>5</h3>
        <h3>
          <FormattedMessage
            id="help.rule5.title"
            defaultMessage="The cycle repeats"
          />
        </h3>

        <div className={styles.example}>
          <KeySetIllustration
            confidences={Object.keys(alphabet).map((_) => 1)}
          />
        </div>

        <div className={styles.example}>
          <StaticText
            settings={textDisplaySettings}
            lines={singleLine("かな こと ひらがな カタカナ きゃ しゅ じょ")}
          />
        </div>

        <FormattedMessage
          id="help.rule5.body"
          defaultMessage="<p>With enough practice the whole hiragana and katakana set becomes available. You can then keep practicing or raise the target speed to repeat the guided cycle with a stricter threshold.</p>"
        />
      </section>

      <FormattedMessage
        id="help.section4"
        defaultMessage="<p>The precise meaning of each kana indicator color is given in the following legend.</p>"
      />

      <Figure>
        <Figure.Caption>
          <FormattedMessage
            id="help.indicators.caption"
            defaultMessage="Kana indicator color coding."
          />
        </Figure.Caption>
        <KeyLegendList />
      </Figure>

      <FormattedMessage
        id="help.section5"
        defaultMessage={
          "<h2>Using the keyboard</h2>" +
          "<p>In Japanese Romaji mode you type Latin romaji on your physical keyboard to submit each kana. For example, ‘<em>か</em>’ is entered as ‘<em>ka</em>’. The virtual keyboard follows your selected layout and can help you keep your hands oriented while you practice.</p>"
        }
      />

      <Figure>
        <Figure.Caption>
          <FormattedMessage
            id="help.keyboardZones.caption"
            defaultMessage="Keyboard zones for the selected physical layout."
          />
        </Figure.Caption>
        <VirtualKeyboard keyboard={keyboard}>
          <KeyLayer showColors={true} />
          <ZonesLayer />
        </VirtualKeyboard>
      </Figure>

      <FormattedMessage
        id="help.section6"
        defaultMessage={
          "<h2>The effectiveness of this application</h2>" +
          "<p>The following anonymized profiles show how adaptive practice can change speed and accuracy over time. They are examples of the same lesson engine behavior that kanabr uses for kana practice.</p>"
        }
      />

      <ul>
        <li>
          <FormattedMessage
            id="help.example1"
            defaultMessage="<a>Example 1</a>, from 30 to 70 WPM after 4 hours 20 minutes of practicing in the course of 15 days."
            values={{
              a: (chunks) => <ExampleLink index={1}>{chunks}</ExampleLink>,
            }}
          />
        </li>

        <li>
          <FormattedMessage
            id="help.example2"
            defaultMessage="<a>Example 2</a>, from 35 to 70 WPM after 2 hours and 20 minutes of practicing in the course of 12 days."
            values={{
              a: (chunks) => <ExampleLink index={2}>{chunks}</ExampleLink>,
            }}
          />
        </li>

        <li>
          <FormattedMessage
            id="help.example3"
            defaultMessage="<a>Example 3</a>, a decent jump from less than 20 to 40 WPM after 5 hours and 30 minutes of practicing in the course of 11 days."
            values={{
              a: (chunks) => <ExampleLink index={3}>{chunks}</ExampleLink>,
            }}
          />
        </li>

        <li>
          <FormattedMessage
            id="help.example4"
            defaultMessage="<a>Example 4</a>, after 2 hours and 10 minutes of practicing in the course of 11 days, typing speed stayed at ~70 WPM (which is already pretty high), but accuracy improved."
            values={{
              a: (chunks) => <ExampleLink index={4}>{chunks}</ExampleLink>,
            }}
          />
        </li>

        <li>
          <FormattedMessage
            id="help.example5"
            defaultMessage="<a>Example 5</a>, from 20 to 45 WPM after about 10 hours of practicing in the course of 22 day (yes, sometimes it takes longer)."
            values={{
              a: (chunks) => <ExampleLink index={5}>{chunks}</ExampleLink>,
            }}
          />
        </li>
      </ul>
    </Article>
  );
}
