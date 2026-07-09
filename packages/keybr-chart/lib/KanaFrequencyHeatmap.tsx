import {
  JAPANESE_HIRAGANA_ALPHABET,
  JAPANESE_KATAKANA_ALPHABET,
} from "@keybr/keyboard";
import { type KeyStatsMap } from "@keybr/result";
import { type ReactNode, useMemo } from "react";
import * as styles from "./KanaFrequencyHeatmap.module.less";

const HIRAGANA_GRID: readonly (readonly (string | null)[])[] = [
  ["あ", "い", "う", "え", "お"],
  ["か", "き", "く", "け", "こ"],
  ["さ", "し", "す", "せ", "そ"],
  ["た", "ち", "つ", "て", "と"],
  ["な", "に", "ぬ", "ね", "の"],
  ["は", "ひ", "ふ", "へ", "ほ"],
  ["ま", "み", "む", "め", "も"],
  ["や", null, "ゆ", null, "よ"],
  ["ら", "り", "る", "れ", "ろ"],
  ["わ", null, "を", null, "ん"],
  ["っ", null, null, null, null],
  ["が", "ぎ", "ぐ", "げ", "ご"],
  ["ざ", "じ", "ず", "ぜ", "ぞ"],
  ["だ", "ぢ", "づ", "で", "ど"],
  ["ば", "び", "ぶ", "べ", "ぼ"],
  ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"],
  ["ゃ", null, "ゅ", null, "ょ"],
  [null, null, null, null, null],
];

const KATAKANA_GRID: readonly (readonly (string | null)[])[] = [
  ["ア", "イ", "ウ", "エ", "オ"],
  ["カ", "キ", "ク", "ケ", "コ"],
  ["サ", "シ", "ス", "セ", "ソ"],
  ["タ", "チ", "ツ", "テ", "ト"],
  ["ナ", "ニ", "ヌ", "ネ", "ノ"],
  ["ハ", "ヒ", "フ", "ヘ", "ホ"],
  ["マ", "ミ", "ム", "メ", "モ"],
  ["ヤ", null, "ユ", null, "ヨ"],
  ["ラ", "リ", "ル", "レ", "ロ"],
  ["ワ", null, "ヲ", null, "ン"],
  ["ッ", "ー", "ヴ", null, null],
  ["ガ", "ギ", "グ", "ゲ", "ゴ"],
  ["ザ", "ジ", "ズ", "ゼ", "ゾ"],
  ["ダ", null, "ヅ", "デ", "ド"],
  ["バ", "ビ", "ブ", "ベ", "ボ"],
  ["パ", "ピ", "プ", "ペ", "ポ"],
  ["ャ", null, "ュ", null, "ョ"],
  ["ァ", "ィ", "ゥ", "ェ", "ォ"],
];

const KANA_GRID = [HIRAGANA_GRID, KATAKANA_GRID];

const KANA_LIST = [
  ...JAPANESE_HIRAGANA_ALPHABET,
  ...JAPANESE_KATAKANA_ALPHABET,
];
const KANA_SET = new Set(KANA_LIST);

export function KanaFrequencyHeatmap({
  keyStatsMap,
}: {
  readonly keyStatsMap: KeyStatsMap;
}): ReactNode {
  const { hitMap, missMap } = useMemo(() => {
    const hitMap = new Map<string, number>();
    const missMap = new Map<string, number>();
    for (const { letter, samples } of keyStatsMap) {
      const kana = String.fromCodePoint(letter.codePoint);
      if (!KANA_SET.has(kana)) {
        continue;
      }
      let hit = 0;
      let miss = 0;
      for (const { hitCount, missCount } of samples) {
        hit += hitCount;
        miss += missCount;
      }
      if (hit > 0) {
        hitMap.set(kana, (hitMap.get(kana) ?? 0) + hit);
      }
      if (miss > 0) {
        missMap.set(kana, (missMap.get(kana) ?? 0) + miss);
      }
    }
    return { hitMap, missMap };
  }, [keyStatsMap]);

  const hitStats = useMemo(() => normalizeStats(hitMap), [hitMap]);
  const missStats = useMemo(() => normalizeStats(missMap), [missMap]);

  const blockCols = 5;
  const blockGap = 24;
  const cols = blockCols * KANA_GRID.length;
  const rows = Math.max(...KANA_GRID.map((grid) => grid.length));
  const cell = 26;
  const gap = 6;
  const pad = 6;
  const width =
    pad * 2 +
    cols * cell +
    (cols - 1) * gap +
    (KANA_GRID.length - 1) * blockGap;
  const height = pad * 2 + rows * cell + (rows - 1) * gap;
  const rMax = cell * 0.34;
  const rMin = cell * 0.14;

  return (
    <svg
      className={styles.root}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMinYMin meet"
    >
      {KANA_GRID.map((grid, blockIndex) =>
        grid.map((row, rowIndex) =>
          row.map((kana, colIndex) => {
            const blockOffset =
              blockIndex * (blockCols * (cell + gap) + blockGap);
            const cx = pad + blockOffset + colIndex * (cell + gap) + cell / 2;
            const cy = pad + rowIndex * (cell + gap) + cell / 2;
            if (kana == null) {
              return null;
            }
            const hit = hitMap.get(kana) ?? 0;
            const miss = missMap.get(kana) ?? 0;
            const hitR =
              hit > 0 ? rMin + hitStats.scale(hit) * (rMax - rMin) : 0;
            const missR =
              miss > 0 ? rMin + missStats.scale(miss) * (rMax - rMin) : 0;
            return (
              <g key={`${kana}-${rowIndex}-${colIndex}`}>
                {missR > 0 && (
                  <path
                    className={`${styles.spot} ${styles.spotMiss}`}
                    d={arcPath(cx, cy, missR, 0)}
                  />
                )}
                {hitR > 0 && (
                  <path
                    className={`${styles.spot} ${styles.spotHit}`}
                    d={arcPath(cx, cy, hitR, 1)}
                  />
                )}
                <text className={styles.label} x={cx} y={cy}>
                  {kana}
                </text>
              </g>
            );
          }),
        ),
      )}
    </svg>
  );
}

function arcPath(cx: number, cy: number, r: number, sweep: 0 | 1): string {
  return `M ${cx - r} ${cy + r} A ${r} ${r} 0 0 ${sweep} ${cx + r} ${cy - r}`;
}

function normalizeStats(map: Map<string, number>) {
  const values = [...map.values()];
  const nonZero = values.filter((value) => value > 0);
  if (nonZero.length === 0) {
    return { scale: () => 0.5 };
  }
  const min = Math.min(...nonZero);
  const max = Math.max(...nonZero);
  if (max <= min) {
    return { scale: () => 0.5 };
  }
  return {
    scale: (value: number) => (value - min) / (max - min),
  };
}
