# Repository Guidelines

## Project Structure & Module Organization

This is a static Astro site for reading Stoic texts. Route files live in `src/pages`, shared Astro UI in `src/components`, the base page shell in `src/layouts/Base.astro`, shared TypeScript data/helpers in `src/lib`, and global styles in `src/styles/global.css`.

Primary text content lives in `src/content`, organized by work and, where needed, book/section directories such as `src/content/meditations/book-05/section-01.md`. Source-ingestion scripts and raw source files live in `scripts/`; generated build output goes to `dist/` and should not be edited directly.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Astro development server.
- `npm run build`: build the static site into `dist/`; `postbuild` also runs Pagefind indexing.
- `npm run preview`: serve the built site locally for verification.
- `npm run parse`: parse files from `scripts/source.txt` and `scripts/sources/` into repository content.

## Coding Style & Naming Conventions

Use strict TypeScript via `astro/tsconfigs/strict`. Keep imports at the top of files. Follow the existing style: tabs for indentation, double quotes in JavaScript/TypeScript config, semicolons, and small focused modules.

Name Astro components in PascalCase, for example `AuthorPage.astro`. Use lowercase route filenames unless Astro dynamic routing requires bracket syntax, such as `src/pages/book/[book].astro`. Keep generated content filenames predictable: `book-05/section-01.md`, not ad hoc titles.

## Testing Guidelines

There is no dedicated test script yet. For changes that affect rendering, routing, content parsing, or search, run `npm run build` and then `npm run preview` to inspect the built site. For parser changes, run `npm run parse` against representative source files before building.

If adding tests later, prefer colocated TypeScript tests for library logic and small fixture-based tests for parser behavior.

## Commit & Pull Request Guidelines

This repository currently has no commit history, so no established convention exists. Use concise imperative commits, for example `Add Seneca content parser` or `Fix meditations section routing`.

Pull requests should include a brief summary, commands run, screenshots for visible UI changes, and notes on any content-generation side effects. Link related issues when applicable, and call out changes to parsing, generated Markdown, routing, or search indexing because those affect large parts of the site.

## Security & Configuration Tips

Do not commit private source texts, credentials, or local environment files. Treat `scripts/sources/` as input material and verify licensing before adding new texts.
