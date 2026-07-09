import {
  JAPANESE_HIRAGANA_ALPHABET,
  JAPANESE_KATAKANA_ALPHABET,
  JAPANESE_PRACTICE_ALPHABET,
} from "@keybr/keyboard";
import { Letter } from "@keybr/phonetic-model";
import { type CodePoint, toCodePoints } from "@keybr/unicode";

export type JapanesePracticeScript = "hiragana" | "katakana";

const HIRAGANA_CODE_POINTS = new Set(toCodePoints(JAPANESE_HIRAGANA_ALPHABET));
const KATAKANA_CODE_POINTS = new Set(toCodePoints(JAPANESE_KATAKANA_ALPHABET));
const FREQUENCY_FALLBACKS = new Map<CodePoint, CodePoint>(
  [
    ["ぅ", "う"],
    ["ゔ", "う"],
  ].map(([from, to]) => [from.codePointAt(0)!, to.codePointAt(0)!]),
);
const PRACTICE_ORDER = new Map<CodePoint, number>(
  [...toCodePoints(JAPANESE_PRACTICE_ALPHABET)].map((codePoint, index) => [
    codePoint,
    index,
  ]),
);

export function makeJapanesePracticeLetters(
  letters: readonly Letter[],
): Letter[] {
  const source = new Map(letters.map((letter) => [letter.codePoint, letter]));
  const out: Letter[] = [];

  for (const codePoint of toCodePoints(JAPANESE_HIRAGANA_ALPHABET)) {
    const letter = sourceLetter(source, codePoint);
    if (letter != null) {
      out.push(new Letter(codePoint, letter.f));
    }
  }

  for (const codePoint of toCodePoints(JAPANESE_KATAKANA_ALPHABET)) {
    const letter = sourceLetter(source, codePoint);
    if (letter != null) {
      out.push(new Letter(codePoint, letter.f));
    }
  }

  return out;
}

function sourceLetter(
  source: ReadonlyMap<CodePoint, Letter>,
  codePoint: CodePoint,
): Letter | null {
  for (const sourceCodePoint of sourceCodePoints(codePoint)) {
    const letter = source.get(sourceCodePoint);
    if (letter != null) {
      return letter;
    }
  }
  return null;
}

function sourceCodePoints(codePoint: CodePoint): CodePoint[] {
  const hiragana = toHiraganaCodePoint(codePoint);
  const fallback = FREQUENCY_FALLBACKS.get(hiragana);
  return [...new Set([codePoint, hiragana, fallback])].filter(
    (codePoint): codePoint is CodePoint => codePoint != null,
  );
}

export function orderJapanesePracticeLetters(
  letters: readonly Letter[],
): Letter[] {
  const unknown = Number.MAX_SAFE_INTEGER;
  return [...letters].sort(
    (a, b) =>
      (PRACTICE_ORDER.get(a.codePoint) ?? unknown) -
        (PRACTICE_ORDER.get(b.codePoint) ?? unknown) ||
      a.codePoint - b.codePoint,
  );
}

export function japanesePracticeScriptOf(
  codePoint: CodePoint,
): JapanesePracticeScript | null {
  if (HIRAGANA_CODE_POINTS.has(codePoint)) {
    return "hiragana";
  }
  if (KATAKANA_CODE_POINTS.has(codePoint)) {
    return "katakana";
  }
  return null;
}

export function japanesePracticeCodePoints(
  script: JapanesePracticeScript,
): Set<CodePoint> {
  switch (script) {
    case "hiragana":
      return new Set(HIRAGANA_CODE_POINTS);
    case "katakana":
      return new Set(KATAKANA_CODE_POINTS);
  }
}

export function toHiraganaCodePoint(codePoint: CodePoint): CodePoint {
  if (codePoint === /* "ー" */ 0x30fc) {
    return codePoint;
  }
  if (codePoint >= 0x30a1 && codePoint <= 0x30f6) {
    return (codePoint - 0x0060) as CodePoint;
  }
  return codePoint;
}

export function toKatakanaCodePoint(codePoint: CodePoint): CodePoint {
  if (codePoint === /* "ー" */ 0x30fc) {
    return codePoint;
  }
  if (codePoint >= 0x3041 && codePoint <= 0x3096) {
    return (codePoint + 0x0060) as CodePoint;
  }
  return codePoint;
}

export function toKatakanaText(text: string): string {
  return String.fromCodePoint(
    ...[...toCodePoints(text)].map((codePoint) =>
      toKatakanaCodePoint(codePoint),
    ),
  );
}
