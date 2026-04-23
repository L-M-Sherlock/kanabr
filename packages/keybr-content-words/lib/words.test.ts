import { test } from "node:test";
import { Language } from "@keybr/keyboard";
import { fail, isTrue } from "rich-assert";
import { loadJapaneseWordLists, loadWordList } from "./load.ts";

for (const language of Language.ALL) {
  test(`words:${language}`, async () => {
    const words = await loadWordList(language);
    isTrue(words.length > 1500);
    const unique = new Set();
    for (const word of words) {
      if (!language.test(word)) {
        fail(`Extraneous word "${word}"`);
      }
      if (unique.has(word)) {
        fail(`Duplicate word "${word}"`);
      }
      unique.add(word);
    }
  });
}

test("words:ja-katakana", async () => {
  const { katakana } = await loadJapaneseWordLists();
  isTrue(katakana.length === 10_000);
  const unique = new Set();
  for (const word of katakana) {
    if (!/[ァ-ヶ]/u.test(word) || !/^[ァ-ヶー]+$/u.test(word)) {
      fail(`Non-katakana word "${word}"`);
    }
    if (unique.has(word)) {
      fail(`Duplicate word "${word}"`);
    }
    unique.add(word);
  }
});
