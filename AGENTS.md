# Oink project-site guide

Start with `README.md` for this site's build and repository boundary, and
`TRANSLATION.md` for bilingual content rules. Public maintainer contracts,
accepted decisions, dated research, and proposals live under
`content/docs/design/`; this directory is their canonical bilingual source,
not a projection of a second theme-local document tree.

## Repository boundary

- This repository contains the documentation and regression site.
- Theme code belongs in `github.com/pgsty/oink`.
- This site is the canonical integration, browser, accessibility, responsive,
  and visual-review surface for theme development.
- The site imports the theme in `hugo.yml` and pins it in `go.mod`.
- Site configuration is a single root `hugo.yml`; there is no `config/`
  directory and no per-environment config overlay.
- For sibling-checkout development, set `HUGO_MODULE_REPLACEMENTS` inline for
  the command that needs the local theme; do not generate a workspace from the
  Makefile.

## Paired site synchronization

- `../my-project-docs-vercel` is the primary editing copy. Whenever a change is
  made there, apply the equivalent change to this repository in the same task.
- Synchronize shared site material, including `content/`, `assets/`, `layouts/`,
  `static/`, `data/`, `scripts/`, tests, dependency pins, and shared Hugo
  settings.
- Preserve deployment-specific differences instead of copying them verbatim:
  this repository owns GitHub Pages configuration, its Pages base URL and
  repository links; the sibling owns `vercel.json`, `build.sh`, `.vercel/`
  ignores, the Vercel domain, and Vercel repository links.
- Keep deployment-specific README text and issue-template URLs appropriate to
  each site. Do not treat generated `public/`, `resources/_gen/`, caches, or
  lock files produced by Hugo as authoritative synchronization sources.
- Before completing a change that started in the Vercel sibling, compare both
  trees and report any remaining differences that are not deployment-specific.

## Content conventions

- Blog comment threads use the same Giscus discussion across Chinese and English
  pages and across both deployments. The stable discussion term is the
  language-neutral blog path, `/blog/<slug>/`; never derive it from the full
  deployed URL, title, or language prefix. Keep non-blog comments disabled.
- Put disposable learning notes and conversation-generated scratch files in
  the shared sibling directory `../rubbish/`. Never place them under either
  repository, reference them from published content, or include them in Git.

- Simplified Chinese is the default and authoritative language for this
  personal site. Add English peers with an `.en.md` suffix beside the Chinese
  source file.
- Follow `TRANSLATION.md`. The home page, navigation, and top-level section
  pages must remain paired; long-form articles may be translated incrementally.
- When editing a page that already has an English peer, update both languages
  in the same delivery.
- Preserve explicit stable heading IDs and verify them in rendered HTML.
- Keep changelog, upgrade guidance, current docs, and release messages focused
  on their distinct audiences.

## Design records and PRDs

- Put every new PRD, RFC, or design proposal in
  `content/docs/design/proposals/<slug>.md` with a matching `<slug>.zh.md`.
- Follow the lifecycle and template published at `/docs/design/proposals/`.
  A proposal is non-normative until implementation and acceptance are recorded.
- Put accepted rationale under `content/docs/design/decisions/` and dated,
  non-normative evidence under `content/docs/design/research/`.
- Do not create repository-local `plan/`, `plans/`, `proposal/`, or parallel
  design-document trees. Use Git history and `CHANGELOG.md` for retired drafts.
- When a proposal changes public behavior, update the theme implementation,
  owning checker, and affected English and Chinese contract in one delivery.

## Validation

Use the smallest relevant command from `package.json`; run `npm test` for the
complete non-browser site suite and `npm run test:browser` for Playwright and
axe coverage. A local build, a public theme release, and a hosted site
deployment are separate completion states.
