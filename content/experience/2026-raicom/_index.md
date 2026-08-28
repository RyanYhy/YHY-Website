---
title: 2026 RAICOM 智能侦察
linkTitle: 2026 RAICOM
description: ROS 整车软件架构、使用说明与按功能划分的模块讲解；配合 GitHub 仓库 raicom2026 阅读。
date: 2026-08-27
weight: 10
type: docs
icon: fa-solid fa-trophy
sidebar_root_for: self
sidebar_root_link_self: true
sidebar_expanded: true
navbar_autohide: false
cascade:
  type: docs
  navbar_autohide: false
  footer_style: slim
  comments: false
  feedback: false
  reading_time: false
  share: [copy]
  search_boost: 1.0
  build:
    list: local
    render: always
    publishResources: true
---

全国大学生机器人大赛（RAICOM）「智能侦察」赛项的整车 ROS 软件文档。源码仓库：[RyanYhy/raicom2026](https://github.com/RyanYhy/raicom2026)。

> [!NOTE] 阅读顺序
> 建议按侧栏或右侧目录顺序阅读：概述 → 使用说明 → 各功能模块 → 总结 → 附录速查表。

## 概述 {#overview}

分层架构、数据流、prep/go、运行时状态。

→ [阅读概述](overview/)

## 使用说明 {#usage}

环境、三 workspace、conda、编译与两段式启动。

→ [阅读使用说明](usage/)

## 硬件与驱动 {#module-hardware}

外设清单、udev、驱动 ROS 包、EKF 融合与 TF 链。

→ [阅读硬件与驱动](module-hardware/)

## 建图 {#module-mapping}

比赛地图 `map2.yaml` / `map2.pbstream` 与 Cartographer 工具链。

→ [阅读建图](module-mapping/)

## 定位 {#module-localization}

Cartographer 纯定位与 AMCL、`loc_mode` 切换。

→ [阅读定位](module-localization/)

## 导航 {#module-navigation}

`move_base`、costmap、反坦克点云与 cmd_vel 速度链路。

→ [阅读导航](module-navigation/)

## 比赛任务 {#module-tasks}

人物识别/打靶、雷区计数、反坦克避障与 6 行报告。

→ [阅读比赛任务](module-tasks/)

## 总结 {#summary}

模块依赖、二次开发建议与关键入口。

→ [阅读总结](summary/)

## 附录 {#appendix}

未完成功能声明与「功能 → 文件」速查表。

→ [阅读附录](appendix/)
