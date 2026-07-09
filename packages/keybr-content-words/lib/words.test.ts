import { test } from "node:test";
import { JAPANESE_KATAKANA_ALPHABET, Language } from "@keybr/keyboard";
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
  isTrue(katakana.length === 9_999);
  const alphabet = new Set(JAPANESE_KATAKANA_ALPHABET);
  const covered = new Set();
  const unique = new Set();
  for (const word of katakana) {
    const letters = [...word];
    if (!letters.some((letter) => alphabet.has(letter))) {
      fail(`Non-katakana word "${word}"`);
    }
    for (const letter of letters) {
      if (!alphabet.has(letter)) {
        fail(`Extraneous katakana "${letter}" in word "${word}"`);
      }
      covered.add(letter);
    }
    if (unique.has(word)) {
      fail(`Duplicate word "${word}"`);
    }
    unique.add(word);
  }
  for (const letter of JAPANESE_KATAKANA_ALPHABET) {
    if (!covered.has(letter)) {
      fail(`Uncovered katakana "${letter}"`);
    }
  }
});
