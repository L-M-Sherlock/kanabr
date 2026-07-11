import { test } from "node:test";
import { Feedback } from "@keybr/textinput";
import { deepEqual, equal } from "rich-assert";
import {
  groupKanaSpeechParts,
  isKanaInputIncorrect,
  type KanaSpeechSequence,
  KanaSpeechSession,
  shouldPlayKanaInputSound,
} from "./kana-speech-session.ts";

test("groups kana by resolved romaji sequence", () => {
  deepEqual(
    groupKanaSpeechParts([
      { sequenceId: 1, text: "き", incorrect: false },
      { sequenceId: 1, text: "ゃ", incorrect: true },
      { sequenceId: 2, text: "ん", incorrect: false },
    ]),
    [
      { text: "きゃ", incorrect: true },
      { text: "ん", incorrect: false },
    ],
  );
});

test("speaks each resolved sequence once", () => {
  const spoken: KanaSpeechSequence[] = [];
  const session = new KanaSpeechSession({
    speak: (text, incorrect) => spoken.push({ text, incorrect }),
  });

  session.accept([
    { sequenceId: 1, text: "キ", incorrect: false },
    { sequenceId: 1, text: "ャ", incorrect: false },
    { sequenceId: 2, text: "ン", incorrect: true },
  ]);

  deepEqual(spoken, [
    { text: "キャ", incorrect: false },
    { text: "ン", incorrect: true },
  ]);
});

test("prepends small tsu and combines incorrect flags", () => {
  const spoken: KanaSpeechSequence[] = [];
  const session = new KanaSpeechSession({
    speak: (text, incorrect) => spoken.push({ text, incorrect }),
  });

  session.accept([{ sequenceId: 1, text: "っ", incorrect: true }]);
  session.accept([{ sequenceId: 2, text: "か", incorrect: false }]);

  deepEqual(spoken, [{ text: "っか", incorrect: true }]);
});

test("reset drops a pending small tsu", () => {
  const spoken: KanaSpeechSequence[] = [];
  const session = new KanaSpeechSession({
    speak: (text, incorrect) => spoken.push({ text, incorrect }),
  });

  session.accept([{ sequenceId: 1, text: "ッ", incorrect: false }]);
  session.reset();
  session.accept([{ sequenceId: 2, text: "カ", incorrect: false }]);

  deepEqual(spoken, [{ text: "カ", incorrect: false }]);
});

test("ignores a standalone prolonged sound mark", () => {
  const spoken: KanaSpeechSequence[] = [];
  const session = new KanaSpeechSession({
    speak: (text, incorrect) => spoken.push({ text, incorrect }),
  });

  session.accept([{ sequenceId: 1, text: "ー", incorrect: false }]);

  deepEqual(spoken, []);
});

test("matches input with the TextInput normalization rule", () => {
  equal(isKanaInputIncorrect(/* "'" */ 0x0027, /* "‘" */ 0x2018), false);
  equal(isKanaInputIncorrect(/* "き" */ 0x304d, /* "か" */ 0x304b), true);
});

test("speech replaces the failed sound for an incorrect kana", () => {
  equal(shouldPlayKanaInputSound(Feedback.Failed, true, true), false);
});

test("preserves failed sounds when speech cannot replace them", () => {
  equal(shouldPlayKanaInputSound(Feedback.Failed, true, false), true);
  equal(shouldPlayKanaInputSound(Feedback.Failed, false, true), true);
});

test("preserves successful and recovered sounds", () => {
  equal(shouldPlayKanaInputSound(Feedback.Succeeded, false, true), true);
  equal(shouldPlayKanaInputSound(Feedback.Succeeded, true, true), true);
  equal(shouldPlayKanaInputSound(Feedback.Recovered, false, true), true);
  equal(shouldPlayKanaInputSound(Feedback.Recovered, true, true), true);
});
