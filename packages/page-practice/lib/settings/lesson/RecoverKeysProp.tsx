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

export function RecoverKeysProp(): ReactNode {
  const { formatMessage } = useIntl();
  const { settings, updateSettings } = useSettings();
  return (
    <>
      <FieldList>
        <Field>
          <FormattedMessage
            id="t_Unlock_a_next_key_:"
            defaultMessage="Unlock the next item only when:"
          />
        </Field>
        <Field>
          <CheckBox
            label={formatMessage({
              id: "t_The_previous_keys_are_",
              defaultMessage:
                "The previous items are also above the target speed",
            })}
            checked={settings.get(lessonProps.guided.recoverKeys)}
            onChange={(value) => {
              updateSettings(
                settings.set(lessonProps.guided.recoverKeys, value),
              );
            }}
          />
        </Field>
      </FieldList>
      <Explainer>
        <Description>
          <FormattedMessage
            id="settings.recoverKeys.description"
            defaultMessage="When you focus on a new kana or character, the speed of previous items may decrease. If this option is disabled, you unlock a new item by raising only the focused item above the target speed. If it is enabled, you must raise the focused item and all previous items above the target speed. This makes unlocking harder, but also makes forgetting old items harder."
          />
        </Description>
      </Explainer>
    </>
  );
}
