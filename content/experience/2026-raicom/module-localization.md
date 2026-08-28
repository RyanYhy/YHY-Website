---
title: 定位
linkTitle: 定位
description: AMCL 与 Cartographer 纯定位、辅助节点与 nav 衔接。
weight: 50
---

[`nav_competition_2026.launch`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/launch/nav_competition_2026.launch) 通过 `loc_mode` 切换：

| 模式 | 参数 | 说明 |
| ---- | ---- | ---- |
| **Cartographer** | `loc_mode:=cartographer`（**比赛默认**） | 加载 `map2.pbstream` |
| **AMCL** | `loc_mode:=amcl` | 粒子滤波 + 静态地图 |

![定位模式](/images/raicom2026/localization_modes.png)

prep 固定：

```bash
roslaunch raicom2026 nav_competition_2026.launch start_nav:=false loc_mode:=cartographer
```

## Cartographer 辅助节点 {#carto-nodes}

| 节点 | 作用 |
| ---- | ---- |
| `odom_cleaner.py` | 清洗 `/odom` 时间戳 |
| `carto_init.py` | 注入起点位姿 |
| `carto_relocalize.py` | RViz 2D Pose Estimate 手动重定位 |

配置：[`config/cartographer/localization.lua`](https://github.com/RyanYhy/raicom2026/tree/main/src/raicom2026/config/cartographer)

## 与 nav_competition 衔接 {#nav-boot}

`nav_competition.py` 启动：

1. 等待 `/map`
1. 连接 `move_base`
1. 发布初始位姿
1. 等待约 3s 收敛
1. 按 `course` 巡航
{.steps}

Cartographer 模式下反坦克还用 `/tracked_pose` 做 map 坐标转换。
