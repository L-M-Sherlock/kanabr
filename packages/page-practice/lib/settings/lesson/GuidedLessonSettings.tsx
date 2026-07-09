import { type GuidedLesson } from "@keybr/lesson";
import { Description, Explainer, FieldSet } from "@keybr/widget";
import { type ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { AlphabetSizeProp } from "./AlphabetSizeProp.tsx";
import { BalanceKanaProp } from "./BalanceKanaProp.tsx";
import { KeyboardOrderProp } from "./KeyboardOrderProp.tsx";
import { LessonLengthProp } from "./LessonLengthProp.tsx";
import { NaturalWordsProp } from "./NaturalWordsProp.tsx";
import { RecoverKeysProp } from "./RecoverKeysProp.tsx";
import { RepeatWordsProp } from "./RepeatWordsProp.tsx";
import { TargetSpeedProp } from "./TargetSpeedProp.tsx";
import { TextManglingProp } from "./TextManglingProp.tsx";

export function GuidedLessonSettings({
  lesson,
}: {
  readonly lesson: GuidedLesson;
}): ReactNode {
  const { formatMessage } = useIntl();
  return (
    <>
      <Explainer>
        <Description>
          <FormattedMessage
            id="lessonType.guided.description"
            defaultMessage="Generate adaptive lessons from practice items selected for your language. The kana or character set expands dynamically based on your performance. This mode is for beginners."
          />
        </Description>
      </Explainer>
      <FieldSet
        legend={formatMessage({
          id: "t_Lesson_options",
          defaultMessage: "Lesson options",
        })}
      >
        <TargetSpeedProp />
        <RecoverKeysProp />
        {lesson.keyboard.layout.id !== "ja-romaji" && <KeyboardOrderProp />}
        <NaturalWordsProp />
        <RepeatWordsProp />
        {lesson.model.language.id === "ja" &&
          lesson.keyboard.layout.id === "ja-romaji" && <BalanceKanaProp />}
        <AlphabetSizeProp />
        <TextManglingProp />
        <LessonLengthProp />
      </FieldSet>
    </>
  );
}
