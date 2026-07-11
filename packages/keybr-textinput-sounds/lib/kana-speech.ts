import { type Settings } from "@keybr/settings";
import { PlaySounds, soundProps } from "./settings.ts";

export type KanaSpeechPlayer = {
  speak(text: string, incorrect: boolean): void;
  cancel(): void;
};

export type KanaSpeechOptions = {
  readonly lang: "ja-JP";
  readonly volume: number;
  readonly rate: 1;
  readonly pitch: 1;
};

export type KanaSpeechBackend = {
  speak(
    text: string,
    options: KanaSpeechOptions,
    onEnd: () => void,
    onError: () => void,
  ): void;
  cancel(): void;
};

export function isKanaSpeechSupported(): boolean {
  try {
    return (
      typeof globalThis.speechSynthesis?.speak === "function" &&
      typeof globalThis.speechSynthesis.cancel === "function" &&
      typeof globalThis.SpeechSynthesisUtterance === "function"
    );
  } catch {
    return false;
  }
}

export function makeKanaSpeechPlayer(
  settings: Settings,
  backend: KanaSpeechBackend | null = makeBrowserBackend(),
): KanaSpeechPlayer | null {
  const playSounds = settings.get(soundProps.playSounds);
  if (
    !settings.get(soundProps.speakIncorrectKana) ||
    (playSounds !== PlaySounds.ErrorsOnly && playSounds !== PlaySounds.All) ||
    backend == null
  ) {
    return null;
  }
  return new QueuedKanaSpeechPlayer(
    backend,
    settings.get(soundProps.soundVolume),
  );
}

class QueuedKanaSpeechPlayer implements KanaSpeechPlayer {
  readonly #options: KanaSpeechOptions;
  #active: object | null = null;
  #pending: string | null = null;

  constructor(
    readonly backend: KanaSpeechBackend,
    volume: number,
  ) {
    this.#options = { lang: "ja-JP", volume, rate: 1, pitch: 1 };
  }

  speak(text: string, incorrect: boolean): void {
    if (text.length === 0 || !incorrect) {
      return;
    }
    if (this.#active != null) {
      this.#pending = text;
    } else {
      this.#start(text);
    }
  }

  cancel(): void {
    this.#active = null;
    this.#pending = null;
    try {
      this.backend.cancel();
    } catch {
      // Speech synthesis failures must not interrupt typing.
    }
  }

  #start(text: string): void {
    const token = {};
    this.#active = token;
    const finish = () => {
      this.#finish(token);
    };
    try {
      this.backend.speak(text, this.#options, finish, finish);
    } catch {
      this.#finish(token);
    }
  }

  #finish(token: object): void {
    if (this.#active !== token) {
      return;
    }
    this.#active = null;
    const pending = this.#pending;
    this.#pending = null;
    if (pending != null) {
      this.#start(pending);
    }
  }
}

function makeBrowserBackend(): KanaSpeechBackend | null {
  if (!isKanaSpeechSupported()) {
    return null;
  }
  const synthesis = globalThis.speechSynthesis;
  const Utterance = globalThis.SpeechSynthesisUtterance;
  return {
    speak(text, options, onEnd, onError) {
      const utterance = new Utterance(text);
      utterance.lang = options.lang;
      utterance.volume = options.volume;
      utterance.rate = options.rate;
      utterance.pitch = options.pitch;
      utterance.onend = onEnd;
      utterance.onerror = onError;
      synthesis.speak(utterance);
    },
    cancel() {
      synthesis.cancel();
    },
  };
}
