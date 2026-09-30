---
title: 'Hugo + Oink 如何接入 Giscus 评论系统'
linkTitle: Giscus 评论原理
description: 从 Hugo 参数、Oink 模板到 Giscus iframe 与 GitHub Discussions，拆解静态博客评论功能的完整实现，并说明双语双站点如何共享评论。
date: 2026-09-30
tags: [Hugo, Oink, Giscus, GitHub, 评论系统]
---

Hugo 生成的是静态 HTML，本身没有接收评论的服务器、数据库或用户系统。要给 Hugo + Oink 网站增加评论，关键不是“让 Hugo 保存评论”，而是把评论能力交给 Giscus，再由 GitHub Discussions 保存数据和管理身份。

这篇笔记先拆开 Hugo、Oink、Giscus 和 GitHub Discussions 的职责，再结合本站的双语、双部署结构，说明评论区从构建到显示的完整链路。

![静态博客会聊天？留言由 Giscus 送往 GitHub 讨论区](giscus-comments-cover-zh.png)
{caption="静态博客也能聊起来：Giscus 把留言接到 GitHub Discussions"}

## 四个组件分别负责什么 {#roles}

| 组件 | 职责 |
| ---- | ---- |
| Hugo | 读取 Markdown 和配置，生成博客页面 |
| Oink | 提供页面模板，决定何时、在什么位置输出评论容器 |
| Giscus | 在页面中显示评论界面，并与 GitHub 通信 |
| GitHub Discussions | 保存讨论、回复、用户身份和表态 |

可以把它们理解为：

```text
Markdown + hugo.yml
        │
        ▼
Hugo 使用 Oink 模板生成 HTML
        │
        ▼
页面加载 Giscus iframe
        │
        ▼
Giscus 查询或创建 GitHub Discussion
```

