# YHY Study Website

个人学习与项目文档站，基于 [Hugo Extended](https://gohugo.io/) 与 [Oink](https://oink.pgsty.com) 主题构建。

- **线上地址**：<https://ryanyhy.github.io/YHY-Website/>
- **源码仓库**：[RyanYhy/YHY-Website](https://github.com/RyanYhy/YHY-Website)

## 内容栏目

| 栏目 | 说明 |
| ---- | ---- |
| [关于](content/about.md) | 独立的简洁个人介绍 |
| [博客](content/blog/) | 随笔与更新 |
| [项目](content/experience/) | 参与或深入学习的项目，含 [2026 RAICOM 智能侦察](content/experience/2026-raicom/) |
| [友链](content/links.md) | 推荐站点 |

主入口按「关于、博客、项目、友链」排列。项目保留 `/experience/` 地址；
原 `/learn/` 仅有占位内容，移除后不重定向到关于页。

首页与关于页分别维护，均复用主题导航、语言切换、明暗切换及页脚。
首页 `/`、`/en/` 使用 `layouts/index.html` 调用
`layouts/_partials/about/profile.html`，个人资料、经历、项目与 RyR 问候维护于
`content/_index.md`、`content/_index.en.md`。沿用已确认的像素 YHY、头像像素框、
六帧机器人和底部交互终端；头像局部逆时针旋转 90 度，原图不覆盖。
原 `data/home*.yaml` 与 `data/home/` 配置暂时保留，当前首页模板不再读取，
不删除原首页图片或其他素材。

独立 `/about/`、`/en/about/` 继续使用 `layouts/about.html`，正文分别维护在
`content/about.md`、`content/about.en.md`。上半部为左侧可点击的 RyR 与右侧大头像，
头像下依次展示博客、项目、标签数量及 GitHub、邮箱圆形联系方式。
About 头像不加像素边框；机器人下方保留点击提示与问候，不显示编号标签。
统计取默认中文站的已发布内容：博客统计文章，项目统计 `/experience/` 第一层
项目（不把项目子文档计为独立项目），标签统计不同标签；双语页面显示同一组数字。
右侧联系方式下方为方块像素边框的介绍区，直接编辑上述 Markdown 正文，
不使用访客输入框；左栏只放 RyR 及其互动提示，不让介绍区横跨左右栏。
RyR 点击或键盘激活后短暂跳动并问候，随后静止；遵循减少动态效果。
About 独立脚本 `assets/about-page.js` 负责互动与邮箱复制，不加载首页终端。
主导航保持关于、博客、项目、友链，站点品牌链接回到各语言首页。
首页介绍区另设同款按钮，依次为查看项目、博客、关于、友链；手机端两列排列，
GitHub 与邮箱圆形图标保持独立，按钮文案在中英文首页的 profile 参数中维护。

为兼容既有源路径，首页像素资源继续放在 `assets/about/`，小写英文短横线命名；
共享局部模板仍放 `layouts/_partials/about/`，正文短代码放
`layouts/_shortcodes/about-*.html`。首页样式限定在 `.td-profile-page`，About
样式限定在 `.td-about-page`，集中于 `assets/scss/_about.scss`；
`assets/about.js` 只在首页加载，`assets/about-page.js` 只在 About 加载。
截图、试验与检查日志仍放 `../rubbish/`。

首页亮色主体和底部交互终端统一使用暖灰浅色、深灰和深红；暗色保留炭黑与红色。
首页身份、介绍和访问入口立即可读，下面的内容保留逐项显示与重播。
RyR 主视觉持续原地跑动并轻摇，终端机器人等待时小跳、输出时踏步；提供暂停，
遵循减少动态效果、强制配色和页面可见性。静态 HTML 包含完整正文，禁用
JavaScript 时仍可阅读和联系。首页与 About 均不显示评论、侧栏、目录或文章工具。

终端保留 `hello`、`help`、`whoami`、`about`、`experience`、`interests`、
`projects`、`open notes`、`blog`、`github`、`contact`、`email`、`copy email`、
`clear`，支持 Tab 补全与命令历史；`hello` 由 RyR 回应，`about` 提供独立
关于页入口。输出约 25 字符/秒，可跳过；不执行任意代码或接入模型服务。
邮箱复制失败时展示可选文本。新增个人成果前应核实真实性。

`npm run test:about` 覆盖首页与独立 About 的双语、明暗模式、响应式、无障碍、
路由和终端交互，也包含在 `npm run test:browser`。保留本地 Doto 与 OFL 许可；
展示字使用方格 SVG，全站中文字体和其他页面排版不改变。

## 本地预览

需要 [Hugo Extended](https://gohugo.io/installation/)（版本见 `go.mod` / CI 配置）。

```powershell
cd my-project-docs
hugo server
```

浏览器打开 <http://localhost:1313/>。

生产构建：

```powershell
hugo --gc --minify
```

## 全站手写字体

全站正文、导航、目录、表格、普通标题及日期等辅助文字统一使用「霞鹜文楷屏幕
阅读版」，通过 jsDelivr 加载固定版本 `lxgw-wenkai-screen-webfont@1.1.0`。
首页主视觉、站点品牌等使用展示字体的艺术字保留原样；代码、终端和图标字体也
保留原样。字体加载失败时回退到系统字体，不影响阅读。

博客文章正文在桌面端使用 `1.25rem`（默认 20px），窄屏使用 `1.125rem`
（默认 18px），行高为字号的 `1.9` 倍。开头引言跟随正文字号与行距，
导航、目录和其他栏目的排版不受此调整影响。

正文无需额外标记。已有的 `.handwritten` 块属性仍可使用，效果与普通正文一致：

```markdown
把学过的知识，慢慢变成自己的东西。
{.handwritten}
```

`.handwritten` 可用于全站文字；其中的代码仍保留等宽字体。样式位于
`assets/scss/_styles_project.scss`，字体加载位于
`layouts/_partials/hooks/head-end.html`。两套部署保持相同规则。

## 双语与评论

中文是默认语言，英文入口为 `/en/`。英文内容使用同目录的 `.en.md` 文件，
翻译约定见 [TRANSLATION.md](TRANSLATION.md)。

博客文章通过 Oink 内置的 Giscus 接入评论，
评论保存在 `RyanYhy/my-project-docs-vercel` 的 `Announcements` Discussions
分类。评论界面随页面语言切换，颜色随站点深浅色设置切换。

本 GitHub Pages 镜像与 Vercel 主站都启用博客文章评论；中英文页面和两个站点
通过 `mapping: specific` 与固定 `data-term=/blog/<slug>/` 共用同一条讨论。
博客列表页通过 `comments: false` 单独关闭评论。

验证评论时在本项目运行
`hugo server --disableFastRender`，打开任意博客文章并滚动到底部查看评论区。
读者使用 GitHub 登录后发表评论；首次发言或回应前尚未创建 Discussion 属于
正常情况。配置中的仓库 ID 和分类 ID 是公开标识；不要填写 GitHub token。

## 部署

推送到 `main` 分支后，GitHub Actions（[`.github/workflows/pages.yml`](.github/workflows/pages.yml)）自动构建并发布到 GitHub Pages。

## 技术栈

- **静态站点**：Hugo Extended
- **主题**：[Oink](https://github.com/pgsty/oink)（Hugo Module，`go.mod` 中 `require github.com/pgsty/oink`）
- **托管**：GitHub Pages

## 许可与署名

| 部分 | 许可 |
| ---- | ---- |
| 站点脚手架与构建工具（衍生自 [oink.pgsty.com](https://github.com/pgsty/oink.pgsty.com)） | [Apache License 2.0](LICENSE) |
| 本站原创文档内容 | [CC BY 4.0](LICENSE-CC-BY-4.0) |

主题由 [Oink](https://oink.pgsty.com) 提供；本站文字与项目文档版权归 [Ryan Yhy](https://github.com/RyanYhy)。
