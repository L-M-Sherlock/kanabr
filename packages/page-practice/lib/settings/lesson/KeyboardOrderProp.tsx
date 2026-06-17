import { lessonProps } from "@keybr/lesson";
import { useSettings } from "@keybr/settings";
import {
  CheckBox,
  Description,
  Explainer,
  Field,
  FieldList,
} from "@keybr/widget";
import { type ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";

export function KeyboardOrderProp({
  disabled = false,
}: {
  readonly disabled?: boolean;
} = {}): ReactNode {
  const { formatMessage } = useIntl();
  const { settings, updateSettings } = useSettings();
  return (
    <>
      <FieldList>
        <Field>
          <CheckBox
            label={formatMessage({
              id: "setting.keyboardOrder.label",
              defaultMessage:
                "Sort characters in the order of physical keyboard keys",
            })}
            disabled={disabled}
            checked={settings.get(lessonProps.guided.keyboardOrder)}
            onChange={(value) => {
              updateSettings(
                settings.set(lessonProps.guided.keyboardOrder, value),
              );
            }}
          />
        </Field>
      </FieldList>
      <Explainer>
        <Description>
          <FormattedMessage
            id="setting.keyboardOrder.description"
            defaultMessage="Sort characters so the ones typed from the home row come first, then the top row, and finally the remaining physical keys. The home row is the row with the CapsLock key. The top row is the row with the Tab key. This feature works best with optimized layouts, like Dvorak or Colemak. It is not used for Japanese Romaji mode, where kana are practice units and physical keys are only the romaji input method."
          />
        </Description>
      </Explainer>
    </>
  );
}
