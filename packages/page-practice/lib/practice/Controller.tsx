import { type KeyId, useKeyboard } from "@keybr/keyboard";
import { type Result } from "@keybr/result";
import { type LineList, type TextInput } from "@keybr/textinput";
import {
  addKey,
  deleteKey,
  emulateLayout,
  type IInputEvent,
  RomajiIme,
  romajiOptionsForKana,
} from "@keybr/textinput-events";
import { makeKanaSpeechPlayer, makeSoundPlayer } from "@keybr/textinput-sounds";
import { type CodePoint } from "@keybr/unicode";
import {
  useDocumentEvent,
  useHotkeys,
  useTimeout,
  useWindowEvent,
} from "@keybr/widget";
import {
  memo,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  isKanaInputIncorrect,
  type KanaSpeechPart,
  KanaSpeechSession,
  shouldPlayKanaInputSound,
} from "./kana-speech-session.ts";
import { Presenter } from "./Presenter.tsx";
import {
  type LastLesson,
  LessonState,
  makeLastLesson,
  type Progress,
} from "./state/index.ts";

export const Controller = memo(function Controller({
  progress,
  onResult,
}: {
  readonly progress: Progress;
  readonly onResult: (result: Result) => void;
}): ReactNode {
  const {
    state,
    handleResetLesson,
    handleSkipLesson,
    handleKeyDown,
    handleKeyUp,
    handleInput,
  } = useLessonState(progress, onResult);
  useHotkeys({
    ["Ctrl+ArrowLeft"]: handleResetLesson,
    ["Ctrl+ArrowRight"]: handleSkipLesson,
    ["Escape"]: handleResetLesson,
  });
  useWindowEvent("focus", handleResetLesson);
  useWindowEvent("blur", handleResetLesson);
  useDocumentEvent("visibilitychange", handleResetLesson);
  return (
    <Presenter
      state={state}
      lines={state.lines}
      depressedKeys={state.depressedKeys}
      onResetLesson={handleResetLesson}
      onSkipLesson={handleSkipLesson}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onInput={handleInput}
    />
  );
});

