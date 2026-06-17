import { FormattedMessage } from "react-intl";
import { KeyLegend } from "./KeyLegend.tsx";

export const KeyLegendList = () => {
  return (
    <ul>
      <li>
        <KeyLegend //
          isIncluded={true}
          confidence={null}
          isFocused={false}
          isForced={false}
        />{" "}
        <FormattedMessage
          id="lesson.indicator.notCalibrated"
          defaultMessage="A non-calibrated kana or character with an unknown confidence level. You still have not practiced this item yet."
        />
      </li>
      <li>
        <KeyLegend //
          isIncluded={true}
          confidence={0}
          isFocused={false}
          isForced={false}
        />{" "}
        <FormattedMessage
          id="lesson.indicator.leastConfidence"
          defaultMessage="A calibrated kana or character with the lowest confidence level. The more times you practice this item, the more accurate this metric becomes."
        />
      </li>
      <li>
        <KeyLegend //
          isIncluded={true}
          confidence={1}
          isFocused={false}
          isForced={false}
        />{" "}
        <FormattedMessage
          id="lesson.indicator.mostConfidence"
          defaultMessage="A calibrated kana or character with the highest confidence level. The more times you practice this item, the more accurate this metric becomes."
        />
      </li>
      <li>
        <KeyLegend //
          isIncluded={true}
          confidence={0.3}
          isFocused={true}
          isForced={false}
        />{" "}
        <FormattedMessage
          id="lesson.indicator.focused"
          defaultMessage="A kana or character with increased frequency. It takes you the most time to enter this item, so the algorithm chose it to appear more often."
        />
      </li>
      <li>
        <KeyLegend //
          isIncluded={true}
          confidence={null}
          isFocused={false}
          isForced={true}
        />{" "}
        <FormattedMessage
          id="lesson.indicator.forced"
          defaultMessage="A kana or character which was manually included in the lessons."
        />
      </li>
      <li>
        <KeyLegend //
          isIncluded={false}
          confidence={null}
          isFocused={false}
          isForced={false}
        />{" "}
        <FormattedMessage
          id="lesson.indicator.notIncluded"
          defaultMessage="A kana or character which was not yet included in the lessons."
        />
      </li>
    </ul>
  );
};
