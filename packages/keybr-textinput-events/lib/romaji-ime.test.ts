import { test } from "node:test";
import { deepEqual, equal } from "rich-assert";
import { RomajiIme, romajiOptionsForKana } from "./romaji-ime.ts";
import { type IInputEvent } from "./types.ts";

function ch(
  s: string,
  { timeStamp, timeToType = 100 }: { timeStamp: number; timeToType?: number } = { timeStamp: 0 },
): IInputEvent {
  return {
    type: "input",
    timeStamp,
    inputType: "appendChar",
    codePoint: s.codePointAt(0)!,
    timeToType,
  };
}

function space(timeStamp: number): IInputEvent {
  return ch(" ", { timeStamp });
}

function collect(ime: RomajiIme, ...events: IInputEvent[]): number[] {
  const out: number[] = [];
  for (const ev of events) {
    const res = ime.consume(ev);
    out.push(...res.events.map((e) => e.codePoint));
  }
  return out;
}

test("kya -> きゃ", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("k", { timeStamp: 1 }), ch("y", { timeStamp: 2 }), ch("a", { timeStamp: 3 }));
  deepEqual(cps, ["き".codePointAt(0)!, "ゃ".codePointAt(0)!]);
});

test("si -> し (Kunrei compatible)", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("s", { timeStamp: 1 }), ch("i", { timeStamp: 2 }));
  deepEqual(cps, ["し".codePointAt(0)!]);
});

test("fa -> ふぁ", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("f", { timeStamp: 1 }), ch("a", { timeStamp: 2 }));
  deepEqual(cps, ["ふ".codePointAt(0)!, "ぁ".codePointAt(0)!]);
});

test("she -> しぇ", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("s", { timeStamp: 1 }), ch("h", { timeStamp: 2 }), ch("e", { timeStamp: 3 }));
  deepEqual(cps, ["し".codePointAt(0)!, "ぇ".codePointAt(0)!]);
});

test("je -> じぇ", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("j", { timeStamp: 1 }), ch("e", { timeStamp: 2 }));
  deepEqual(cps, ["じ".codePointAt(0)!, "ぇ".codePointAt(0)!]);
});

test("wi -> うぃ", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("w", { timeStamp: 1 }), ch("i", { timeStamp: 2 }));
  deepEqual(cps, ["う".codePointAt(0)!, "ぃ".codePointAt(0)!]);
});

test("ye -> いぇ", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("y", { timeStamp: 1 }), ch("e", { timeStamp: 2 }));
  deepEqual(cps, ["い".codePointAt(0)!, "ぇ".codePointAt(0)!]);
});

test("qa -> くぁ", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("q", { timeStamp: 1 }), ch("a", { timeStamp: 2 }));
  deepEqual(cps, ["く".codePointAt(0)!, "ぁ".codePointAt(0)!]);
});

test("tsa -> つぁ", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("t", { timeStamp: 1 }), ch("s", { timeStamp: 2 }), ch("a", { timeStamp: 3 }));
  deepEqual(cps, ["つ".codePointAt(0)!, "ぁ".codePointAt(0)!]);
});

test("va -> ゔぁ", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("v", { timeStamp: 1 }), ch("a", { timeStamp: 2 }));
  deepEqual(cps, ["ゔ".codePointAt(0)!, "ぁ".codePointAt(0)!]);
});

test("wha -> うぁ", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("w", { timeStamp: 1 }), ch("h", { timeStamp: 2 }), ch("a", { timeStamp: 3 }));
  deepEqual(cps, ["う".codePointAt(0)!, "ぁ".codePointAt(0)!]);
});

test("thi/thu/twu -> てぃ/てゅ/とぅ", () => {
  {
    const ime = new RomajiIme();
    const cps = collect(ime, ch("t", { timeStamp: 1 }), ch("h", { timeStamp: 2 }), ch("i", { timeStamp: 3 }));
    deepEqual(cps, ["て".codePointAt(0)!, "ぃ".codePointAt(0)!]);
  }
  {
    const ime = new RomajiIme();
    const cps = collect(ime, ch("t", { timeStamp: 1 }), ch("h", { timeStamp: 2 }), ch("u", { timeStamp: 3 }));
    deepEqual(cps, ["て".codePointAt(0)!, "ゅ".codePointAt(0)!]);
  }
  {
    const ime = new RomajiIme();
    const cps = collect(ime, ch("t", { timeStamp: 1 }), ch("w", { timeStamp: 2 }), ch("u", { timeStamp: 3 }));
    deepEqual(cps, ["と".codePointAt(0)!, "ぅ".codePointAt(0)!]);
  }
});

