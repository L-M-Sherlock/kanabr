import { type WordList } from "@keybr/content";
import { type Keyboard } from "@keybr/keyboard";
import { Filter, Letter, type PhoneticModel } from "@keybr/phonetic-model";
import { type RNGStream } from "@keybr/rand";
import { type KeyStatsMap } from "@keybr/result";
import { type Settings } from "@keybr/settings";
import { type CodePoint } from "@keybr/unicode";
import { Dictionary, filterWordList } from "./dictionary.ts";
import {
  japanesePracticeCodePoints,
  type JapanesePracticeScript,
  japanesePracticeScriptOf,
  makeJapanesePracticeLetters,
  orderJapanesePracticeLetters,
  toHiraganaCodePoint,
  toKatakanaText,
} from "./japanese.ts";
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
  type WordGenerator,
} from "./text/words.ts";

const minNaturalWordCount = 10;
const minLessonKeyCount = 6;
const japaneseMinLessonKeyCount = 5;

export class GuidedLesson extends Lesson {
  readonly #letters: readonly Letter[];
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
    this.#letters = this.#isJapaneseRomaji()
      ? makeJapanesePracticeLetters(this.model.letters)
      : this.model.letters;
    this.dictionary = this.#createDictionary(wordList, "hiragana");
    this.katakanaDictionary =
      this.#isJapaneseRomaji() && katakanaWordList != null
        ? this.#createDictionary(katakanaWordList, "katakana")
        : null;
  }

  override get letters() {
    return this.#letters;
  }

  override update(keyStatsMap: KeyStatsMap) {
    const alphabetSize = this.settings.get(lessonProps.guided.alphabetSize);
    const recoverKeys = this.settings.get(lessonProps.guided.recoverKeys);

    const letters = this.#getLetters();

    const minSize = this.#isJapaneseRomaji()
      ? japaneseMinLessonKeyCount
      : minLessonKeyCount;
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

    this.#includeJapaneseScriptMinSize(lessonKeys, minSize);

    return lessonKeys;
  }

  override generate(lessonKeys: LessonKeys, rng: RNGStream) {
    const wordGenerator = this.#isJapaneseRomaji()
      ? this.settings.get(lessonProps.japanese.balanceKana)
        ? this.#makeBalancedJapaneseWordGenerator(lessonKeys, rng)
        : this.#makeJapaneseWordGenerator(
            lessonKeys.findIncludedKeys(),
            lessonKeys.findFocusedKey(),
            rng,
          )
      : this.#makeWordGenerator(
          new Filter(
            lessonKeys.findIncludedKeys(),
            lessonKeys.findFocusedKey(),
          ),
          rng,
        );
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
    const { letters } = this;
    if (this.#isJapaneseRomaji()) {
      return orderJapanesePracticeLetters(letters);
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
      const words = [...this.dictionary.find(filter)];
      while (words.length < minNaturalWordCount) {
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

  #makeJapaneseWordGenerator(
    includedKeys: readonly LessonKey[],
    focusedKey: LessonKey | null,
    rng: RNGStream,
  ): WordGenerator {
    const focusedScript =
      focusedKey != null
        ? japanesePracticeScriptOf(focusedKey.letter.codePoint)
        : null;

    const generators: {
      readonly script: JapanesePracticeScript;
      readonly generate: WordGenerator;
    }[] = [];
    for (const script of ["hiragana", "katakana"] as const) {
      if (
        includedKeys.some(
          ({ letter }) => japanesePracticeScriptOf(letter.codePoint) === script,
        )
      ) {
        generators.push({
          script,
          generate: this.#makeJapaneseScriptWordGenerator(
            script,
            includedKeys,
            focusedScript === script ? focusedKey : null,
            rng,
          ),
        });
      }
    }
    if (generators.length === 0) {
      return () => "?";
    }
    if (generators.length === 1) {
      return generators[0].generate;
    }
    const focusedGenerator =
      focusedScript != null
        ? generators.find(({ script }) => script === focusedScript)?.generate
        : null;
    const otherGenerators = generators
      .filter(({ script }) => script !== focusedScript)
      .map(({ generate }) => generate);
    if (focusedGenerator != null && otherGenerators.length > 0) {
      let count = 0;
      let otherIndex = 0;
      return () => {
        count++;
        if (count % 4 !== 0) {
          return focusedGenerator();
        }
        const gen = otherGenerators[otherIndex++ % otherGenerators.length];
        return gen();
      };
    }
    return () => generators[Math.floor(rng() * generators.length)].generate();
  }

  #makeJapaneseScriptWordGenerator(
    script: JapanesePracticeScript,
    includedKeys: readonly LessonKey[],
    focusedKey: LessonKey | null,
    rng: RNGStream,
  ): WordGenerator {
    const scriptKeys = includedKeys.filter(
      ({ letter }) => japanesePracticeScriptOf(letter.codePoint) === script,
    );
    if (scriptKeys.length === 0) {
      return () => null;
    }
    const filter = new Filter(
      scriptKeys,
      focusedKey != null &&
        japanesePracticeScriptOf(focusedKey.letter.codePoint) === script
        ? focusedKey
        : null,
    );
    const pseudoWords = this.#makeJapanesePseudoWordGenerator(
      script,
      filter,
      rng,
    );
    if (this.settings.get(lessonProps.guided.naturalWords)) {
      const dictionary =
        script === "katakana" ? this.katakanaDictionary : this.dictionary;
      const words = [...(dictionary?.find(filter) ?? [])];
      while (words.length < minNaturalWordCount) {
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

  #makeJapanesePseudoWordGenerator(
    script: JapanesePracticeScript,
    filter: Filter,
    rng: RNGStream,
  ): WordGenerator {
    const pseudoWords = phoneticWords(
      this.model,
      script === "katakana" ? toHiraganaFilter(filter) : filter,
      rng,
    );
    if (script === "katakana") {
      return () => {
        const word = pseudoWords();
        return word != null ? toKatakanaText(word) : word;
      };
    }
    return pseudoWords;
  }

  #createDictionary(wordList: WordList, script?: JapanesePracticeScript) {
    const dictCodePoints = this.#isJapaneseRomaji()
      ? japanesePracticeCodePoints(script ?? "hiragana")
      : this.codePoints;
    let dictionaryWords = filterWordList(wordList, dictCodePoints).filter(
      (word) => word.length >= 2,
    );
    if (this.model.language.id === "ja") {
      dictionaryWords = dictionaryWords.filter(
        (word) => !endsWithSmallTsu(word),
      );
    }
    return new Dictionary(dictionaryWords);
  }

  #makeBalancedJapaneseWordGenerator(lessonKeys: LessonKeys, rng: RNGStream) {
    const includedKeys = lessonKeys.findIncludedKeys();
    const focusedKey = lessonKeys.findFocusedKey();
    const baseGenerator = this.#makeJapaneseWordGenerator(
      includedKeys,
      focusedKey,
      rng,
    );
    if (focusedKey == null) {
      return baseGenerator;
    }
    const otherKeys = includedKeys.filter(
      (key) => key.letter.codePoint !== focusedKey.letter.codePoint,
    );
    if (otherKeys.length === 0) {
      return baseGenerator;
    }
    const otherGenerators = otherKeys.map((key) =>
      this.#makeJapaneseWordGenerator(includedKeys, key, rng),
    );
    let otherIndex = 0;
    let count = 0;
    return () => {
      count++;
      if (count % 4 !== 0) {
        return baseGenerator();
      }
      const gen = otherGenerators[otherIndex++ % otherGenerators.length];
      return gen();
    };
  }

  #isJapaneseRomaji() {
    return (
      this.model.language.id === "ja" && this.keyboard.layout.id === "ja-romaji"
    );
  }

  #includeJapaneseScriptMinSize(lessonKeys: LessonKeys, minSize: number): void {
    if (!this.#isJapaneseRomaji()) {
      return;
    }
    const focusedKey = lessonKeys.findFocusedKey();
    if (focusedKey == null) {
      return;
    }
    const script = japanesePracticeScriptOf(focusedKey.letter.codePoint);
    if (script == null) {
      return;
    }
    let includedScriptKeyCount = lessonKeys
      .findIncludedKeys()
      .filter(
        ({ letter }) => japanesePracticeScriptOf(letter.codePoint) === script,
      ).length;
    for (const { letter, isIncluded } of lessonKeys) {
      if (includedScriptKeyCount >= minSize) {
        break;
      }
      if (
        !isIncluded &&
        japanesePracticeScriptOf(letter.codePoint) === script
      ) {
        lessonKeys.include(letter);
        includedScriptKeyCount++;
      }
    }
  }
}

function toHiraganaFilter({ codePoints, focusedCodePoint }: Filter): Filter {
  const letters = new Map<CodePoint, Letter>();
  if (codePoints != null) {
    for (const codePoint of codePoints as unknown as Iterable<CodePoint>) {
      const hiragana = toHiraganaCodePoint(codePoint);
      if (!letters.has(hiragana)) {
        letters.set(hiragana, new Letter(hiragana, 1));
      }
    }
  }
  const list = codePoints != null ? [...letters.values()] : null;
  const focusedCodePointH =
    focusedCodePoint != null
      ? toHiraganaCodePoint(focusedCodePoint as CodePoint)
      : null;
  const focused =
    focusedCodePointH != null
      ? (letters.get(focusedCodePointH) ?? new Letter(focusedCodePointH, 1))
      : null;
  if (list != null && list.length === 0) {
    return Filter.empty;
  }
  return new Filter(list, focused);
}
