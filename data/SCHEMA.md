# Library data contract

`cases.json` is an object with `repository` (current repository URL), `upstreamRepository` (original repository URL), `totalCases` (number), `categories`, `styles`, `scenes` (string arrays), and `cases` (array).

Each case retains the upstream fields without rewriting:

- `id`: unique numeric source ID; IDs are not necessarily contiguous.
- `title`, `imageAlt`: strings.
- `image`: root-relative local URL, `/images/...`, served from `public/images/...`.
- `sourceLabel`, `sourceUrl`: original creator/source attribution strings.
- `prompt`: complete original prompt string, including line breaks.
- `promptPreview`: upstream abbreviated preview; never a substitute for `prompt`.
- `category`: one of the category strings.
- `styles`, `scenes`: string arrays.
- `featured`: boolean.
- `githubUrl`: upstream case document URL retained for attribution.

`style-library.json` preserves the upstream structure: `version`, `tagLabels`, `categories`, `styles`, `scenes`, and `templates`, plus current `repository` and `upstreamRepository`. `templateDocument` links to the original upstream template document. Category covers and template covers use `/images/...`. Localized values contain `en` and `zh`. Templates preserve their `id`, `anchor`, `title`, `description`, `category`, `styles`, `scenes`, `tags`, `useWhen`, `guidance`, `pitfalls`, and numeric `exampleCases`.

The installable skill bundles copies of both JSON files under `agents/skills/aisaasgo-image-prompts/references/`. Its index is generated from the case titles and tags. The skill can work without access to the repository root; image binaries are not duplicated inside the skill.

`migration-report.json` records verified snapshot counts and integrity outcomes. `scripts/migrate-library.mjs` migrates only data, the 554 local images referenced by cases/style-library, the preserved LICENSE and generated skill references. It treats `public/images/` as the library-owned image directory and prunes any unreferenced files, excluding upstream marketing, QR and sponsor assets. Validation asserts that its file inventory exactly matches the referenced image set. Pass an absolute upstream directory; use `--validate` to perform a read-only comparison. Validation checks full case equality, unique IDs, all referenced images, SHA-256 equality for every migrated source asset, template example IDs, both skill data copies, and the unchanged upstream license.