test("dhi/dhu/dwu -> でぃ/でゅ/どぅ", () => {
  {
    const ime = new RomajiIme();
    const cps = collect(ime, ch("d", { timeStamp: 1 }), ch("h", { timeStamp: 2 }), ch("i", { timeStamp: 3 }));
    deepEqual(cps, ["で".codePointAt(0)!, "ぃ".codePointAt(0)!]);
  }
  {
    const ime = new RomajiIme();
    const cps = collect(ime, ch("d", { timeStamp: 1 }), ch("h", { timeStamp: 2 }), ch("u", { timeStamp: 3 }));
    deepEqual(cps, ["で".codePointAt(0)!, "ゅ".codePointAt(0)!]);
  }
  {
    const ime = new RomajiIme();
    const cps = collect(ime, ch("d", { timeStamp: 1 }), ch("w", { timeStamp: 2 }), ch("u", { timeStamp: 3 }));
    deepEqual(cps, ["ど".codePointAt(0)!, "ぅ".codePointAt(0)!]);
  }
});

test("n + space keeps preedit and swallows space", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("n", { timeStamp: 1 }), space(2));
  deepEqual(cps, []);
});

test("xn -> ん", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("x", { timeStamp: 1 }), ch("n", { timeStamp: 2 }));
  deepEqual(cps, ["ん".codePointAt(0)!]);
});

test("xn disambiguates ん before a vowel", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("x", { timeStamp: 1 }), ch("n", { timeStamp: 2 }), ch("a", { timeStamp: 3 }));
  deepEqual(cps, ["ん".codePointAt(0)!, "あ".codePointAt(0)!]);
});

test("kka -> っか", () => {
  const ime = new RomajiIme();
  const cps = collect(ime, ch("k", { timeStamp: 1 }), ch("k", { timeStamp: 2 }), ch("a", { timeStamp: 3 }));
  deepEqual(cps, ["っ".codePointAt(0)!, "か".codePointAt(0)!]);
});

test("double consonant assigns time to small っ", () => {
  const ime = new RomajiIme();
  const r1 = ime.consume(ch("k", { timeStamp: 1, timeToType: 500 }));
  const r2 = ime.consume(ch("k", { timeStamp: 2, timeToType: 50 }));
  const r3 = ime.consume(ch("a", { timeStamp: 3, timeToType: 50 }));
  const events = [...r1.events, ...r2.events, ...r3.events];
  equal(events.length, 2);
  equal(events[0].codePoint, "っ".codePointAt(0)!);
  equal(events[1].codePoint, "か".codePointAt(0)!);
  equal(events[0].timeToType, 50);
  equal(events[1].timeToType, (500 + 50) / 2);
});

test("word start stroke metadata", () => {
  const ime = new RomajiIme();
  const r1 = ime.consume(ch("k", { timeStamp: 1, timeToType: 300 }), {
    wordStartStroke: true,
  });
  const r2 = ime.consume(ch("a", { timeStamp: 2, timeToType: 100 }));
  const events = [...r1.events, ...r2.events];

  equal(events.length, 1);
  equal(events[0].codePoint, "か".codePointAt(0)!);
  equal(events[0].timeToType, 200);
  equal(events[0].timeToTypeSequenceId, 1);
  deepEqual(events[0].timeToTypeStrokes, [{ timeToType: 300, wordStart: true }, { timeToType: 100 }]);
});

test("multi-kana output shares word start stroke metadata", () => {
  const ime = new RomajiIme();
  const r1 = ime.consume(ch("k", { timeStamp: 1, timeToType: 300 }), {
    wordStartStroke: true,
  });
  const r2 = ime.consume(ch("y", { timeStamp: 2, timeToType: 100 }));
  const r3 = ime.consume(ch("a", { timeStamp: 3, timeToType: 100 }));
  const events = [...r1.events, ...r2.events, ...r3.events];

  equal(events.length, 2);
  equal(events[0].timeToTypeSequenceId, 1);
  equal(events[1].timeToTypeSequenceId, 1);
  deepEqual(events[0].timeToTypeStrokes, [
    { timeToType: 300, wordStart: true },
    { timeToType: 100 },
    { timeToType: 100 },
  ]);
  deepEqual(events[1].timeToTypeStrokes, events[0].timeToTypeStrokes);
});

