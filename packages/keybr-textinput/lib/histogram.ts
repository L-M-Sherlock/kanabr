import { type CodePoint } from "@keybr/unicode";
import { type Step } from "./textinput.ts";

export type Sample = {
  readonly codePoint: CodePoint;
  readonly hitCount: number;
  readonly missCount: number;
  readonly timeToType: number;
};

export class Histogram implements Iterable<Sample> {
  static readonly empty = Histogram.from([]);

  readonly #data: Map<CodePoint, Sample>;

  constructor(samples: readonly Sample[]) {
    this.#data = new Map(
      Array.from(samples)
        .sort((a, b) => a.codePoint - b.codePoint)
        .map((sample) => [sample.codePoint, sample]),
    );
  }

  [Symbol.iterator](): IterableIterator<Sample> {
    return this.#data.values();
  }

  get complexity(): number {
    return this.#data.size;
  }

  has(codePoint: CodePoint): boolean {
    return this.#data.has(codePoint);
  }

  get(codePoint: CodePoint): Sample | null {
    return this.#data.get(codePoint) ?? null;
  }

  validate(): boolean {
    if (this.#data.size < 3) {
      return false; // Too few characters.
    }
    for (const sample of this.#data.values()) {
      if (!validateSample(sample)) {
        return false;
      }
    }
    return true;
  }

  static from(steps: readonly Step[]): Histogram {
    const strokeOffset = timeToTypeStrokeOffset(steps);
    const fallbackOffset = wordStartOffset(steps);
    const samples = new Map<
      CodePoint,
      {
        hitCount: number;
        missCount: number;
        time: number;
        count: number;
      }
    >();
    for (const {
      codePoint,
      timeToType,
      typo,
      wordStart,
      timeToTypeStrokes,
    } of steps) {
      let sample = samples.get(codePoint);
      if (sample == null) {
        samples.set(
          codePoint,
          (sample = {
            hitCount: 0,
            missCount: 0,
            time: 0,
            count: 0,
          }),
        );
      }
      sample.hitCount += 1;
      if (typo) {
        sample.missCount += 1;
      } else if (timeToType > 0) {
        sample.time += hasTimeToTypeStrokes(timeToTypeStrokes)
          ? adjustStrokeTimeToType(timeToTypeStrokes, strokeOffset)
          : adjustTimeToType(timeToType, wordStart === true, fallbackOffset);
        sample.count += 1;
      }
    }
    return new Histogram(
      [...samples.entries()]
        .map(([codePoint, { hitCount, missCount, time, count }]) => ({
          codePoint,
          hitCount,
          missCount,
          timeToType: time > 0 && count > 0 ? Math.round(time / count) : 0,
        }))
        .filter(validateSample),
    );
  }
}

function hasTimeToTypeStrokes(
  strokes: Step["timeToTypeStrokes"],
): strokes is NonNullable<Step["timeToTypeStrokes"]> {
  return strokes != null && strokes.length > 0;
}

function adjustStrokeTimeToType(
  strokes: readonly {
    readonly timeToType: number;
    readonly wordStart?: boolean;
  }[],
  offset: number,
): number {
  let time = 0;
  let count = 0;
  for (const { timeToType, wordStart } of strokes) {
    if (timeToType > 0) {
      time += adjustTimeToType(timeToType, wordStart === true, offset);
      count++;
    }
  }
  return count > 0 ? time / count : 0;
}

function adjustTimeToType(
  timeToType: number,
  wordStart: boolean,
  offset: number,
): number {
  if (wordStart && offset > 0) {
    return Math.max(40, timeToType - offset);
  }
  return timeToType;
}

function timeToTypeStrokeOffset(steps: readonly Step[]): number {
  const wordStart: number[] = [];
  const normal: number[] = [];
  const seen = new Set<number>();
  for (const { timeToTypeStrokes, timeToTypeSequenceId, typo } of steps) {
    if (typo || !hasTimeToTypeStrokes(timeToTypeStrokes)) {
      continue;
    }
    if (timeToTypeSequenceId != null) {
      if (seen.has(timeToTypeSequenceId)) {
        continue;
      }
      seen.add(timeToTypeSequenceId);
    }
    for (const { timeToType, wordStart: isWordStart } of timeToTypeStrokes) {
      if (timeToType > 0) {
        if (isWordStart) {
          wordStart.push(timeToType);
        } else {
          normal.push(timeToType);
        }
      }
    }
  }
  return offsetFrom(wordStart, normal);
}

function wordStartOffset(steps: readonly Step[]): number {
  const wordStart: number[] = [];
  const normal: number[] = [];
  for (const {
    timeToType,
    typo,
    wordStart: isWordStart,
    timeToTypeStrokes,
  } of steps) {
    if (!hasTimeToTypeStrokes(timeToTypeStrokes) && !typo && timeToType > 0) {
      if (isWordStart) {
        wordStart.push(timeToType);
      } else {
        normal.push(timeToType);
      }
    }
  }
  return offsetFrom(wordStart, normal);
}

function offsetFrom(wordStart: readonly number[], normal: readonly number[]) {
  if (wordStart.length < 5 || normal.length < 5) {
    return 0;
  }
  return Math.max(0, median(wordStart) - median(normal));
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function validateSample({ timeToType }: Sample): boolean {
  if (timeToType > 0) {
    if (timeToType < /* 300WPM/1500CPM */ 40) {
      return false; // Too fast.
    }
    if (timeToType > /* 1WPM/5CPM */ 12000) {
      return false; // Too slow.
    }
  }
  return true;
}
