import { test } from "node:test";
import { Feedback } from "@keybr/textinput";
import {
  type IInputEvent,
  type RomajiImeResult,
} from "@keybr/textinput-events";
import { equal } from "rich-assert";
import { romajiInputFeedback } from "./romaji-input-feedback.ts";

const appendChar = (codePoint: number): IInputEvent => ({
  type: "input",
  timeStamp: 100,
  inputType: "appendChar",
  codePoint,
  timeToType: 100,
});

const clearChar: IInputEvent = {
  type: "input",
  timeStamp: 100,
  inputType: "clearChar",
  codePoint: 0x0000,
  timeToType: 100,
};

const result = (rejected: boolean): RomajiImeResult => ({
  events: [],
  preedit: "",
  valid: true,
  rejected,
});

test("reports failed feedback for a rejected character", () => {
  equal(
    romajiInputFeedback(appendChar(/* "1" */ 0x0031), result(true)),
    Feedback.Failed,
  );
});

test("ignores accepted characters", () => {
  equal(romajiInputFeedback(appendChar(/* "1" */ 0x0031), result(false)), null);
});

test("ignores a rejected space", () => {
  equal(romajiInputFeedback(appendChar(0x0020), result(true)), null);
});

test("ignores rejected non-character input", () => {
  equal(romajiInputFeedback(clearChar, result(true)), null);
});