test("double consonant keeps word start metadata on the base kana", () => {
  const ime = new RomajiIme();
  const r1 = ime.consume(ch("k", { timeStamp: 1, timeToType: 500 }), {
    wordStartStroke: true,
  });
  const r2 = ime.consume(ch("k", { timeStamp: 2, timeToType: 50 }));
  const r3 = ime.consume(ch("a", { timeStamp: 3, timeToType: 50 }));
  const events = [...r1.events, ...r2.events, ...r3.events];

  equal(events.length, 2);
  equal(events[0].codePoint, "っ".codePointAt(0)!);
  deepEqual(events[0].timeToTypeStrokes, [{ timeToType: 50 }]);
  equal(events[1].codePoint, "か".codePointAt(0)!);
  deepEqual(events[1].timeToTypeStrokes, [{ timeToType: 500, wordStart: true }, { timeToType: 50 }]);
});

test("xtu/ltu -> っ", () => {
  {
    const ime = new RomajiIme();
    const cps = collect(ime, ch("x", { timeStamp: 1 }), ch("t", { timeStamp: 2 }), ch("u", { timeStamp: 3 }));
    deepEqual(cps, ["っ".codePointAt(0)!]);
  }
  {
    const ime = new RomajiIme();
    const cps = collect(ime, ch("l", { timeStamp: 1 }), ch("t", { timeStamp: 2 }), ch("u", { timeStamp: 3 }));
    deepEqual(cps, ["っ".codePointAt(0)!]);
  }
});

test("extended combos", () => {
  const cases: ReadonlyArray<readonly [string, string]> = [
    ["kyi", "きぃ"],
    ["kye", "きぇ"],
    ["qwu", "くぅ"],
    ["gyi", "ぎぃ"],
    ["gye", "ぎぇ"],
    ["gwa", "ぐぁ"],
    ["gwi", "ぐぃ"],
    ["gwu", "ぐぅ"],
    ["gwe", "ぐぇ"],
    ["gwo", "ぐぉ"],
    ["syi", "しぃ"],
    ["swa", "すぁ"],
    ["swi", "すぃ"],
    ["swu", "すぅ"],
    ["swe", "すぇ"],
    ["swo", "すぉ"],
    ["zyi", "じぃ"],
    ["zyu", "じゅ"],
    ["zye", "じぇ"],
    ["zyo", "じょ"],
    ["tyi", "ちぃ"],
    ["tye", "ちぇ"],
    ["che", "ちぇ"],
    ["tha", "てゃ"],
    ["the", "てぇ"],
    ["tho", "てょ"],
    ["twa", "とぁ"],
    ["twi", "とぃ"],
    ["twe", "とぇ"],
    ["two", "とぉ"],
    ["dya", "ぢゃ"],
    ["dyi", "ぢぃ"],
    ["dyu", "ぢゅ"],
    ["dye", "ぢぇ"],
    ["dyo", "ぢょ"],
    ["dha", "でゃ"],
    ["dhe", "でぇ"],
    ["dho", "でょ"],
    ["dwa", "どぁ"],
    ["dwi", "どぃ"],
    ["dwe", "どぇ"],
    ["dwo", "どぉ"],
    ["nyi", "にぃ"],
    ["nye", "にぇ"],
    ["hyi", "ひぃ"],
    ["hye", "ひぇ"],
    ["fwu", "ふぅ"],
    ["byi", "びぃ"],
    ["bye", "びぇ"],
    ["pyi", "ぴぃ"],
    ["pye", "ぴぇ"],
    ["myi", "みぃ"],
    ["mye", "みぇ"],
    ["ryi", "りぃ"],
    ["rye", "りぇ"],
  ];

  const cpsOf = (s: string): number[] => [...s].map((c) => c.codePointAt(0)!);

  for (const [romaji, kana] of cases) {
    const ime = new RomajiIme();
    const events = [...romaji].map((c, i) => ch(c, { timeStamp: i + 1 }));
    const cps = collect(ime, ...events);
    deepEqual(cps, cpsOf(kana), `${romaji} -> ${kana}`);
  }
});

