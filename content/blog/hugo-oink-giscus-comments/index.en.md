---
title: 'How Hugo and Oink Integrate Giscus Comments'
linkTitle: How Giscus Comments Work
description: A complete walkthrough from Hugo parameters and Oink templates to the Giscus iframe and GitHub Discussions, including shared comments across languages and deployments.
date: 2026-09-30
tags: [Hugo, Oink, Giscus, GitHub, comments]
---

Hugo produces static HTML. It does not provide a server that accepts comments, a database, or a user system. Adding comments to a Hugo site with Oink therefore means delegating the comment interface to Giscus and storing the data in GitHub Discussions.

This article separates the responsibilities of Hugo, Oink, Giscus, and GitHub Discussions, then follows the complete path from build time to a working comment section on this bilingual site with two deployments.

![Chinese illustration showing a static blog receiving comments through Giscus](giscus-comments-cover-zh.png)
{caption="A static blog joins the conversation through Giscus and GitHub Discussions"}

## What the four components do {#roles}

| Component | Responsibility |
| --------- | -------------- |
| Hugo | Reads Markdown and configuration and generates blog pages |
| Oink | Provides page templates and decides when and where to output a comment container |
| Giscus | Displays the comment interface and communicates with GitHub |
| GitHub Discussions | Stores discussions, replies, identities, and reactions |

The relationship is:

```text
Markdown + hugo.yml
        │
        ▼
Hugo renders HTML with Oink templates
        │
        ▼
The page loads a Giscus iframe
        │
        ▼
Giscus finds or creates a GitHub Discussion
```

