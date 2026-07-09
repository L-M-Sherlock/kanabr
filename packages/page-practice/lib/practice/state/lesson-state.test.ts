import { test } from "node:test";
import { keyboardProps, Language, Layout, loadKeyboard } from "@keybr/keyboard";
import {
  LessonKeys,
  lessonProps,
  LessonType,
  MutableDailyGoal,
  Target,
} from "@keybr/lesson";
import { Letter } from "@keybr/phonetic-model";
import {
  MutableKeyStatsMap,
  MutableStreakList,
  MutableSummaryStats,
} from "@keybr/result";
import { Settings } from "@keybr/settings";
import { equal, isNotNull } from "rich-assert";
import { LessonState } from "./lesson-state.ts";

test("keeps katakana code points in result histogram", () => {
  const settings = new Settings()
    .set(keyboardProps.layout, Layout.JA_ROMAJI)
    .set(lessonProps.type, LessonType.GUIDED);
  const letters = [
    new Letter(/* "ア" */ 0x30a2, 1),
    new Letter(/* "カ" */ 0x30ab, 1),
  ];
  const keyStatsMap = new MutableKeyStatsMap(letters);
  const target = new Target(settings);
  const lesson = {
    model: { language: Language.JA },
    keyboard: loadKeyboard(Layout.JA_ROMAJI),
    update: () => LessonKeys.includeAll(keyStatsMap, target),
    generate: () => "アカ",
  };
  const progress = {
    settings,
    lesson,
    keyStatsMap,
    summaryStats: new MutableSummaryStats(),
    streakList: new MutableStreakList(),
    dailyGoal: new MutableDailyGoal(settings),
  };
  let result = null as any;
  const state = new LessonState(progress as any, (next) => {
    result = next;
  });

  state.onInput({
    type: "input",
    timeStamp: 1000,
    inputType: "appendChar",
    codePoint: 0x30a2,
    timeToType: 100,
  });
  state.onInput({
    type: "input",
    timeStamp: 1100,
    inputType: "appendChar",
    codePoint: 0x30ab,
    timeToType: 100,
  });

  isNotNull(result);
  equal(result.histogram.has(/* "カ" */ 0x30ab), true);
  equal(result.histogram.has(/* "か" */ 0x304b), false);
});