test("invalid romaji keeps preedit and swallows boundary", () => {
  const ime = new RomajiIme();
  const r1 = ime.consume(ch("q", { timeStamp: 1 }));
  equal(r1.valid, true);
  equal(r1.rejected, false);
  equal(r1.preedit, "q");
  deepEqual(r1.events, []);

  const r2 = ime.consume(ch("x", { timeStamp: 2 }));
  equal(r2.valid, false);
  equal(r2.rejected, true);
  equal(r2.preedit, "qx");
  deepEqual(r2.events, []);

  const r3 = ime.consume(ch("z", { timeStamp: 3 }));
  equal(r3.valid, false);
  equal(r3.rejected, true);
  equal(r3.preedit, "qxz");
  deepEqual(r3.events, []);

  const r4 = ime.consume(space(4));
  equal(r4.valid, false);
  equal(r4.rejected, true);
  equal(r4.preedit, "qxz");
  deepEqual(r4.events, []);
});

test("valid romaji prefixes are not rejected", () => {
  for (const prefix of ["q", "p", "py"]) {
    const ime = new RomajiIme();
    let result = ime.consume(ch(prefix[0], { timeStamp: 1 }));
    for (let i = 1; i < prefix.length; i++) {
      result = ime.consume(ch(prefix[i], { timeStamp: i + 1 }));
    }
    equal(result.valid, true, prefix);
    equal(result.rejected, false, prefix);
    equal(result.preedit, prefix, prefix);
    deepEqual(result.events, [], prefix);
  }
});

test("resolved romaji is not rejected", () => {
  const ime = new RomajiIme();
  ime.consume(ch("p", { timeStamp: 1 }));
  ime.consume(ch("y", { timeStamp: 2 }));

  const result = ime.consume(ch("a", { timeStamp: 3 }));
  equal(result.valid, true);
  equal(result.rejected, false);
  equal(result.preedit, "");
  deepEqual(
    result.events.map(({ codePoint }) => codePoint),
    ["ぴ".codePointAt(0)!, "ゃ".codePointAt(0)!],
  );
});

test("boundary characters are rejected while romaji is incomplete", () => {
  for (const boundary of ["1", "."]) {
    const ime = new RomajiIme();
    const prefix = ime.consume(ch("p", { timeStamp: 1 }));
    equal(prefix.rejected, false);

    const result = ime.consume(ch(boundary, { timeStamp: 2 }));
    equal(result.valid, true, boundary);
    equal(result.rejected, true, boundary);
    equal(result.preedit, "p", boundary);
    deepEqual(result.events, [], boundary);
  }
});

test("boundary characters are forwarded when preedit is empty", () => {
  for (const boundary of ["1", "."]) {
    const ime = new RomajiIme();
    const event = ch(boundary, { timeStamp: 1 });
    const result = ime.consume(event);
    equal(result.valid, true, boundary);
    equal(result.rejected, false, boundary);
    equal(result.preedit, "", boundary);
    deepEqual(result.events, [event], boundary);
  }
});

test("clear input is not rejected", () => {
  const ime = new RomajiIme();
  ime.consume(ch("q", { timeStamp: 1 }));
  ime.consume(ch("x", { timeStamp: 2 }));

  const clearChar: IInputEvent = {
    type: "input",
    timeStamp: 3,
    inputType: "clearChar",
    codePoint: 0x0000,
    timeToType: 100,
  };
  const r1 = ime.consume(clearChar);
  equal(r1.valid, true);
  equal(r1.rejected, false);
  equal(r1.preedit, "q");
  deepEqual(r1.events, []);

  const clearWord: IInputEvent = {
    ...clearChar,
    timeStamp: 4,
    inputType: "clearWord",
  };
  const r2 = ime.consume(clearWord);
  equal(r2.valid, true);
  equal(r2.rejected, false);
  equal(r2.preedit, "");
  deepEqual(r2.events, [clearWord]);
});

test("romaji options for ん and ン", () => {
  const options = ["nn", "n'", "xn", "n+consonant"];
  deepEqual(romajiOptionsForKana("ん"), options);
  deepEqual(romajiOptionsForKana("ン"), options);
});

test("romaji options for っ prioritizes double consonant", () => {
  deepEqual(romajiOptionsForKana("っ").at(0), "double consonant");
});
