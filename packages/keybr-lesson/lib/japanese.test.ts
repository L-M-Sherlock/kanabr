import { test } from "node:test";
import { Letter } from "@keybr/phonetic-model";
import { equal } from "rich-assert";
import { makeJapanesePracticeLetters } from "./japanese.ts";

test("include katakana fallback letters from base hiragana", () => {
  const letters = makeJapanesePracticeLetters([
    new Letter(/* "う" */ 0x3046, 0.3),
  ]);
  const text = letters.map(String).join("");

  equal(text.includes("ヴ"), true);
  equal(text.includes("ゥ"), true);
  equal(text.includes("ヂ"), false);
  equal(text.includes("ヶ"), false);
  equal(letters.find(({ codePoint }) => codePoint === 0x30f4)?.f, 0.3);
  equal(letters.find(({ codePoint }) => codePoint === 0x30a5)?.f, 0.3);
});