Comment data always remains in GitHub Discussions. The blog embeds an entry point for viewing and posting Discussion content. The [official Giscus documentation](https://giscus.app/) explains that Giscus uses the GitHub Discussions search API to find the discussion mapped to a page and creates one when a visitor first comments or reacts if none exists.

## Why a static site needs an external comment backend {#why-backend}

A conventional comment system needs at least this flow:

```text
A visitor submits a comment
    ↓
A server authenticates the visitor and receives the request
    ↓
A database stores the comment
    ↓
Another visitor opens the page
    ↓
The server reads previous comments
    ↓
The page displays them
```

That normally means maintaining an application server, database, login system, permissions, and spam controls. Hugo only builds static files; it does not continuously run an application that handles those requests.

Giscus reuses GitHub's existing services:

- GitHub accounts provide identity.
- GitHub Discussions store the main post, replies, and reactions.
- Giscus maps the current page to one Discussion and provides the embedded interface.
- Repository maintainers moderate, reply, pin, lock, or remove content in Discussions.

The site therefore needs neither a comment database nor a GitHub token in `hugo.yml`.

## Why a Hugo parameter can control comments {#hugo-params}

Hugo lets a site define parameters in configuration or page front matter. For example:

```yaml
comments: true
```

To Hugo, this is simply a value. Oink's templates give it meaning by reading site-level and page-level comment parameters and deciding whether to output the comment container and load Giscus.

Hugo's [front matter documentation](https://gohugo.io/content-management/front-matter/) explains that metadata at the top of a page can describe content and influence template selection and publication structure. This site keeps the full Giscus configuration in `hugo.yml` and uses section cascades to control where it appears:

- Blog articles inherit the global comment setting.
- The blog index explicitly sets `comments: false`.
- The home, learning, and experience sections do not display comments.
- Chinese and English versions of a blog post use the same discussion identifier.

This avoids repeating the entire Giscus configuration in every article.

## What the Giscus configuration contains {#giscus-config}

The central configuration for this site is:

```yaml
params:
  comments:
    enable: true
    type: giscus
    giscus:
      repo: RyanYhy/my-project-docs-vercel
      repoId: R_kgDOUXvkaw
      category: Announcements
      categoryId: DIC_kwDOUXvka84DGph2
      mapping: specific
      strict: 0
      reactionsEnabled: 1
      emitMetadata: 0
      inputPosition: bottom
      theme: auto
      loading: lazy
```

The four essential identifiers are:

| Setting | Purpose |
| ------- | ------- |
| `repo` | Selects the public repository containing Discussions |
| `repoId` | GitHub's public unique identifier for that repository |
| `category` | Selects the category for new discussions |
| `categoryId` | GitHub's public unique identifier for that category |

These are routing identifiers, not secrets or access tokens. The target repository must also be public, have Discussions enabled, and have the Giscus App installed. The official configurator recommends an Announcements-type category so only maintainers and Giscus can create new Discussions there.

The remaining settings control behavior:

- `reactionsEnabled: 1` displays reactions on the main discussion post.
- `emitMetadata: 0` disables periodic Discussion metadata messages to the parent page.
- `inputPosition: bottom` puts the input box below existing comments.
- `loading: lazy` delays loading until the iframe is near the viewport.
- `theme: auto` follows the site's light or dark mode.
- Chinese pages use `zh-CN`, while English pages use `en`. This changes the Giscus interface, not the language of user comments.

## How the page loads comments {#rendering-flow}

The process has a build phase and a browser phase.

### Build phase {#build-stage}

When Hugo builds a blog page, Oink checks the comment switch and required configuration. If the conditions pass, the template outputs a parameterized container similar to:

```html
<section
  data-td-giscus
  data-repo="RyanYhy/my-project-docs-vercel"
  data-category="Announcements"
  data-mapping="specific"
  data-term="/blog/hugo-oink-giscus-comments/">
  <div data-td-giscus-container></div>
</section>
```

No comment data exists in the generated HTML. It only reserves a container and tells the browser which repository, category, and discussion identifier to use later.

### Browser phase {#browser-stage}

After a visitor opens the page, Oink's JavaScript dynamically loads:

```text
https://giscus.app/client.js
```

Giscus then creates an iframe. It appears at the bottom of the blog, but technically comes from an independent page served by `giscus.app`:

```text
Blog page
├── Article
├── Images and code
└── iframe
    └── Giscus comment interface
        └── GitHub Discussions API
```

The iframe isolates the comment application from the blog page. Oink also watches the site's color mode and uses browser `postMessage` events to send theme changes to the Giscus iframe.

If the script or iframe fails to load, Oink exits the loading state and displays a localized error message instead of leaving the page waiting indefinitely.

## How one article maps to one Discussion {#mapping}

Giscus needs to know which Discussion belongs to the current page. Available mappings include the full URL, `pathname`, the page title, and a specific string.

A single-language site on one domain can often use:

```yaml
mapping: pathname
```

Different paths then normally create different discussions. This site, however, has Chinese and English content on two deployments:

```text
/blog/example/
/en/blog/example/
/YHY-Website/blog/example/
/YHY-Website/en/blog/example/
```

Using the browser pathname directly would split one article across several Discussions. The site therefore uses:

```yaml
mapping: specific
```

A Hugo template derives a common `data-term` from `.Page.Path`:

```text
/blog/example/
```

Hugo's [Page.Path documentation](https://gohugo.io/methods/page/path/) states that the logical path excludes file extensions and language identifiers. Removing deployment domains and the GitHub Pages base path gives all four entry points the same identifier:

```text
Chinese on Vercel ─┐
English on Vercel ─┼─→ /blog/example/ ─→ one Discussion
Chinese on Pages  ─┤
English on Pages  ─┘
```

The title may be translated and the domain may change while the comment thread remains stable. Changing the article slug changes this identifier, so a slug change should preserve the old term or include a deliberate Discussion migration plan.

## How comments are created and moderated {#management}

After loading, Giscus searches the configured repository and category with the mapping term:

1. If a match exists, it fetches and displays the existing comments.
1. If no match exists, it initially displays an empty comment section.
1. The first comment or reaction causes Giscus Bot to create the Discussion.
1. A visitor authorizes Giscus through GitHub OAuth to post on their behalf.
1. The site owner moderates content in GitHub Discussions.

Visitors may also participate directly in the GitHub Discussion. Both interfaces operate on the same data.

## Summary {#summary}

Giscus does not copy comments into Hugo. It embeds a GitHub Discussion in the blog: Hugo generates the page, Oink decides whether to load comments and passes the configuration, Giscus provides the interface and communication layer, and GitHub Discussions persists identities and data.

For a simple site, `pathname` may be enough. For a bilingual site with two deployments, the important design choice is a stable identifier independent of language and domain. This site uses `specific + /blog/<slug>/` so every version of the same article shares one comment thread.
