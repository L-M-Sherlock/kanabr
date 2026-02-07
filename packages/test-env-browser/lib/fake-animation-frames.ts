import { type DOMWindow } from "jsdom";

export function polyfillAnimationFrames(window: DOMWindow): void {
  const callbacks = new Map<number, FrameRequestCallback>();
  let id = 1;
  window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    const callbackId = id++;
    callbacks.set(callbackId, callback);
    return callbackId;
  };
  window.cancelAnimationFrame = (callbackId: number): void => {
    callbacks.delete(callbackId);
  };
  window.flushAnimationFrames = async (): Promise<void> => {
    // Run queued frames synchronously. This avoids runaway animation loops
    // keeping the event loop alive in tests.
    let rounds = 0;
    while (callbacks.size > 0) {
      if (rounds++ > 1000) {
        throw new Error(`flushAnimationFrames exceeded 1000 rounds`);
      }
      const pending = [...callbacks.values()];
      callbacks.clear();
      for (const callback of pending) {
        callback(performance.now());
      }
      // Allow effects/microtasks triggered by callbacks to settle.
      await Promise.resolve();
    }
  };
}
