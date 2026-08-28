# YHY Study Website

个人学习与项目文档站，基于 [Hugo Extended](https://gohugo.io/) 与 [Oink](https://oink.pgsty.com) 主题构建。

- **线上地址**：<https://ryanyhy.github.io/YHY-Website/>
- **源码仓库**：[RyanYhy/YHY-Website](https://github.com/RyanYhy/YHY-Website)

## 内容栏目

| 栏目 | 说明 |
| ---- | ---- |
| [经历](content/experience/) | 项目与竞赛文档，含 [2026 RAICOM 智能侦察](content/experience/2026-raicom/) |
| [学习](content/learn/) | 学习笔记 |
| [博客](content/blog/) | 随笔与更新 |
| [友链](content/links.md) | 推荐站点 |

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
