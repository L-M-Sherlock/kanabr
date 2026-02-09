import { useKeyboard } from "@keybr/keyboard";
import {
  type BooksLesson,
  type CodeLesson,
  type CustomTextLesson,
  type GuidedLesson,
  type Lesson,
  lessonProps,
  LessonType,
  type NumbersLesson,
  type WordListLesson,
} from "@keybr/lesson";
import { LessonLoader } from "@keybr/lesson-loader";
import { type Settings, useSettings } from "@keybr/settings";
import { Tab, TabList } from "@keybr/widget";
import { type ReactNode, useEffect } from "react";
import { useIntl } from "react-intl";
import { BooksLessonSettings } from "./lesson/BooksLessonSettings.tsx";
import { CodeLessonSettings } from "./lesson/CodeLessonSettings.tsx";
import { CustomTextLessonSettings } from "./lesson/CustomTextLessonSettings.tsx";
import { DailyGoalSettings } from "./lesson/DailyGoalSettings.tsx";
import { GuidedLessonSettings } from "./lesson/GuidedLessonSettings.tsx";
import { LessonPreview } from "./lesson/LessonPreview.tsx";
import { NumbersLessonSettings } from "./lesson/NumbersLessonSettings.tsx";
import { WordListLessonSettings } from "./lesson/WordListLessonSettings.tsx";

export function LessonSettings(): ReactNode {
  const { formatMessage } = useIntl();
  const { settings, updateSettings } = useSettings();
  const keyboard = useKeyboard();
  const isJaRomaji = keyboard.layout.id === "ja-romaji";
  const lessonType = settings.get(lessonProps.type);
  const lessonTypeDisabled =
    isJaRomaji &&
    (lessonType === LessonType.WORDLIST ||
      lessonType === LessonType.BOOKS ||
      lessonType === LessonType.CUSTOM ||
      lessonType === LessonType.CODE);
  const isLessonTypeDisabled = (type: LessonType): boolean =>
    isJaRomaji &&
    (type === LessonType.WORDLIST ||
      type === LessonType.BOOKS ||
      type === LessonType.CUSTOM ||
      type === LessonType.CODE);

  useEffect(() => {
    if (lessonTypeDisabled) {
      updateSettings(settings.set(lessonProps.type, LessonType.GUIDED));
    }
  }, [lessonTypeDisabled, settings, updateSettings]);

  return (
    <>
      <TabList
        selectedIndex={LessonType.ALL.indexOf(lessonType)}
        onSelect={(index) => {
          const next = LessonType.ALL.at(index);
          if (!isLessonTypeDisabled(next)) {
            updateSettings(settings.set(lessonProps.type, next));
          }
        }}
      >
        <Tab
          label={formatMessage({
            id: "t_Guided_lessons",
            defaultMessage: "Guided lessons",
          })}
        />
        <Tab
          label={formatMessage({
            id: "t_Common_words",
            defaultMessage: "Common words",
          })}
          disabled={isLessonTypeDisabled(LessonType.WORDLIST)}
        />
        <Tab
          label={formatMessage({
            id: "t_Books",
            defaultMessage: "Books",
          })}
          disabled={isLessonTypeDisabled(LessonType.BOOKS)}
        />
        <Tab
          label={formatMessage({
            id: "t_Custom_text",
            defaultMessage: "Custom text",
          })}
          disabled={isLessonTypeDisabled(LessonType.CUSTOM)}
        />
        <Tab
          label={formatMessage({
            id: "t_Source_code",
            defaultMessage: "Source code",
          })}
          disabled={isLessonTypeDisabled(LessonType.CODE)}
        />
        <Tab
          label={formatMessage({
            id: "t_Numbers",
            defaultMessage: "Numbers",
          })}
        />
      </TabList>
      <LessonLoader>
        {(lesson) => (
          <>
            {tabBody(settings, lesson)}
            <LessonPreview lesson={lesson} />
            <DailyGoalSettings />
          </>
        )}
      </LessonLoader>
    </>
  );
}

function tabBody(settings: Settings, lesson: Lesson): ReactNode {
  switch (settings.get(lessonProps.type)) {
    case LessonType.GUIDED:
      return <GuidedLessonSettings lesson={lesson as GuidedLesson} />;
    case LessonType.WORDLIST:
      return <WordListLessonSettings lesson={lesson as WordListLesson} />;
    case LessonType.BOOKS:
      return <BooksLessonSettings lesson={lesson as BooksLesson} />;
    case LessonType.CUSTOM:
      return <CustomTextLessonSettings lesson={lesson as CustomTextLesson} />;
    case LessonType.CODE:
      return <CodeLessonSettings lesson={lesson as CodeLesson} />;
    case LessonType.NUMBERS:
      return <NumbersLessonSettings lesson={lesson as NumbersLesson} />;
    default:
      throw new Error();
  }
}
