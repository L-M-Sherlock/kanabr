import { test } from "node:test";
import { Settings } from "@keybr/settings";
import { deepEqual, equal } from "rich-assert";
import {
  type KanaSpeechBackend,
  type KanaSpeechOptions,
  makeKanaSpeechPlayer,
} from "./kana-speech.ts";
import { PlaySounds, soundProps } from "./settings.ts";

test("incorrect kana speech is disabled by default", () => {
  const backend = new FakeBackend();
  const player = makeKanaSpeechPlayer(new Settings(), backend);

  equal(player, null);
});

test("creates a player for modes that play error sounds", () => {
  const backend = new FakeBackend();

  for (const playSounds of [PlaySounds.ErrorsOnly, PlaySounds.All]) {
    const player = makeKanaSpeechPlayer(
      enabledSettings().set(soundProps.playSounds, playSounds),
      backend,
    );

    equal(player != null, true);
  }
});

test("does not create a player for modes without error sounds", () => {
  const backend = new FakeBackend();

  for (const playSounds of [PlaySounds.None, PlaySounds.KeysOnly]) {
    const player = makeKanaSpeechPlayer(
      enabledSettings().set(soundProps.playSounds, playSounds),
      backend,
    );

    equal(player, null);
  }
});

test("speaks incorrect kana with Japanese speech options", () => {
  const backend = new FakeBackend();
  const player = makePlayer(
    backend,
    enabledSettings().set(soundProps.soundVolume, 0.25),
  );

  player.speak("きゃ", true);

  equal(backend.calls.length, 1);
  equal(backend.calls[0].text, "きゃ");
  deepEqual(backend.calls[0].options, {
    lang: "ja-JP",
    volume: 0.25,
    rate: 1,
    pitch: 1,
  });
});

test("ignores correct kana", () => {
  const backend = new FakeBackend();
  const player = makePlayer(backend);

  player.speak("か", false);
  player.speak("き", true);

  equal(backend.calls.length, 1);
  equal(backend.calls[0].text, "き");
});

test("keeps only the latest kana while speech is active", () => {
  const backend = new FakeBackend();
  const player = makePlayer(backend);

  player.speak("か", true);
  player.speak("き", true);
  player.speak("く", true);

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

  player.speak("か", true);
  player.speak("き", true);
  backend.calls[0].onError();

  deepEqual(
    backend.calls.map(({ text }) => text),
    ["か", "き"],
  );
});

test("cancel clears pending kana and ignores stale callbacks", () => {
  const backend = new FakeBackend();
  const player = makePlayer(backend);

  player.speak("か", true);
  player.speak("き", true);
  player.cancel();

  equal(backend.cancelCount, 1);
  backend.calls[0].onEnd();
  equal(backend.calls.length, 1);

  player.speak("く", true);
  equal(backend.calls.length, 2);
  backend.calls[0].onError();
  equal(backend.calls.length, 2);
});

test("unsupported speech backend does not create a player", () => {
  const player = makeKanaSpeechPlayer(enabledSettings(), null);

  equal(player, null);
});

function enabledSettings() {
  return new Settings()
    .set(soundProps.speakIncorrectKana, true)
    .set(soundProps.playSounds, PlaySounds.ErrorsOnly);
}

function makePlayer(backend: KanaSpeechBackend, settings = enabledSettings()) {
  const player = makeKanaSpeechPlayer(settings, backend);
  if (player == null) {
    throw new Error("Expected kana speech player");
  }
  return player;
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
