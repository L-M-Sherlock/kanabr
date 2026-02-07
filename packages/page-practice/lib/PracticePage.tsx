import { KeyboardOptions, Layout } from "@keybr/keyboard";
import { lessonProps } from "@keybr/lesson";
import { Settings } from "@keybr/settings";
import { ViewSwitch } from "@keybr/widget";
import { views } from "./views.tsx";

setDefaultLayout(window.navigator.language);

function setDefaultLayout(localeId: string) {
  const layout = Layout.findLayout(localeId);
  const options =
    layout != null
      ? KeyboardOptions.default()
          .withLanguage(layout.language)
          .withLayout(layout)
      : KeyboardOptions.default();
  let defaults = options.save(new Settings());
  if (options.language.id === "ja") {
    defaults = defaults.set(lessonProps.targetSpeed, /* 25WPM */ 125);
  }
  Settings.addDefaults(defaults);
}

export function PracticePage() {
  return <ViewSwitch views={views} />;
}
