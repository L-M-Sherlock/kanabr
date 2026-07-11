import { test } from "node:test";
import { FakeIntlProvider } from "@keybr/intl";
import { KeyboardOptions, KeyboardProvider, Language } from "@keybr/keyboard";
import { FakeSettingsContext, Settings } from "@keybr/settings";
import { PlaySounds, soundProps } from "@keybr/textinput-sounds";
import { fireEvent, render } from "@testing-library/react";
import { isFalse, isNotNull, isNull, isTrue } from "rich-assert";
import { TypingSettings } from "./TypingSettings.tsx";

function renderSettings(initialSettings = new Settings()) {
  return render(
    <FakeIntlProvider>
      <FakeSettingsContext initialSettings={initialSettings}>
        <KeyboardProvider>
          <TypingSettings />
        </KeyboardProvider>
      </FakeSettingsContext>
    </FakeIntlProvider>,
  );
}

function mockKanaSpeechSupport(supported: boolean): () => void {
  const speechSynthesis = Object.getOwnPropertyDescriptor(
    globalThis,
    "speechSynthesis",
  );
  const speechSynthesisUtterance = Object.getOwnPropertyDescriptor(
    globalThis,
    "SpeechSynthesisUtterance",
  );
  Object.defineProperty(globalThis, "speechSynthesis", {
    configurable: true,
    value: supported
      ? {
          speak() {},
          cancel() {},
        }
      : undefined,
  });
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
    configurable: true,
    value: supported ? class {} : undefined,
  });
  return () => {
    restoreProperty("speechSynthesis", speechSynthesis);
    restoreProperty("SpeechSynthesisUtterance", speechSynthesisUtterance);
  };
}

function restoreProperty(
  name: string,
  descriptor: PropertyDescriptor | undefined,
): void {
  if (descriptor != null) {
    Object.defineProperty(globalThis, name, descriptor);
  } else {
    Reflect.deleteProperty(globalThis, name);
  }
}

test("render", () => {
  const r = renderSettings();

  fireEvent.click(r.getByText("Stop cursor on error"));
  fireEvent.click(r.getByText("Forgive errors"));

  fireEvent.click(r.getByText("No whitespace"));
  fireEvent.click(r.getByText("Bar whitespace"));
  fireEvent.click(r.getByText("Bullet whitespace"));

  fireEvent.click(r.getByText("Block cursor"));
  fireEvent.click(r.getByText("Box cursor"));
  fireEvent.click(r.getByText("Line cursor"));
  fireEvent.click(r.getByText("Underline cursor"));

  fireEvent.click(r.getByText("Jumping cursor"));
  fireEvent.click(r.getByText("Smooth cursor"));

  r.unmount();
});

test("show kana pronunciation settings for the romaji layout", () => {
  const restore = mockKanaSpeechSupport(true);
  try {
    const r = renderSettings(
      new Settings().set(soundProps.playSounds, PlaySounds.ErrorsOnly),
    );

    isNotNull(
      r.queryByText(
        "Pronounce incorrect kana instead of playing an error sound",
      ),
    );

    r.unmount();
  } finally {
    restore();
  }
});

test("hide kana pronunciation settings for other layouts", () => {
  const settings = KeyboardOptions.default()
    .withLanguage(Language.EN)
    .save(new Settings());
  const r = renderSettings(settings);

  isNull(
    r.queryByText("Pronounce incorrect kana instead of playing an error sound"),
  );

  r.unmount();
});

test("toggle incorrect kana pronunciation", () => {
  const restore = mockKanaSpeechSupport(true);
  try {
    const r = renderSettings(
      new Settings().set(soundProps.playSounds, PlaySounds.ErrorsOnly),
    );
    const speakIncorrectKana = r.getByRole("checkbox", {
      name: "Pronounce incorrect kana instead of playing an error sound",
    }) as HTMLInputElement;

    isFalse(speakIncorrectKana.checked);
    isFalse(speakIncorrectKana.disabled);

    fireEvent.click(speakIncorrectKana);
    isTrue(speakIncorrectKana.checked);

    fireEvent.click(speakIncorrectKana);
    isFalse(speakIncorrectKana.checked);

    r.unmount();
  } finally {
    restore();
  }
});

test("preserve the setting when kana pronunciation is unsupported", () => {
  const restore = mockKanaSpeechSupport(false);
  try {
    const r = renderSettings(
      new Settings()
        .set(soundProps.playSounds, PlaySounds.All)
        .set(soundProps.speakIncorrectKana, true),
    );
    const speakIncorrectKana = r.getByRole("checkbox", {
      name: "Pronounce incorrect kana instead of playing an error sound",
    }) as HTMLInputElement;

    isTrue(speakIncorrectKana.checked);
    isTrue(speakIncorrectKana.disabled);
    isNotNull(
      r.queryByText("Kana pronunciation is not supported by your browser."),
    );

    r.unmount();
  } finally {
    restore();
  }
});

for (const playSounds of [PlaySounds.None, PlaySounds.KeysOnly]) {
  test(`disable kana pronunciation for sound mode ${playSounds}`, () => {
    const restore = mockKanaSpeechSupport(true);
    try {
      const r = renderSettings(
        new Settings()
          .set(soundProps.playSounds, playSounds)
          .set(soundProps.speakIncorrectKana, true),
      );
      const speakIncorrectKana = r.getByRole("checkbox", {
        name: "Pronounce incorrect kana instead of playing an error sound",
      }) as HTMLInputElement;

      isTrue(speakIncorrectKana.checked);
      isTrue(speakIncorrectKana.disabled);
      isNotNull(
        r.queryByText("Enable error sounds to use kana pronunciation."),
      );

      r.unmount();
    } finally {
      restore();
    }
  });
}

for (const playSounds of [PlaySounds.ErrorsOnly, PlaySounds.All]) {
  test(`enable kana pronunciation for sound mode ${playSounds}`, () => {
    const restore = mockKanaSpeechSupport(true);
    try {
      const r = renderSettings(
        new Settings().set(soundProps.playSounds, playSounds),
      );
      const speakIncorrectKana = r.getByRole("checkbox", {
        name: "Pronounce incorrect kana instead of playing an error sound",
      }) as HTMLInputElement;

      isFalse(speakIncorrectKana.disabled);
      isNull(r.queryByText("Enable error sounds to use kana pronunciation."));

      r.unmount();
    } finally {
      restore();
    }
  });
}
