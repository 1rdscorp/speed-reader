# Speed Reader

A website for reading faster. Text is shown one word at a time at a fixed point
on the screen, with one letter of each word highlighted as the place to rest
your eyes, so reading speed is set by a dial instead of by eye movement.

It is being built in stages, to the design in the "Speed Reader – site mockup".
**The reader and its settings are done** (stages 1 and 2), along with a library
and file import; the plan for the rest is [below](#stages).

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
with no server configuration. The one feature that needs more than a static
host is importing from a link; see [below](#importing-from-a-link).

### Publishing

Every push to the default branch that passes the checks is built and published
to GitHub Pages by the CI workflow (`.github/workflows/ci.yml`). This relies on
**Settings → Pages → Build and deployment → Source** being set to **GitHub
Actions**; with "Deploy from a branch", Pages would serve the unbuilt source
files, which is a blank page.

GitHub Pages serves static files only, so the published site has link import
switched off. Everything else works there.

## What it does

Reading:

- Read any text one word at a time, from 100 to 1000 words per minute, or two
  or three words at a time.
- The speed shown is the true average: pauses after commas, sentences and
  paragraphs are built in, not added on top. They can be switched off.
- Play, pause, skip back or forward ten words, restart, or drag the progress
  bar to any position.
- Choose the size of the word, the color of its focus letter, and a dark
  reading area. The Settings page shows every setting with a live preview.
- Make the reading area fill the screen, with a larger word, and switch that
  screen between white and dark.
- Switch the whole site between light and dark with the button in the header.
- Keyboard: `Space` play/pause · `←` `→` ten words · `Shift` + `←` `→` sentence ·
  `↑` `↓` speed · `R` restart · `F` full screen.

Getting text in:

- Paste it, or open files: plain text, Markdown, saved web pages, EPUB and PDF.
  Choose them or drop them anywhere on the Read page, several at once if you like.
- Web pages are reduced to the article (the same extraction as Firefox's Reader
  View). EPUBs are read in chapter order. PDFs have their lines rejoined into
  paragraphs and their page numbers and running headers removed.
- Files that cannot be read say why: scanned PDFs with no text, copy-protected
  books, unsupported formats.
- Generate a practice text: pick a topic and a length, and the site puts one
  together from its own bank of short passages (`src/lib/practice/bank.ts`).
  It runs in the browser; no AI service is involved.
- Paste a link to an article, where the site is deployed with the page endpoint.

Keeping it:

- Everything is saved in the browser, in IndexedDB, with room for whole books.
  Nothing leaves the device.
- The library lists every text with progress and time left; search, sort,
  rename, and remove with undo. Opening a text resumes where you stopped.

### Importing from a link

A browser will not let one site read another site's pages, so fetching an
article needs a small server-side helper: the page endpoint in
`server/pageProxy.ts`. It is written against the standard `Request` and
`Response`, has no dependency on the app, and is locked down (same-origin
callers only, public web addresses only, document types only, size and time
limits, and responses the browser can never render).

- `npm run dev` and `npm run preview` serve it at `/api/page`
  (`server/vitePlugin.ts`), and `.env.development` points the app at it, so
  link import works locally out of the box.
- A production build has link import **switched off** unless
  `VITE_PAGE_ENDPOINT` is set at build time, because a static host cannot run
  the endpoint. To turn it on, deploy `handlePageRequest` as a function on the
  same origin as the site and build with `VITE_PAGE_ENDPOINT` set to its path.
  To try a production build locally:

  ```bash
  VITE_PAGE_ENDPOINT=/api/page npm run build
  ```

  ```bash
  npm run preview
  ```

## How the code is organised

```
src/
  core/        The reading engine. Pure TypeScript: no React, no DOM.
               tokenize → frames (words shown together) → timeline (pacing) →
               Player (playback), plus the focus letter and sentence navigation.
  lib/         Shared building blocks: storage, documents, import, settings,
               the Services and FeatureModule contracts, URL builders, helpers.
    import/      Files and pages in, plain text out. One reader per format,
                 each loaded only when first needed.
    practice/    Practice texts: a bank of short passages and the generator
                 that assembles them by topic and length.
  ui/          Shared presentational components: buttons, icons, logo, and the
               word stage with its focus marks.
  features/    One folder per feature, each a self-contained slice.
    home/        The front page: introduction, how it works, the tools.
    reader/      The Read page: the reading area, its controls, adding text.
    library/     Everything saved: search, sort, rename, remove.
    settings/    Reading settings, with a preview of their effect.
    games/       Typing games. Each is a self-contained page in public/games/,
                 shown in a frame; add one by listing it in games.ts.
  app/         Composition: feature registry, routes, shell, service wiring.
  styles/      Design tokens and base styles.
  test/        Test setup and a helper that renders the whole app in memory.
server/        The page endpoint for link import, and the Vite plugin that
               serves it during development. Independent of src/.
```

Dependencies point one way: `app → features → lib / ui → core`. The linter
enforces it (see `.oxlintrc.json`): `core` cannot import React or anything else
in the app, `lib` and `ui` cannot import features, and features cannot import
each other or `app`. Inside `src`, imports are written `@/…`.

The seams that let later stages slot in:

- **Feature registry** — `src/app/features.ts` lists every feature. A feature
  exports a `FeatureModule` (`src/lib/feature.ts`): its routes and an optional
  navigation entry. Routes and the header navigation are assembled from the
  list, so a new stage's page appears in the menu by being added to it.
- **Services** — `src/lib/services.ts` defines what the app depends on
  (documents, settings, importer). Components get them from `useServices()`;
  `src/app/createServices.ts` is the single place that picks implementations.
- **Storage** — everything persists through the small async `KeyValueStore`
  interface. The library uses IndexedDB and settings use localStorage, each
  falling back (to localStorage, then memory) where the browser blocks it. A
  sync server would be one more implementation, chosen in `createServices.ts`.
- **Documents** — the reader opens a document by id (`/read/:id`) from the
  `DocumentRepository`. Anything that can produce text and call `create()`
  immediately works with the reader. Positions are stored as character
  offsets, so they survive changes to how text is split.
- **Import formats** — `src/lib/import/formats.ts` lists the formats. To add
  one, write a reader (bytes in, title and text out) and add it to the list;
  detection, the file picker, drag and drop and link import pick it up.
- **Settings** — one typed object with defaults (`src/lib/settings`). Saved
  values are merged over defaults, so new settings need no migration. Each
  setting has one control (`controls.tsx`) that both the reader's Controls
  panel and the Settings page use; a new setting needs its field, its default
  and its control.
- **Engine** — the `Player` emits snapshots and knows nothing about the UI.
  Statistics, training modes or a different display can subscribe to it.
- **Design tokens** — the mockup's colours, type and spacing live in
  `src/styles/tokens.css`; components never hard-code them.

### Adding a feature

1. Create `src/features/<name>/` with its pages, components and an `index.ts`
   that exports a `FeatureModule`.
2. Add it to the list in `src/app/features.ts`.
3. If other features need to link to it, add a builder to `src/lib/paths.ts`.
4. If it needs new shared state or persistence, add a service to
   `src/lib/services.ts` and wire it in `src/app/createServices.ts`.

## Stages

The plan follows the tool cards on the front page.

1. **RSVP Reader** — done. One word at a time with speed, pause and rewind.
2. **Reading settings** — done. Font size, dark reading area and focus-letter
   color, plus speed, words at a time and punctuation pauses, on a Settings
   page with a live preview. All saved in the browser.
3. **Training drills** — next. Word chunking, a pacer line and
   peripheral-vision exercises.
4. **Speed test and progress** — measure WPM with a short quiz and keep a
   history.

Also built, outside that list: the library and file import. Link import works
locally but is off on the published site, because GitHub Pages cannot run the
page endpoint (see [Importing from a link](#importing-from-a-link)).

Memory exercises are deliberately not part of the plan.
