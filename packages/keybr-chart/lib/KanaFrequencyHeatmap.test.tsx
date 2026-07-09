import { ok } from "node:assert/strict";
import { test } from "node:test";
import {
  JAPANESE_HIRAGANA_ALPHABET,
  JAPANESE_KATAKANA_ALPHABET,
} from "@keybr/keyboard";
import { Letter } from "@keybr/phonetic-model";
import { MutableKeyStatsMap } from "@keybr/result";
import { render } from "@testing-library/react";
import { KanaFrequencyHeatmap } from "./KanaFrequencyHeatmap.tsx";

test("render complete japanese practice alphabet", () => {
  const letters = [
    ...JAPANESE_HIRAGANA_ALPHABET,
    ...JAPANESE_KATAKANA_ALPHABET,
  ].map((letter) => new Letter(letter.codePointAt(0)!, 1));
  const keyStatsMap = new MutableKeyStatsMap(letters).copy();
  const r = render(<KanaFrequencyHeatmap keyStatsMap={keyStatsMap} />);
  const text = r.container.textContent!;

  for (const letter of JAPANESE_HIRAGANA_ALPHABET) {
    ok(text.includes(letter));
  }
  for (const letter of JAPANESE_KATAKANA_ALPHABET) {
    ok(text.includes(letter));
  }
  ok(!text.includes("ぁ"));

  r.unmount();
});