评论数据始终保存在 GitHub Discussions。博客页面只是嵌入一个查看和发表 Discussion 内容的入口。[Giscus 官方说明](https://giscus.app/zh-CN)也明确指出，它使用 GitHub Discussions 搜索 API 查找页面对应的讨论，并在首次评论或表态时创建尚不存在的讨论。

## 为什么静态网站需要外部评论后端 {#why-backend}

普通评论系统至少要完成下面这条链路：

```text
用户提交评论
    ↓
服务器验证用户并接收请求
    ↓
数据库保存评论
    ↓
其他用户打开网页
    ↓
服务器读取历史评论
    ↓
页面显示评论
```

这通常意味着自己维护后端服务器、数据库、登录系统、权限控制和垃圾评论处理。Hugo 只负责构建静态文件，不会持续运行一个处理这些请求的应用。

Giscus 的思路是复用 GitHub 已有的能力：

- GitHub 账户负责用户身份。
- GitHub Discussions 负责保存主讨论、回复和表态。
- Giscus 负责把当前页面映射到一条 Discussion，并提供嵌入式界面。
- 仓库维护者直接在 Discussions 中回复、置顶、锁定或删除内容。

因此网站无需保存 GitHub token，也不需要自行建立评论数据库。

## Hugo 参数为什么能控制评论 {#hugo-params}

Hugo 允许在站点配置或页面 front matter 中定义参数。例如：

```yaml
comments: true
```

对 Hugo 来说，这只是一个值。真正赋予它“显示评论区”含义的是 Oink 的模板：模板读取站点级和页面级评论参数，决定是否输出评论容器、加载 Giscus 脚本。

Hugo 的 [front matter 文档](https://gohugo.io/content-management/front-matter/)说明，页面顶部的元数据既能描述内容，也能影响模板选择和发布结构。本站把全局 Giscus 配置放在 `hugo.yml`，再通过各栏目的 cascade 控制显示范围：

- 博客文章继承全局评论开关。
- 博客列表页显式设置 `comments: false`。
- 首页、学习和经历栏目不显示评论。
- 中英文博客文章使用相同的讨论标识。

这样不用在每篇博客里重复粘贴整段 Giscus 配置。

## Giscus 配置包含什么 {#giscus-config}

本站的核心配置如下：

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

其中最重要的四项是：

| 配置 | 用途 |
| ---- | ---- |
| `repo` | 告诉 Giscus 去哪个公开仓库查找 Discussions |
| `repoId` | GitHub 内部用于唯一识别仓库的公开 ID |
| `category` | 新讨论所在的分类 |
| `categoryId` | GitHub 内部用于唯一识别分类的公开 ID |

这些值是定位信息，不是密码或访问令牌。目标仓库还必须满足三个条件：仓库公开、启用 Discussions、安装 Giscus App。官方配置页建议使用 Announcements 类型的分类，使新 Discussion 只能由维护者和 Giscus 创建。

其余参数控制交互方式：

- `reactionsEnabled: 1`：显示主讨论的表态。
- `emitMetadata: 0`：不向父页面周期发送 Discussion 元数据。
- `inputPosition: bottom`：输入框放在评论列表下方。
- `loading: lazy`：接近评论区时再加载 iframe。
- `theme: auto`：跟随网站深浅色模式。
- 中文页面传 `zh-CN`，英文页面传 `en`，只改变 Giscus 界面语言，不翻译用户评论。

## 页面怎样加载评论区 {#rendering-flow}

构建和浏览器运行分成两个阶段。

### 构建阶段 {#build-stage}

Hugo 构建博客页面时，Oink 先检查评论开关和必需配置。条件满足后，模板输出一个带参数的容器，形式类似：

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

这时还没有评论数据。HTML 只留下容器，并告诉浏览器稍后应连接哪个仓库、分类和讨论标识。

### 浏览器阶段 {#browser-stage}

用户打开页面后，Oink 的 JavaScript 动态加载：

```text
https://giscus.app/client.js
```

Giscus 随后创建 iframe。视觉上它在博客底部，技术上却是由 `giscus.app` 提供的独立页面：

```text
博客页面
├── 正文
├── 图片与代码
└── iframe
    └── Giscus 评论界面
        └── GitHub Discussions API
```

iframe 让评论界面和博客页面彼此隔离。Oink 还会监听网站的深浅色切换，通过浏览器的 `postMessage` 把新主题发送给 Giscus iframe。

如果脚本或 iframe 加载失败，Oink 会结束加载状态并显示本地化错误提示，而不是让页面一直处于等待状态。

## 一篇文章怎样对应一条 Discussion {#mapping}

Giscus 必须知道“当前页面对应哪条 Discussion”。常见映射包括完整 URL、`pathname`、页面标题和自定义字符串。

单语言、单域名网站可以直接用：

```yaml
mapping: pathname
```

此时不同路径通常对应不同讨论。但本站同时存在中文、英文和两个部署地址：

```text
/blog/example/
/en/blog/example/
/YHY-Website/blog/example/
/YHY-Website/en/blog/example/
```

如果直接使用浏览器的 pathname，同一篇文章会被拆成多条 Discussion。因此本站改用：

```yaml
mapping: specific
```

并由 Hugo 模板根据 `.Page.Path` 生成统一的 `data-term`：

```text
/blog/example/
```

Hugo 的 [Page.Path 文档](https://gohugo.io/methods/page/path/)说明，逻辑路径不包含文件扩展名和语言标识。本站再去掉部署域名与 GitHub Pages 基路径的影响，于是四个入口最终使用同一个标识：

```text
中文 Vercel ─┐
英文 Vercel ─┼─→ /blog/example/ ─→ 同一条 Discussion
中文 Pages  ─┤
英文 Pages  ─┘
```

标题可以翻译，域名也可以迁移，只要这个固定标识不变，评论区就仍指向同一条 Discussion。若以后修改文章 slug，则应先考虑如何保留旧标识，否则可能生成新的评论区。

## 评论如何创建与管理 {#management}

Giscus 加载后，会用映射标识搜索指定仓库和分类中的 Discussion：

1. 找到匹配项：读取并显示已有评论。
1. 没找到：先显示空评论区。
1. 用户首次评论或表态：Giscus Bot 自动创建对应 Discussion。
1. 用户发言：通过 GitHub OAuth 授权 Giscus 代表本人发布。
1. 站长管理：进入仓库的 Discussions 页面回复、锁定、置顶或删除。

访客也可以绕过博客页面，直接在 GitHub Discussion 中参与讨论。两边看到的是同一份数据。

## 小结 {#summary}

Giscus 没有把评论复制进 Hugo，而是把 GitHub Discussion 嵌入博客页面。Hugo 负责生成页面，Oink 负责判断是否加载评论并传递配置，Giscus 负责界面与通信，GitHub Discussions 负责持久保存数据和身份。

对普通单站点博客，`pathname` 往往够用；对本站这种双语、双部署结构，更关键的是设计一个与语言、域名无关的稳定标识。当前方案用 `specific + /blog/<slug>/`，让同一篇文章始终共用一个评论区。
