---
title: 用 Oink 搭个人站：从零到发布的笔记整理
linkTitle: Oink 建站笔记
description: 不太懂前端时，如何用 Hugo + Oink 搭文档站——内容结构、博客写法、hugo.yml 与本地预览命令。
date: 2026-08-29
tags: [Oink, Hugo, 建站, 博客]
---

[Oink 官方教程](https://oink.pgsty.com/zh/book/) 写得很完整，但对不太了解前端的人来说，第一次把「文件夹、配置、命令」串起来仍会有点晕。这篇把我最近搭 [YHY Study Website](https://ryanyhy.github.io/YHY-Website/) 时的笔记整理成一条线：先搞清 Oink 是什么，再理解 `content/` 怎么组织，最后走一遍写博客和发布的流程。

![Oink 建站示意](oink-site-setup-cover.png)
{caption="Markdown → Hugo → Oink 主题 → 可发布的静态站点"}

## Oink 和 Hugo 各管什么 {#stack}

**Hugo** 是静态站点生成器：读 Markdown + 配置，输出 HTML。  
**Oink** 是 Hugo 主题：决定侧栏、卡片、提示块、代码块等「长什么样」。

内容和外观分开维护：

- **站点仓库**（`my-project-docs`）：Markdown 文章、`hugo.yml` 配置
- **主题仓库** [github.com/pgsty/oink](https://github.com/pgsty/oink)：模板与样式

站点在 `hugo.yml` 里声明「用 Oink 主题」，`go.mod` 固定版本（当前 v0.6.0）。运行 `hugo server` 时：

1. 从站点仓库读文章和配置
2. 从主题模块（按 `go.mod` 下载）读模板和样式
3. 把内容套进主题，生成网页

> [!NOTE] 日常够用的一条命令
> 只写文档、不改主题时，记住 `hugo server` 即可；不必一开始就碰 `make dev`。

## 本地预览：先让站跑起来 {#preview}

进入项目目录后启动：

```powershell
cd D:\MyData\yhy\6data\repository\my-project-docs
hugo server
```

浏览器打开 <http://localhost:1313/>。改 `content/` 下的 `.md` 保存后会自动刷新。

若希望每次改动都做更完整的重渲染（排查样式问题时有用）：

```powershell
hugo server -DFE --disableFastRender
```

- `-DFE`：草稿、未来日期页面也显示，方便写作
- `--disableFastRender`：关掉快速渲染，避免增量更新带来的偏差

## content/ 怎么分层 {#structure}

Oink **不单独维护导航库**：磁盘上的文件夹结构 = 侧栏结构 = URL 路径。

三个常用概念：

| 概念 | 含义 |
| ---- | ---- |
| Section（分区） | 有 `_index.md` 的文件夹，这一层本身也有入口页 |
| Page（页面） | 文件夹里的 `.md`，或子文件夹里的 `index.md` |
| Sibling（同级） | 同一目录下多篇 `.md`，用 `weight: 10/20/30…` 排序 |

本站根目录示意：

```text
content/
├── _index.md           → 首页
├── search.md           → 搜索页（特殊，一般不改）
├── links.md            → 友链
├── experience/         → 经历（文档型，type: docs）
├── learn/              → 学习
└── blog/               → 博客（按 date 排序）
```

一篇文章两种放法：

| 方式 | 路径示例 | 适合 |
| ---- | -------- | ---- |
| 单文件 | `content/blog/my-post.md` | 纯文字、图放 `static/` |
| 页面包 | `content/blog/my-post/index.md` + 同目录图片 | 一篇多图，图与文放一起 |

## hugo.yml 里先认这几个键 {#hugo-yml}

不用一次读完整个配置文件，先知道这几项即可：

| 键 | 作用 |
| ---- | ---- |
| `title` | 站名，出现在浏览器标签、顶栏等 |
| `params.productionURL` + `baseURL` | 正式上线后的完整网址；影响 sitemap、RSS、绝对链接 |
| `params.github_repo` | 「编辑此页」等按钮指向的内容仓库 |
| `params.copyright` | 页脚版权信息 |
| `languages.zh.menus.main` | 顶栏菜单（经历 / 学习 / 博客 / 友链） |

`baseURL` 常和 `productionURL` 用 YAML 锚点绑在一起：

```yaml
productionURL: &productionURL https://ryanyhy.github.io/YHY-Website/
baseURL: *productionURL
```

`&productionURL` 定义名字，`*productionURL` 引用，改一处全站生效。

## 写一篇博客：五步 {#blog-steps}

1. **起文件名** — 在 `content/blog/` 新建 `.md`，文件名会变成 URL 的一部分，建议用英文 slug（如 `oink-site-setup-notes.md` → `/blog/oink-site-setup-notes/`）。
1. **写 front matter** — 文件最上方元数据，至少含 `title`、`date`、`description`；`linkTitle` 是列表/卡片上的短标题。
1. **写正文** — 从 Obsidian 复制后改语法（见下节）；可加提示块、步骤列表、锚点、图片。
1. **本地预览** — `hugo server`，打开 `/blog/` 看卡片和文章页。
1. **发布** — `git add` → `git commit` → `git push`，GitHub Actions 构建并更新 GitHub Pages。
{.steps}

front matter 模板：

```yaml
---
title: 文章完整标题
linkTitle: 列表短标题
description: 一句话摘要，搜索和卡片会用。
date: 2026-08-29
tags: [Oink, Hugo]
---
```

## Obsidian 迁到 Oink：语法对照 {#obsidian}

| Obsidian | Oink / Markdown | 处理 |
| -------- | --------------- | ---- |
| `==高亮==` | `**加粗**` | 全部替换 |
| `[[双链]]` | `[文字](/path/)` 或外链 | 改成真实链接 |
| 图片 `![[x.png]]` | `![说明](路径)` | 见下文 |

Oink 常用组件（详见 [组件文档](https://oink.pgsty.com/zh/docs/components/)）：

**提示块**

```markdown
> [!NOTE] 阅读提示
> 正文写在这里。
```

**步骤列表** — 每行用 `1.`，末尾加 `{.steps}`（见上文「五步」）。

**标题锚点** — `## 小节 {#id}`，`{#id}` 不显示，用于 `[文字](#id)` 文内跳转。

**图片与图注** — `{caption="..."}` 必须写在**图片下一行**（不能和 `![...](...)` 挤同一行）：

```markdown
![示意](/images/blog/example.png)
{caption="图注显示在图片正下方"}
```

- 全局图：放 `static/images/...`，文中用 `/images/...`
- 页面包：与 `index.md` 同目录，用相对路径

## make 四条命令：改主题才需要 {#make-commands}

`Makefile` 里的四条是别名。Windows 上往往没有 `make`，且 **`make dev` / `make check` 需要上级目录有 `../oink` 主题源码**。

| 命令 | 主题来源 | 适合 |
| ---- | -------- | ---- |
| `make dev` | 本地 `../oink` | 改主题时快速预览 |
| `make check` | 本地 `../oink` | 改主题后跑 `npm test` |
| `make build` | `go.mod` 固定版 | 正式构建，与线上一致 |
| `make serve` | `go.mod` 固定版 | 生产配置本地预览 |

只写内容、不改主题时，用 PowerShell 等价即可：

| 目的 | PowerShell |
| ---- | ---------- |
| 日常预览 | `hugo server` |
| 正式构建 | `hugo --cleanDestinationDir --minify` |
| 接近线上效果 | `hugo server --environment production --minify` |

> [!IMPORTANT] dev 与 check 的分工
> **dev** 偏快、给人看效果；**check** 偏慢、跑自动化测试。改主题时：先 dev 满意，再 check 过关。

## 发布：git 三步 {#publish}

确认本地预览无误后：

```powershell
git add content/blog/oink-site-setup-notes.md
git commit -m "blog: add Oink site setup notes"
git push origin main
```

- `git add`：选中本次要提交的文件（只提交博客就写具体路径；全部提交可用 `git add -A`）
- `git commit`：在本地打快照
- `git push`：推到 GitHub，触发 Actions 部署

顺序：**add → commit → push**。

## 小结 {#summary}

搭 Oink 站可以记一条主线：**Hugo 生成页面，Oink 管样式，content/ 文件夹就是导航树**。写博客 = front matter + Markdown 正文 + 本地 `hugo server` + push。图注记得换行写 `{caption=...}`；Obsidian 的 `==` 和 `[[链接]]` 发布前要改成标准 Markdown。

更系统的阅读顺序仍推荐 [Oink 教程书](https://oink.pgsty.com/zh/book/) 第 1–3 章；本站 [RAICOM 文档](/experience/2026-raicom/overview/) 可作为写法范例对照。
