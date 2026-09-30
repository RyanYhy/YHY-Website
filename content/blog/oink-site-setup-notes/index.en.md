---
title: Building a Personal Site with Oink, from Setup to Publication
linkTitle: Oink Site Setup Notes
description: Notes on building a documentation site with Hugo and Oink as a frontend beginner, covering content structure, blog posts, hugo.yml, and local preview commands.
date: 2026-08-29
tags: [Oink, Hugo, websites, blogging]
---

The [official Oink tutorial](https://oink.pgsty.com/zh/book/) is comprehensive, but connecting the folders, configuration, and commands can still be confusing the first time, especially without much frontend experience. These notes from building [YHY Study Website](https://ryanyhy.github.io/YHY-Website/) follow one path: understand Oink, learn how `content/` is organized, and then write and publish a blog post.

![Oink site setup diagram](oink-site-setup-cover.png)
{caption="Markdown → Hugo → the Oink theme → a deployable static site"}

## What Hugo and Oink each do {#stack}

**Hugo** is a static site generator: it reads Markdown and configuration and produces HTML.
**Oink** is a Hugo theme: it controls the appearance of sidebars, cards, callouts, code blocks, and other components.

Content and appearance are maintained separately:

- **Site repository** (`my-project-docs`): Markdown articles and `hugo.yml` configuration
- **Theme repository**, [github.com/pgsty/oink](https://github.com/pgsty/oink): templates and styles

The site declares the Oink theme in `hugo.yml`, and `go.mod` pins its version, currently v0.6.0. When you run `hugo server`, Hugo:

1. Reads articles and configuration from the site repository.
2. Reads templates and styles from the theme module downloaded according to `go.mod`.
3. Renders the content with the theme to generate web pages.

> [!NOTE] One command for everyday use
> When writing documentation rather than changing the theme, `hugo server` is enough to remember. You do not need to start with `make dev`.

## Local preview: get the site running first {#preview}

Enter the project directory and start the server:

```powershell
cd D:\MyData\yhy\6data\repository\my-project-docs
hugo server
```

Open <http://localhost:1313/> in a browser. Saving a changed `.md` file under `content/` automatically refreshes the page.

For a more complete rerender after each change, useful when investigating styling problems:

```powershell
hugo server -DFE --disableFastRender
```

- `-DFE`: includes draft and future-dated pages for writing.
- `--disableFastRender`: disables fast rendering to avoid discrepancies caused by incremental updates.

## Organizing content/ {#structure}

Oink **does not maintain a separate navigation database**: the folder structure on disk determines both the sidebar structure and URL paths.

Three common concepts:

| Concept | Meaning |
| ------- | ------- |
| Section | A folder with `_index.md`; this level also has its own entry page |
| Page | A `.md` file in a folder, or `index.md` in a subfolder |
| Sibling | Pages in the same directory, ordered with `weight: 10/20/30…` |

The root content structure of this site:

```text
content/
├── _index.md           → Home page
├── search.md           → Search page (special; usually left unchanged)
├── links.md            → Friends and links
├── experience/         → Experience (documentation-style, type: docs)
├── learn/              → Learning
└── blog/               → Blog (ordered by date)
```

Two ways to store an article:

| Format | Example path | Suitable for |
| ------ | ------------ | ------------ |
| Single file | `content/blog/my-post.md` | Text posts with images stored in `static/` |
| Page bundle | `content/blog/my-post/index.md` plus images in the same directory | Posts with multiple images kept beside the text |

## The first hugo.yml keys to learn {#hugo-yml}

You do not need to read the whole configuration at once. Start with these fields:

| Key | Purpose |
| --- | ------- |
| `title` | Site name shown in browser tabs, the navbar, and elsewhere |
| `params.productionURL` + `baseURL` | Full production address; affects sitemaps, RSS, and absolute links |
| `params.github_repo` | Content repository used by buttons such as “Edit this page” |
| `params.copyright` | Footer copyright information |
| `languages.zh.menus.main` | Navbar menus: Experience, Learning, Blog, and Links |

`baseURL` is often tied to `productionURL` with a YAML anchor:

```yaml
productionURL: &productionURL https://ryanyhy.github.io/YHY-Website/
baseURL: *productionURL
```

`&productionURL` defines the name; `*productionURL` references it. Changing one value updates the whole site.

## Writing a blog post in five steps {#blog-steps}

1. **Choose a filename** — Create a `.md` file under `content/blog/`. Its filename becomes part of the URL, so use an English slug, such as `oink-site-setup-notes.md` → `/blog/oink-site-setup-notes/`.
1. **Add front matter** — Metadata at the top should include at least `title`, `date`, and `description`. `linkTitle` is the shorter title displayed in lists and cards.
1. **Write the body** — Adjust syntax copied from Obsidian, as explained below. Add callouts, step lists, heading anchors, and images as needed.
1. **Preview locally** — Run `hugo server` and open `/blog/` to check the card and article page.
1. **Publish** — `git add` → `git commit` → `git push`; GitHub Actions builds and updates GitHub Pages.
{.steps}

A front matter template:

```yaml
---
title: Full article title
linkTitle: Short list title
description: A one-sentence summary used by search and cards.
date: 2026-08-29
tags: [Oink, Hugo]
---
```

## Moving from Obsidian to Oink: syntax comparison {#obsidian}

| Obsidian | Oink / Markdown | What to do |
| -------- | --------------- | ---------- |
| `==highlight==` | `**bold**` | Replace throughout |
| `[[wikilink]]` | `[text](/path/)` or an external link | Use an actual link |
| Image `![[x.png]]` | `![description](path)` | See below |

Common Oink components are described in the [component documentation](https://oink.pgsty.com/zh/docs/components/):

**Callouts**

```markdown
> [!NOTE] Reading note
> Write the body here.
```

**Step lists** — Start each item with `1.` and add `{.steps}` at the end, as in the five steps above.

**Heading anchors** — Use `## Section {#id}`. The `{#id}` is not displayed and supports in-page links such as `[text](#id)`.

**Images and captions** — Put `{caption="..."}` **on the next line after the image**, not on the same line as `![...](...)`:

```markdown
![Diagram](/images/blog/example.png)
{caption="The caption appears directly below the image"}
```

- Global images go in `static/images/...` and are referenced as `/images/...`.
- Page-bundle images sit beside `index.md` and use relative paths.

## Four make commands for theme development {#make-commands}

The four commands in `Makefile` are aliases. Windows often has no `make`, and **make dev / make check require the theme source at ../oink**.

| Command | Theme source | Suitable for |
| ------- | ------------ | ------------ |
| `make dev` | Local `../oink` | Quick previews while changing the theme |
| `make check` | Local `../oink` | Running `npm test` after theme changes |
| `make build` | Version pinned in `go.mod` | Production builds matching the deployed site |
| `make serve` | Version pinned in `go.mod` | Local previews with production configuration |

When only editing content, use the PowerShell equivalents:

| Goal | PowerShell |
| ---- | ---------- |
| Everyday preview | `hugo server` |
| Production build | `hugo --cleanDestinationDir --minify` |
| Preview close to production | `hugo server --environment production --minify` |

> [!IMPORTANT] How dev and check differ
> **dev** prioritizes fast visual feedback; **check** takes longer and runs automated tests. When changing the theme, first get the result right with dev, then pass check.

## Publishing: three Git steps {#publish}

After confirming the local preview:

```powershell
git add content/blog/oink-site-setup-notes.md
git commit -m "blog: add Oink site setup notes"
git push origin main
```

- `git add`: selects files for this commit. Specify the exact path when committing only the blog post; use `git add -A` to stage everything.
- `git commit`: creates a local snapshot.
- `git push`: sends it to GitHub and triggers Actions deployment.

The order is **add → commit → push**.

## Summary {#summary}

The main idea is: **Hugo generates pages, Oink controls their appearance, and the content/ folders form the navigation tree**. Writing a blog post means adding front matter and Markdown, previewing with `hugo server`, and pushing. Put `{caption=...}` on its own line, and convert Obsidian's `==` and `[[links]]` to standard Markdown before publishing.

For a more systematic introduction, read chapters 1–3 of the [Oink tutorial book](https://oink.pgsty.com/zh/book/). This site's [RAICOM documentation](/experience/2026-raicom/overview/) is a writing example in Chinese.
