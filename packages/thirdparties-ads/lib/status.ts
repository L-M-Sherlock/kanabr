import { placeholder } from "@keybr/thirdparties";

export function showAdBlockerStatus(enabled: boolean): void {
  const placeholders = findElements(`.${placeholder}`);
  if (enabled) {
    for (const elem of placeholders) {
      elem.hidden = true;
      elem.innerHTML = "";
    }
  } else {
    for (const elem of placeholders) {
      elem.hidden = false;
      elem.innerHTML =
        "This server-backed installation includes ads. " +
        "Please disable your ad blocker or use a configured premium account if one is available.";
    }
  }
}

function findElements(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(selector));
}
