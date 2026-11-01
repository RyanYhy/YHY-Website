---
title: 2025 智慧社区
linkTitle: 2025 智慧社区
description: ROS 导航、多任务视觉与比赛任务编排；三个功能包的使用说明和模块讲解。
date: 2025-12-20
weight: 20
type: docs
icon: fa-solid fa-city
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

全球人工智能算法精英大赛「智慧社区」赛项的整车 ROS 软件文档，2025 年全国二等奖。代码分成三个功能包：`community_nav`、`community_vision`、`community_mission`。

> [!NOTE] 阅读顺序
> 建议按侧栏或右侧目录顺序阅读：概述 → 使用说明 → 各功能模块 → 总结 → 附录速查表。

## 概述 {#overview}

小车要完成的任务、三个功能包怎么分工、数据怎么走。

→ [阅读概述](overview/)

## 使用说明 {#usage}

环境、依赖、编译，以及比赛时开的三个终端。

→ [阅读使用说明](usage/)

## 硬件与驱动 {#module-hardware}

底盘、IMU、雷达、奥比相机，以及 `nav_multi.launch` 拉起的驱动链。

→ [阅读硬件与驱动](module-hardware/)

## 导航 {#module-navigation}

地图、AMCL、`move_base` 和参数文件位置。

→ [阅读导航](module-navigation/)

## 视觉 {#module-vision}

红绿灯、人偶、火焰、车牌、垃圾桶、电动车，以及各自的模型。

→ [阅读视觉](module-vision/)

## 比赛任务 {#module-mission}

`main_nav.py` 的航点、到点触发的任务，以及和视觉节点的话题。

→ [阅读比赛任务](module-mission/)

## 总结 {#summary}

三个包怎么配合，改航点或改模型时先看哪里。

→ [阅读总结](summary/)

## 附录 {#appendix}

「功能 → 文件」速查，以及比赛三步启动用不到的脚本。

→ [阅读附录](appendix/)
