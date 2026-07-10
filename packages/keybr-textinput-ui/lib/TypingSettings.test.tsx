import { test } from "node:test";
import { FakeIntlProvider } from "@keybr/intl";
import { KeyboardOptions, KeyboardProvider, Language } from "@keybr/keyboard";
import { FakeSettingsContext, Settings } from "@keybr/settings";
import { soundProps, SpeakKana } from "@keybr/textinput-sounds";
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
    const r = renderSettings();

    isNotNull(r.queryByText("Pronounce kana:"));
    isNotNull(r.queryByText("All typed kana"));
    isNotNull(r.queryByText("Incorrect kana only"));

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

  isNull(r.queryByText("Pronounce kana:"));
  isNull(r.queryByText("All typed kana"));
  isNull(r.queryByText("Incorrect kana only"));

  r.unmount();
});

test("select a kana pronunciation mode", () => {
  const restore = mockKanaSpeechSupport(true);
  try {
    const r = renderSettings(
      new Settings().set(soundProps.speakKana, SpeakKana.ErrorsOnly),
    );
    const off = r.getByRole("radio", { name: "Off" }) as HTMLInputElement;
    const all = r.getByRole("radio", {
      name: "All typed kana",
    }) as HTMLInputElement;
    const errorsOnly = r.getByRole("radio", {
      name: "Incorrect kana only",
    }) as HTMLInputElement;

    isFalse(off.checked);
    isFalse(all.checked);
    isTrue(errorsOnly.checked);

    fireEvent.click(all);
    isFalse(off.checked);
    isTrue(all.checked);
    isFalse(errorsOnly.checked);

    fireEvent.click(off);
    isTrue(off.checked);
    isFalse(all.checked);
    isFalse(errorsOnly.checked);

    r.unmount();
  } finally {
    restore();
  }
});

test("fall back to off when kana pronunciation is unsupported", () => {
  const restore = mockKanaSpeechSupport(false);
  try {
    const r = renderSettings(
      new Settings().set(soundProps.speakKana, SpeakKana.All),
    );
    const off = r.getByRole("radio", { name: "Off" }) as HTMLInputElement;
    const all = r.getByRole("radio", {
      name: "All typed kana",
    }) as HTMLInputElement;
    const errorsOnly = r.getByRole("radio", {
      name: "Incorrect kana only",
    }) as HTMLInputElement;

    isTrue(off.checked);
    isFalse(off.disabled);
    isFalse(all.checked);
    isTrue(all.disabled);
    isFalse(errorsOnly.checked);
    isTrue(errorsOnly.disabled);
    isNotNull(
      r.queryByText("Kana pronunciation is not supported by your browser."),
    );

    r.unmount();
  } finally {
    restore();
  }
});
