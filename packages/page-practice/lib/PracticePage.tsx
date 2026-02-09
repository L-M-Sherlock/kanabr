import { KeyboardOptions, Layout } from "@keybr/keyboard";
import { lessonProps } from "@keybr/lesson";
import { Settings } from "@keybr/settings";
import { ViewSwitch } from "@keybr/widget";
import { views } from "./views.tsx";

setDefaultLayout(window.navigator.language);

function setDefaultLayout(localeId: string) {
  // kanabr defaults to Japanese kana practice (romaji input), regardless of
  // the visitor's browser locale. Users can still change this in settings.
  let options = KeyboardOptions.default();

  // Retain the upstream "match browser locale" behavior only when explicitly
  // enabled (useful for development/comparison).
  if (process.env.KEYBR_DEFAULT_LAYOUT_FROM_LOCALE === "1") {
    const layout = Layout.findLayout(localeId);
    if (layout != null) {
      options = KeyboardOptions.default()
        .withLanguage(layout.language)
        .withLayout(layout);
    }
  }

  let defaults = options.save(new Settings());
  if (options.language.id === "ja") {
    defaults = defaults.set(lessonProps.targetSpeed, /* 25WPM */ 125);
  }
  Settings.addDefaults(defaults);
}

export function PracticePage() {
  return <ViewSwitch views={views} />;
}
