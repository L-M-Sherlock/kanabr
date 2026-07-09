import { test } from "node:test";
import { equal, isFalse, isTrue } from "rich-assert";
import {
  JAPANESE_HIRAGANA_ALPHABET,
  JAPANESE_KATAKANA_ALPHABET,
} from "./japanese.ts";
import { Language } from "./language.ts";

test("string manipulation", () => {
  equal(Language.TR.upperCase(""), "");
  equal(Language.TR.upperCase("AaIıİi"), "AAIIİİ");
  equal(Language.TR.lowerCase(""), "");
  equal(Language.TR.lowerCase("AaIıİi"), "aaııii");
  equal(Language.TR.capitalCase(""), "");
  equal(Language.TR.capitalCase("aaIıİi"), "Aaııii");
});

test("check words", () => {
  isTrue(Language.EN.test(""));
  isTrue(Language.EN.test("ABCdef"));
  isFalse(Language.EN.test("AaIıİi"));
  isFalse(Language.EN.test("абвгде"));
});

test("letter name", () => {
  equal(Language.EN.letterName(0x0069), "I");
  equal(Language.TR.letterName(0x0069), "İ");
  equal(Language.DE.letterName(0x00df), "ẞ");
  equal(Language.HE.letterName(0x05d0), "\u05D0");
  equal(Language.AR.letterName(0x0627), "\u200c\u0627");
  equal(Language.FA.letterName(0x0627), "\u200c\u0627");
});

test("order japanese small kana", () => {
  const alphabet = String.fromCodePoint(...Language.JA.alphabet);

  equal(alphabet, JAPANESE_HIRAGANA_ALPHABET + JAPANESE_KATAKANA_ALPHABET);
  equal(JAPANESE_HIRAGANA_ALPHABET.endsWith("ゃゅょ"), true);
  equal(JAPANESE_HIRAGANA_ALPHABET.includes("ぁ"), false);
  equal(JAPANESE_HIRAGANA_ALPHABET.includes("ぃ"), false);
  equal(JAPANESE_HIRAGANA_ALPHABET.includes("ぇ"), false);
  equal(JAPANESE_HIRAGANA_ALPHABET.includes("ぉ"), false);
  equal(JAPANESE_HIRAGANA_ALPHABET.includes("ー"), false);
  equal(JAPANESE_KATAKANA_ALPHABET.includes("ヂ"), false);
  equal(JAPANESE_KATAKANA_ALPHABET.includes("ヶ"), false);
  equal(JAPANESE_KATAKANA_ALPHABET.includes("ゥ"), true);
  equal(JAPANESE_KATAKANA_ALPHABET.includes("ヴ"), true);
  equal(JAPANESE_KATAKANA_ALPHABET.slice(-8), "ャュョァィゥェォ");
  equal(JAPANESE_KATAKANA_ALPHABET.includes("ー"), true);
});