function useLessonState(
  progress: Progress,
  onResult: (result: Result) => void,
) {
  const keyboard = useKeyboard();
  const timeout = useTimeout();
  const [key, setKey] = useState(0); // Creates new LessonState instances.
  const [, setLines] = useState<LineList>({ text: "", lines: [] }); // Forces UI update.
  const [, setDepressedKeys] = useState<readonly KeyId[]>([]); // Forces UI update.
  const lastLessonRef = useRef<LastLesson | null>(null);

  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const kanaSpeechPlayer = useMemo(
    () =>
      keyboard.layout.id === "ja-romaji"
        ? makeKanaSpeechPlayer(progress.settings)
        : null,
    [keyboard.layout.id, progress.settings],
  );
  useEffect(
    () => () => {
      kanaSpeechPlayer?.cancel();
    },
    [kanaSpeechPlayer],
  );

  const controller = useMemo(() => {
    // New lesson.
    const state = new LessonState(progress, (result, textInput) => {
      // Clear earlier speech before the final resolved sequence is submitted
      // below. Preserve the session so a pending small tsu can join it.
      kanaSpeechPlayer?.cancel();
      setKey(key + 1);
      lastLessonRef.current = makeLastLesson(result, textInput.steps);
      onResultRef.current(result);
    });
    state.lastLesson = lastLessonRef.current;
    state.imeEnabled = keyboard.layout.id === "ja-romaji";
    const ime = state.imeEnabled ? new RomajiIme() : null;
    const updateImeHints = () => {
      if (!state.imeEnabled) {
        state.imeHints = [];
        return;
      }
      const kana = expectedKana(state.textInput);
      state.imeHints = kana ? romajiOptionsForKana(kana) : [];
    };
    updateImeHints();
    setLines(state.lines);
    setDepressedKeys(state.depressedKeys);
    const playSounds = makeSoundPlayer(state.settings);
    const kanaSpeechSession = new KanaSpeechSession({
      speak: (text, incorrect) => {
        kanaSpeechPlayer?.speak(text, incorrect);
      },
    });
    const resetKanaSpeech = () => {
      kanaSpeechSession.reset();
      kanaSpeechPlayer?.cancel();
    };
    const handleResetLesson = () => {
      resetKanaSpeech();
      state.resetLesson();
      ime?.reset();
      state.imePreedit = "";
      state.imeValid = true;
      updateImeHints();
      setLines(state.lines);
      setDepressedKeys((state.depressedKeys = []));
      timeout.cancel();
    };
    const handleSkipLesson = () => {
      resetKanaSpeech();
      state.skipLesson();
      ime?.reset();
      state.imePreedit = "";
      state.imeValid = true;
      updateImeHints();
      setLines(state.lines);
      setDepressedKeys((state.depressedKeys = []));
      timeout.cancel();
    };
    const { onKeyDown, onKeyUp, onInput } = emulateLayout(
      state.settings,
      keyboard,
      {
        onKeyDown: (event) => {
          setDepressedKeys(
            (state.depressedKeys = addKey(state.depressedKeys, event.code)),
          );
        },
        onKeyUp: (event) => {
          setDepressedKeys(
            (state.depressedKeys = deleteKey(state.depressedKeys, event.code)),
          );
        },
        onInput: (event) => {
          state.lastLesson = null;
          if (ime != null) {
            if (event.inputType === "appendLineBreak") {
              kanaSpeechSession.reset();
              // Treat Enter as a UI action: it only advances when the current
              // romaji preedit is empty. This avoids cases like `n + Enter`
              // committing ん, which is inconsistent with typical IME usage.
              if (ime.preedit === "") {
                const feedback = state.onInput(event);
                playSounds(feedback);
                updateImeHints();
                setLines(state.lines);
                timeout.schedule(handleResetLesson, 10000);
              }
              return;
            }
            const wordStartStroke =
              event.inputType === "appendChar" &&
              event.codePoint !== 0x0020 &&
              ime.preedit === "" &&
              state.textInput.isAtWordStart();
            const res = ime.consume(event, { wordStartStroke });
            state.imePreedit = res.preedit;
            state.imeValid = res.valid;
            const speechParts: KanaSpeechPart[] = [];
            const flushKanaSpeech = () => {
              kanaSpeechSession.accept(speechParts);
              speechParts.length = 0;
            };
            for (const ev of res.events) {
              if (ev.inputType === "appendChar" && ev.codePoint === 0x0020) {
                flushKanaSpeech();
                kanaSpeechSession.reset();
                if (state.textInput.isAtWordStart()) {
                  state.onInput(ev);
                }
                continue;
              }
              const mapped = mapKanaEventToExpected(ev, state.textInput);
              let incorrectKana = false;
              if (
                mapped.inputType === "appendChar" &&
                mapped.timeToTypeSequenceId != null
              ) {
                incorrectKana = isIncorrectInput(mapped, state.textInput);
                speechParts.push({
                  sequenceId: mapped.timeToTypeSequenceId,
                  text: String.fromCodePoint(mapped.codePoint),
                  incorrect: incorrectKana,
                });
              } else if (
                mapped.inputType !== "appendChar" ||
                mapped.codePoint !== 0x30fc
              ) {
                flushKanaSpeech();
                kanaSpeechSession.reset();
              }
              const feedback = state.onInput(mapped);
              if (
                shouldPlayKanaInputSound(
                  feedback,
                  incorrectKana,
                  kanaSpeechPlayer != null,
                )
              ) {
                playSounds(feedback);
              }
            }
            flushKanaSpeech();
            updateImeHints();
            // Force UI update even if no events were emitted (preedit changed).
            setLines(state.lines);
            timeout.schedule(handleResetLesson, 10000);
          } else {
            const feedback = state.onInput(event);
            setLines(state.lines);
            playSounds(feedback);
            timeout.schedule(handleResetLesson, 10000);
          }
        },
      },
    );
    return {
      state,
      handleResetLesson,
      handleSkipLesson,
      handleKeyDown: onKeyDown,
      handleKeyUp: onKeyUp,
      handleInput: onInput,
      resetKanaSpeechSession: () => {
        kanaSpeechSession.reset();
      },
    };
  }, [progress, keyboard, timeout, key, kanaSpeechPlayer]);

  useEffect(
    () => () => {
      controller.resetKanaSpeechSession();
    },
    [controller],
  );

  return controller;
}

