import { type KeyStatsMap } from "@keybr/result";

export function hasKanaStats(keyStatsMap: KeyStatsMap): boolean {
  return keyStatsMap.letters.some(({ codePoint }) =>
    isKanaCodePoint(codePoint),
  );
}

export function isKanaCodePoint(codePoint: number): boolean {
  return (
    (codePoint >= 0x3041 && codePoint <= 0x309f) ||
    (codePoint >= 0x30a1 && codePoint <= 0x30ff)
  );
}
