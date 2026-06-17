# Translations

kanabr uses `react-intl` message extraction.

Human-edited translation sources live in:

```text
packages/keybr-intl/translations/*.json
```

Generated catalogs live in:

```text
packages/keybr-intl/lib/messages/*.json
docs/translations_report.md
```

Do not hand-edit generated catalogs. After adding or changing a
`defaultMessage`, run:

```shell
npm run translate
```

The script extracts messages from source files, updates
`packages/keybr-intl/translations/en.json`, merges existing translations, writes
compiled runtime catalogs, and refreshes the translation report.

For kana-specific UI, prioritize Japanese translations in
`packages/keybr-intl/translations/ja.json` so the core static/kana/romaji
experience does not fall back to English.

When changing user-facing terminology, keep these terms consistent:

* `kanabr` for the app.
* `kana`, `hiragana`, and `katakana` for Japanese practice units.
* `romaji input` for the Latin-letter input method.
* `practice item` for generated lesson units.
* `physical key` only when referring to keyboard hardware.
* `static mode` and `local data` for the default browser-only build.
* `server mode` for accounts, public profiles, high scores, multiplayer, sync,
  ads, or checkout.

The number of translated and untranslated messages and words can be seen in the
[Translations Report](./translations_report.md).
