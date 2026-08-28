---
title: 导航
linkTitle: 导航
description: move_base、costmap、反坦克点云与 cmd_vel 速度链路。
weight: 60
---

## 核心组件 {#components}

| 组件 | 作用 |
| ---- | ---- |
| `map_server` | 发布 `/map` |
| `move_base` | 全局 + DWA 局部规划 |
| `robot_navigation/param/` | costmap、DWA 参数 |
| `visual_layer_params.yaml` | local costmap 订阅 `/visual_mine/obstacles` |

主 launch **自持** `move_base`（`clear_params=true`），最后加载 visual 层参数。

## costmap 设计 {#costmap}

| 层 | observation_sources | 说明 |
| -- | ------------------- | ---- |
| global | 空（仅静态地图） | 防定位漂移误标障碍 |
| local | `scan` + `visual_mine` | 激光 + 反坦克点云 |

反坦克点云由 [`orbbec_mine_antitank.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/orbbec_mine_antitank.py) 在 P21 一次性识别后发布（map 帧，0.5s 重发）。

> [!NOTE]
> `visual_mine_avoidance.py` 在 prep 会起，但 `enable_at=false`，**不发布**比赛用点云。

## cmd_vel 速度链路 {#cmd-vel}

![cmd_vel 链路](/images/raicom2026/cmd_vel_chain.png)

```
move_base → /move_base/cmd_vel → cmd_vel_merge → /cmd_vel → base_controller
```

[`cmd_vel_merge.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/cmd_vel_merge.py) 当前 `enable_line_follow=false`，**仅透传**。

## nav 与 move_base {#nav-mb}

- 航点：[`nav_competition.yaml`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/param/nav_competition.yaml)
- actionlib 发 `MoveBaseGoal`；失败跳过该站（报告补 0）
- 任务点到达后 **朝向对齐** 再触发视觉
