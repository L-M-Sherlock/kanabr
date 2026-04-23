import { type WordList } from "@keybr/content";
import { type Keyboard } from "@keybr/keyboard";
import { Filter, Letter, type PhoneticModel } from "@keybr/phonetic-model";
import { type RNGStream } from "@keybr/rand";
import { type KeyStatsMap } from "@keybr/result";
import { type Settings } from "@keybr/settings";
import { Dictionary, filterWordList } from "./dictionary.ts";
import { LessonKey, LessonKeys } from "./key.ts";
import { Lesson } from "./lesson.ts";
import { lessonProps } from "./settings.ts";
import { Target } from "./target.ts";
import { generateFragment } from "./text/fragment.ts";
import {
  endsWithSmallTsu,
  mangledWords,
  phoneticWords,
  randomWords,
  uniqueWords,
} from "./text/words.ts";

export class GuidedLesson extends Lesson {
  readonly dictionary: Dictionary;
  readonly katakanaDictionary: Dictionary | null;

  constructor(
    settings: Settings,
    keyboard: Keyboard,
    model: PhoneticModel,
    wordList: WordList,
    {
      katakanaWordList,
    }: {
      readonly katakanaWordList?: WordList;
    } = {},
  ) {
    super(settings, keyboard, model);
    this.dictionary = this.#createDictionary(wordList);
    this.katakanaDictionary =
      model.language.id === "ja" && katakanaWordList != null
        ? this.#createDictionary(katakanaWordList, normalizeJapaneseCodePoint)
        : null;
  }

  override get letters() {
    return this.model.letters;
  }

  override update(keyStatsMap: KeyStatsMap) {
    const alphabetSize = this.settings.get(lessonProps.guided.alphabetSize);
    const recoverKeys = this.settings.get(lessonProps.guided.recoverKeys);

    const letters = this.#getLetters();

    const minSize = 6;
    const maxSize =
      minSize + Math.round((letters.length - minSize) * alphabetSize);

    const target = new Target(this.settings);

    const lessonKeys = new LessonKeys(
      letters.map((letter) => LessonKey.from(keyStatsMap.get(letter), target)),
    );

    for (const lessonKey of lessonKeys) {
      const includedKeys = lessonKeys.findIncludedKeys();

      if (includedKeys.length < minSize) {
        // Meet the minimal required alphabet size.
        lessonKeys.include(lessonKey.letter);
        continue;
      }

      if (includedKeys.length < maxSize) {
        // Meet the maximal required alphabet size.
        lessonKeys.force(lessonKey.letter);
        continue;
      }

      if ((lessonKey.bestConfidence ?? 0) >= 1) {
        // Must include all confident keys.
        lessonKeys.include(lessonKey.letter);
        continue;
      }

      if (recoverKeys) {
        if (includedKeys.every((key) => (key.confidence ?? 0) >= 1)) {
          // Include a new key only when all the previous keys
          // are now above the target speed.
          lessonKeys.include(lessonKey.letter);
          continue;
        }
      } else {
        if (includedKeys.every((key) => (key.bestConfidence ?? 0) >= 1)) {
          // Include a new key only when all the previous keys
          // were once above the target speed.
          lessonKeys.include(lessonKey.letter);
          continue;
        }
      }
    }

    // Find the least confident of all included keys and focus on it.
    const confidenceOf = (key: LessonKey): number => {
      return recoverKeys ? (key.confidence ?? 0) : (key.bestConfidence ?? 0);
    };
    const weakestKeys = lessonKeys
      .findIncludedKeys()
      .filter((key) => confidenceOf(key) < 1)
      .sort((a, b) => confidenceOf(a) - confidenceOf(b));
    if (weakestKeys.length > 0) {
      lessonKeys.focus(weakestKeys[0].letter);
    }

    return lessonKeys;
  }

  override generate(lessonKeys: LessonKeys, rng: RNGStream) {
    const filter = new Filter(
      lessonKeys.findIncludedKeys(),
      lessonKeys.findFocusedKey(),
    );
    const wordGenerator =
      this.model.language.id === "ja" &&
      this.keyboard.layout.id === "ja-romaji" &&
      this.settings.get(lessonProps.japanese.balanceKana)
        ? this.#makeBalancedWordGenerator(lessonKeys, rng)
        : this.#makeWordGenerator(filter, rng);
    let words = mangledWords(
      uniqueWords(wordGenerator),
      this.model.language,
      Letter.restrict(Letter.punctuators, this.codePoints),
      {
        withCapitals: this.settings.get(lessonProps.capitals),
        withPunctuators: this.settings.get(lessonProps.punctuators),
      },
      rng,
    );
    return generateFragment(this.settings, words, {
      repeatWords: this.settings.get(lessonProps.repeatWords),
      baseLength: this.model.language.id === "ja" ? 50 : 100,
    });
  }

