import { filterText } from "@keybr/keyboard";
import { Feedback } from "@keybr/textinput";
import { type CodePoint } from "@keybr/unicode";

export type KanaSpeechPart = {
  readonly sequenceId: number;
  readonly text: string;
  readonly incorrect: boolean;
};

export type KanaSpeechSequence = {
  readonly text: string;
  readonly incorrect: boolean;
};

export type KanaSpeaker = {
  readonly speak: (text: string, incorrect: boolean) => void;
};

/**
 * Groups kana emitted from a single resolved romaji sequence and applies the
 * small-tsu rules that need to survive across separate IME results.
 */
export class KanaSpeechSession {
  readonly #speaker: KanaSpeaker;
  #pendingSokuon: KanaSpeechSequence | null = null;

  constructor(speaker: KanaSpeaker) {
    this.#speaker = speaker;
  }

  accept(parts: readonly KanaSpeechPart[]): void {
    for (const sequence of groupKanaSpeechParts(parts)) {
      this.#acceptSequence(sequence);
    }
  }

  reset(): void {
    this.#pendingSokuon = null;
  }

  #acceptSequence(sequence: KanaSpeechSequence): void {
    if (isSokuon(sequence.text)) {
      const pending = this.#pendingSokuon;
      this.#pendingSokuon =
        pending == null
          ? sequence
          : {
              text: pending.text + sequence.text,
              incorrect: pending.incorrect || sequence.incorrect,
            };
      return;
    }

    // The prolonged sound mark only has useful pronunciation in the context
    // of the preceding kana, which the speech player no longer has here.
    if (sequence.text === "ー") {
      return;
    }

    const pending = this.#pendingSokuon;
    this.#pendingSokuon = null;
    this.#speaker.speak(
      (pending?.text ?? "") + sequence.text,
      (pending?.incorrect ?? false) || sequence.incorrect,
    );
  }
}

export function groupKanaSpeechParts(
  parts: readonly KanaSpeechPart[],
): readonly KanaSpeechSequence[] {
  const result: KanaSpeechSequence[] = [];
  let sequenceId: number | null = null;

  for (const part of parts) {
    const previous = result.at(-1);
    if (previous != null && sequenceId === part.sequenceId) {
      result[result.length - 1] = {
        text: previous.text + part.text,
        incorrect: previous.incorrect || part.incorrect,
      };
    } else {
      result.push({ text: part.text, incorrect: part.incorrect });
      sequenceId = part.sequenceId;
    }
  }

  return result;
}

export function isKanaInputIncorrect(
  actual: CodePoint,
  expected: CodePoint,
): boolean {
  return actual !== expected && actual !== filterText.normalize(expected);
}

/**
 * The speech player replaces only the failed sound for the incorrect kana it
 * will pronounce. All other feedback continues through the regular player.
 */
export function shouldPlayKanaInputSound(
  feedback: Feedback,
  incorrectKana: boolean,
  kanaSpeechActive: boolean,
): boolean {
  return !(kanaSpeechActive && incorrectKana && feedback === Feedback.Failed);
}

function isSokuon(text: string): boolean {
  return text === "っ" || text === "ッ";
}
