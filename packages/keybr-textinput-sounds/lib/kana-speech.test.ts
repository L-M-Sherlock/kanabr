import { test } from "node:test";
import { Settings } from "@keybr/settings";
import { deepEqual, equal } from "rich-assert";
import {
  type KanaSpeechBackend,
  type KanaSpeechOptions,
  makeKanaSpeechPlayer,
} from "./kana-speech.ts";
import { soundProps, SpeakKana } from "./settings.ts";

test("speak kana is disabled by default", () => {
  const backend = new FakeBackend();
  const player = makeKanaSpeechPlayer(new Settings(), backend);

  player.speak("かな", false);

  equal(backend.calls.length, 0);
});

test("speaks all kana with Japanese speech options", () => {
  const backend = new FakeBackend();
  const player = makeKanaSpeechPlayer(
    new Settings()
      .set(soundProps.speakKana, SpeakKana.All)
      .set(soundProps.soundVolume, 0.25),
    backend,
  );

  player.speak("きゃ", false);

  equal(backend.calls.length, 1);
  equal(backend.calls[0].text, "きゃ");
  deepEqual(backend.calls[0].options, {
    lang: "ja-JP",
    volume: 0.25,
    rate: 1,
    pitch: 1,
  });
});

test("speaks only incorrect kana in errors-only mode", () => {
  const backend = new FakeBackend();
  const player = makeKanaSpeechPlayer(
    new Settings().set(soundProps.speakKana, SpeakKana.ErrorsOnly),
    backend,
  );

  player.speak("か", false);
  player.speak("き", true);

  equal(backend.calls.length, 1);
  equal(backend.calls[0].text, "き");
});

test("keeps only the latest kana while speech is active", () => {
  const backend = new FakeBackend();
  const player = makePlayer(backend);

  player.speak("か", false);
  player.speak("き", false);
  player.speak("く", false);

  deepEqual(
    backend.calls.map(({ text }) => text),
    ["か"],
  );

  backend.calls[0].onEnd();

  deepEqual(
    backend.calls.map(({ text }) => text),
    ["か", "く"],
  );
});

test("continues with pending kana after a speech error", () => {
  const backend = new FakeBackend();
  const player = makePlayer(backend);

  player.speak("か", false);
  player.speak("き", false);
  backend.calls[0].onError();

  deepEqual(
    backend.calls.map(({ text }) => text),
    ["か", "き"],
  );
});

test("cancel clears pending kana and ignores stale callbacks", () => {
  const backend = new FakeBackend();
  const player = makePlayer(backend);

  player.speak("か", false);
  player.speak("き", false);
  player.cancel();

  equal(backend.cancelCount, 1);
  backend.calls[0].onEnd();
  equal(backend.calls.length, 1);

  player.speak("く", false);
  equal(backend.calls.length, 2);
  backend.calls[0].onError();
  equal(backend.calls.length, 2);
});

test("unsupported speech backend is a safe no-op", () => {
  const player = makeKanaSpeechPlayer(
    new Settings().set(soundProps.speakKana, SpeakKana.All),
    null,
  );

  player.speak("かな", false);
  player.cancel();
});

function makePlayer(backend: KanaSpeechBackend) {
  return makeKanaSpeechPlayer(
    new Settings().set(soundProps.speakKana, SpeakKana.All),
    backend,
  );
}

type Call = {
  readonly text: string;
  readonly options: KanaSpeechOptions;
  readonly onEnd: () => void;
  readonly onError: () => void;
};

class FakeBackend implements KanaSpeechBackend {
  readonly calls: Call[] = [];
  cancelCount = 0;

  speak(
    text: string,
    options: KanaSpeechOptions,
    onEnd: () => void,
    onError: () => void,
  ): void {
    this.calls.push({ text, options, onEnd, onError });
  }

  cancel(): void {
    this.cancelCount += 1;
  }
}
