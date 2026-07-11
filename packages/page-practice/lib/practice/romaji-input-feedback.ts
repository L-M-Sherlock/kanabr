import { Feedback } from "@keybr/textinput";
import {
  type IInputEvent,
  type RomajiImeResult,
} from "@keybr/textinput-events";

export function romajiInputFeedback(
  event: IInputEvent,
  result: RomajiImeResult,
): Feedback | null {
  if (
    result.rejected &&
    event.inputType === "appendChar" &&
    event.codePoint !== 0x0020
  ) {
    return Feedback.Failed;
  }
  return null;
}