  #getLetters() {
    const { letters } = this.model;
    if (this.model.language.id === "ja") {
      const order = new Map<number, number>();
      for (let i = 0; i < this.model.language.alphabet.length; i++) {
        order.set(this.model.language.alphabet[i], i);
      }
      const unknown = Number.MAX_SAFE_INTEGER;
      return [...letters].sort(
        (a, b) =>
          (order.get(a.codePoint) ?? unknown) -
            (order.get(b.codePoint) ?? unknown) || a.codePoint - b.codePoint,
      );
    }

    const { codePoints } = this;
    if (this.settings.get(lessonProps.guided.keyboardOrder)) {
      return Letter.weightedFrequencyOrder(letters, ({ codePoint }) =>
        codePoints.weight(codePoint),
      );
    } else {
      return Letter.frequencyOrder(letters);
    }
  }

  #makeWordGenerator(filter: Filter, rng: RNGStream) {
    const pseudoWords = phoneticWords(this.model, filter, rng);
    if (this.settings.get(lessonProps.guided.naturalWords)) {
      if (this.model.language.id === "ja" && this.katakanaDictionary != null) {
        return this.#makeJapaneseNaturalWordGenerator(filter, rng, pseudoWords);
      }
      const words = this.dictionary.find(filter).slice(0, 1000);
      while (words.length < 15) {
        const word = pseudoWords();
        if (word != null) {
          words.push(word);
        } else {
          break;
        }
      }
      if (words.length === 0) {
        words.push("?");
      }
      return randomWords(words, rng);
    }
    return pseudoWords;
  }

  #makeJapaneseNaturalWordGenerator(
    filter: Filter,
    rng: RNGStream,
    pseudoWords: () => string | "" | null,
  ) {
    const hiraganaWords = this.dictionary.find(filter).slice(0, 1000);
    const katakanaWords = this.katakanaDictionary?.find(filter).slice(0, 1000);
    const katakanaRatio = this.settings.get(lessonProps.japanese.katakanaRatio);
    const hiraganaGenerator = randomWords(hiraganaWords, rng);
    const katakanaGenerator = randomWords(katakanaWords ?? [], rng);

    return () => {
      const preferKatakana =
        katakanaWords != null &&
        katakanaWords.length > 0 &&
        katakanaRatio > 0 &&
        rng() < katakanaRatio;
      let word = preferKatakana ? katakanaGenerator() : hiraganaGenerator();
      if (word == null || word === "") {
        word = preferKatakana ? hiraganaGenerator() : katakanaGenerator();
      }
      if (word == null || word === "") {
        word = pseudoWords();
      }
      return word;
    };
  }

  #createDictionary(
    wordList: WordList,
    normalizeCodePoint?: (codePoint: number) => number,
  ) {
    const dictCodePoints =
      this.model.language.id === "ja"
        ? japaneseDictionaryCodePoints(this.model.letters)
        : this.codePoints;
    let dictionaryWords = filterWordList(
      wordList,
      dictCodePoints,
      normalizeCodePoint,
    ).filter((word) => word.length > 2);
    if (this.model.language.id === "ja") {
      dictionaryWords = dictionaryWords.filter(
        (word) => !endsWithSmallTsu(word),
      );
    }
    return new Dictionary(dictionaryWords, normalizeCodePoint);
  }

  #makeBalancedWordGenerator(lessonKeys: LessonKeys, rng: RNGStream) {
    const includedKeys = lessonKeys.findIncludedKeys();
    const focusedKey = lessonKeys.findFocusedKey();
    const baseFilter = new Filter(includedKeys, focusedKey);
    const baseGenerator = this.#makeWordGenerator(baseFilter, rng);
    if (focusedKey == null) {
      return baseGenerator;
    }
    const otherKeys = includedKeys.filter(
      (k) => k.letter.codePoint !== focusedKey.letter.codePoint,
    );
    if (otherKeys.length === 0) {
      return baseGenerator;
    }
    const otherGenerators = otherKeys.map((key) =>
      this.#makeWordGenerator(new Filter(includedKeys, key), rng),
    );
    let otherIndex = 0;
    let count = 0;
    // Keep the original keybr behavior (focused key in most words), but ensure
    // every unlocked kana appears regularly even if the phonetic model's
    // transitions make it rare with the current focus.
    return () => {
      count++;
      if (count % 4 !== 0) {
        return baseGenerator();
      }
      const gen = otherGenerators[otherIndex++ % otherGenerators.length];
      return gen();
    };
  }
}

function japaneseDictionaryCodePoints(letters: readonly Letter[]) {
  const codePoints = new Set<number>();
  for (const { codePoint } of letters) {
    codePoints.add(codePoint);
    const katakana = toKatakanaCodePoint(codePoint);
    if (katakana != null) {
      codePoints.add(katakana);
    }
  }
  return codePoints;
}

function normalizeJapaneseCodePoint(codePoint: number): number {
  if (codePoint >= 0x30a1 && codePoint <= 0x30f6) {
    return codePoint - 0x60;
  }
  return codePoint;
}

function toKatakanaCodePoint(codePoint: number): number | null {
  if (codePoint >= 0x3041 && codePoint <= 0x3096) {
    return codePoint + 0x60;
  }
  return null;
}