function mapKanaEventToExpected(
  event: IInputEvent,
  textInput: TextInput,
): IInputEvent {
  if (event.inputType !== "appendChar") {
    return event;
  }
  if (textInput.completed) {
    return event;
  }
  const expected = textInput.at(textInput.pos).codePoint as CodePoint;
  const codePoint = mapKanaCodePointToExpected(
    event.codePoint as CodePoint,
    expected,
  );
  return codePoint === event.codePoint ? event : { ...event, codePoint };
}

function mapKanaCodePointToExpected(
  actual: CodePoint,
  expected: CodePoint,
): CodePoint {
  // Katakana-Hiragana prolonged sound mark: keep as-is.
  if (actual === 0x30fc) {
    return actual;
  }
  if (isKatakanaCodePoint(expected) && isHiraganaCodePoint(actual)) {
    return (actual + 0x0060) as CodePoint;
  }
  return actual;
}

function isIncorrectInput(event: IInputEvent, textInput: TextInput): boolean {
  if (event.inputType !== "appendChar" || textInput.completed) {
    return false;
  }
  const expected = textInput.at(textInput.pos).codePoint as CodePoint;
  return isKanaInputIncorrect(event.codePoint as CodePoint, expected);
}

function expectedKana(textInput: TextInput): string {
  if (textInput.completed) {
    return "";
  }
  const a = textInput.at(textInput.pos).codePoint as CodePoint;
  const aH = katakanaToHiragana(a);
  const b =
    textInput.pos + 1 < textInput.length
      ? (textInput.at(textInput.pos + 1).codePoint as CodePoint)
      : null;
  const bH = b != null ? katakanaToHiragana(b) : null;
  if (
    isHiraganaCodePoint(aH) &&
    (isSmallYCodePoint(bH) || isSmallVowelCodePoint(bH))
  ) {
    return String.fromCodePoint(aH, bH!);
  }
  if (isHiraganaCodePoint(aH) || aH === 0x30fc) {
    return String.fromCodePoint(aH);
  }
  return "";
}

function katakanaToHiragana(codePoint: CodePoint): CodePoint {
  if (codePoint === 0x30fc) {
    return codePoint;
  }
  if (codePoint >= 0x30a1 && codePoint <= 0x30f6) {
    return (codePoint - 0x0060) as CodePoint;
  }
  return codePoint;
}

function isHiraganaCodePoint(codePoint: CodePoint): boolean {
  return codePoint >= 0x3041 && codePoint <= 0x3096;
}

function isKatakanaCodePoint(codePoint: CodePoint): boolean {
  return codePoint >= 0x30a1 && codePoint <= 0x30f6;
}

function isSmallYCodePoint(codePoint: CodePoint | null): boolean {
  if (codePoint == null) {
    return false;
  }
  return codePoint === 0x3083 || codePoint === 0x3085 || codePoint === 0x3087; // ゃゅょ
}

function isSmallVowelCodePoint(codePoint: CodePoint | null): boolean {
  if (codePoint == null) {
    return false;
  }
  return (
    codePoint === 0x3041 || // ぁ
    codePoint === 0x3043 || // ぃ
    codePoint === 0x3045 || // ぅ
    codePoint === 0x3047 || // ぇ
    codePoint === 0x3049 // ぉ
  );
}
