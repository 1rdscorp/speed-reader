# Speed Reader

A website for reading faster. Text is shown one word at a time at a fixed point
on the screen, with one letter of each word highlighted as the place to rest
your eyes, so reading speed is set by a dial instead of by eye movement.

It is being built in stages. **Stage 1 — the core reader — is done**; the plan
for the rest is [below](#stages).

## Running it

Requires Node 22 or newer.

```bash
npm install
```

```bash
npm run dev
```

| Command           | What it does                                            |
| ----------------- | ------------------------------------------------------- |
| `npm run dev`     | Development server with hot reload                      |
| `npm run build`   | Type-check and build the static site into `dist/`       |
| `npm run preview` | Serve the built site locally                            |
| `npm test`        | Run the tests once (`npm run test:watch` to keep going) |
| `npm run lint`    | Lint, including the layer rules described below         |
| `npm run format`  | Format everything with Prettier                         |
| `npm run check`   | Everything CI runs: format check, lint, tests, build    |

The build is a plain static site with relative asset paths and hash-based URLs
(`/#/read/…`), so `dist/` can be dropped onto any static host, at any path,
with no server configuration.

## What stage 1 does

- Paste text and read it one word at a time, from 100 to 1000 words per minute.
- The speed shown is the true average: pauses after commas, sentences and
  paragraphs are built in, not added on top.
- Play, pause, jump back or forward a sentence, scrub to any position.
- Keyboard: `Space` play/pause · `←` `→` sentence · `↑` `↓` speed · `R` restart · `Esc` close.
- Texts and reading positions are saved in the browser; reopening a text resumes it.
- Light and dark themes, following the system until you choose.

## How the code is organised

```
src/
  core/        The reading engine. Pure TypeScript: no React, no DOM.
               tokenize → timeline (pacing) → Player (playback), plus pivot and
               sentence navigation.
  lib/         Shared building blocks: storage, documents, settings, the
               Services and FeatureModule contracts, URL builders, helpers.
  ui/          Shared presentational components: buttons, icons, wordmark.
  features/    One folder per feature, each a self-contained slice.
    home/        Start page: paste box, sample, recent texts.
    reader/      The reading screen.
  app/         Composition: feature registry, routes, shell, service wiring.
  styles/      Design tokens and base styles.
  test/        Test setup and a helper that renders the whole app in memory.
```

Dependencies point one way: `app → features → lib / ui → core`. The linter
enforces it (see `.oxlintrc.json`): `core` cannot import React or anything else
in the app, `lib` and `ui` cannot import features, and features cannot import
each other or `app`. Inside `src`, imports are written `@/…`.

The seams that let later stages slot in:

- **Feature registry** — `src/app/features.ts` lists every feature. A feature
  exports a `FeatureModule` (`src/lib/feature.ts`): its routes, whether they
  sit inside the app shell or take the full screen, and an optional navigation
  entry. Routes and navigation are assembled from the list.
- **Services** — `src/lib/services.ts` defines what the app depends on
  (documents, settings). Components get them from `useServices()`;
  `src/app/createServices.ts` is the single place that picks implementations.
- **Storage** — everything persists through the small async `KeyValueStore`
  interface. Today it is localStorage; IndexedDB or a server can replace it in
  `createServices.ts` without touching callers.
- **Documents** — the reader opens a document by id (`/read/:id`) from the
  `DocumentRepository`. Anything that can produce text and call `create()`
  (file import, URL import) immediately works with the reader. Positions are
  stored as character offsets, so they survive changes to how text is split.
- **Settings** — one typed object with defaults (`src/lib/settings`). Saved
  values are merged over defaults, so new settings need no migration.
- **Engine** — the `Player` emits snapshots and knows nothing about the UI.
  Statistics, training modes or a different display can subscribe to it.
- **Design tokens** — colours, type and spacing live in
  `src/styles/tokens.css`; components never hard-code them.

### Adding a feature

1. Create `src/features/<name>/` with its pages, components and an `index.ts`
   that exports a `FeatureModule`.
2. Add it to the list in `src/app/features.ts`.
3. If other features need to link to it, add a builder to `src/lib/paths.ts`.
4. If it needs new shared state or persistence, add a service to
   `src/lib/services.ts` and wire it in `src/app/createServices.ts`.

## Stages

1. **Core reader** — done. Everything above.
2. **Library and import** — a library page; import from `.txt`, `.md`, `.epub`
   and `.pdf` files and from article URLs; move document storage to IndexedDB
   so whole books fit.
3. **Reading preferences** — a settings page: font and size, pause lengths,
   several words at a time, a view of the surrounding text when paused.
4. **Progress and statistics** — reading sessions, words read, speed over time.
5. **Training** — guided speed ramps and comprehension checks.
6. **Offline and sync** — installable app that works offline; optional
   accounts to sync the library across devices.

The order and contents of stages 2–6 are a proposal, not a commitment.
