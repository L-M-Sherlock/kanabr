# Repository Guidelines

## Project Structure

- `packages/*`: Monorepo workspaces (TypeScript/React). Each package typically has `lib/` source and `lib/**/*.test.{ts,tsx}` tests.
- `scripts/`: Repo tooling (notably `scripts/translate.js` for i18n).
- `root/`: Built output and server entrypoint used by `npm start`. Do not hand-edit generated files under `root/`.
- Assets and catalogs:
  - `packages/*/assets/` and `root/public/assets/` for static assets.
  - `packages/keybr-intl/translations/*.json` are human-edited translation sources.
  - `packages/keybr-intl/lib/messages/*.json` and `docs/translations_report.md` are generated.

## Build, Test, and Development Commands

- `npm install`: Install workspace dependencies.
- `npm run build-dev`: Build browser/server bundles (`NODE_ENV=development`).
- `npm start`: Start the local server (serves `http://localhost:3000`).
- `npm run watch`: Rebuild bundles on change.
- `npm run compile`: Typecheck all workspaces via `lage`.
- `npm run test`: Run all workspace tests via `lage`.
- `npm run lint` / `npm run lint-fix`: ESLint (use `--fix` to auto-sort imports).
- `npm run stylelint` / `npm run stylelint-fix`: Lint CSS/Less.
- `npm run translate`: Regenerate i18n catalogs (run this after adding/changing message ids to avoid showing raw ids in UI).

Tip: run scoped tasks with npm workspaces, e.g. `npm -w @keybr/page-profile test`.

## Coding Style & Naming

- Indentation: 2 spaces; line length target: 80 (`.editorconfig`).
- Formatting: Prettier (see `.prettierrc.js`); CSS/Less via Stylelint.
- Imports: enforced by `eslint-plugin-simple-import-sort` (keep groups and specifier order stable).
- Tests: name files `*.test.ts` / `*.test.tsx`.

## Commit & Pull Request Guidelines

- Commits follow Conventional Commits with optional scope, e.g. `feat(ja): ...`, `fix(profile): ...`.
- PRs should include: a short problem statement, testing notes (commands run), and screenshots for UI changes.
- If you touch i18n strings, include the regenerated catalogs from `npm run translate`.

