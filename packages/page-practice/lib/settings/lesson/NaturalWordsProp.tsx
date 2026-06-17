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

export function NaturalWordsProp(): ReactNode {
  const { formatMessage } = useIntl();
  const { settings, updateSettings } = useSettings();
  return (
    <>
      <FieldList>
        <Field>
          <CheckBox
            label={formatMessage({
              id: "t_Prefer_natural_words",
              defaultMessage: "Prefer natural practice items",
            })}
            checked={settings.get(lessonProps.guided.naturalWords)}
            onChange={(value) => {
              updateSettings(
                settings.set(lessonProps.guided.naturalWords, value),
              );
            }}
          />
        </Field>
      </FieldList>
      <Explainer>
        <Description>
          <FormattedMessage
            id="settings.naturalWords.description"
            defaultMessage="Use dictionary-backed practice items as much as possible. If not many are available, use generated pseudo-items instead. Natural items might be easier to type, while generated items offer more variety for the current kana or character set."
          />
        </Description>
      </Explainer>
    </>
  );
}
