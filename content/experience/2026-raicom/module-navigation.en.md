---
title: Navigation
linkTitle: Navigation
description: move_base, costmaps, the anti-tank point cloud, and the cmd_vel chain.
weight: 60
---

## Core pieces {#components}

| Piece | Role |
| ---- | ---- |
| `map_server` | Publishes `/map` |
| `move_base` | Global planner plus DWA local planner |
| `robot_navigation/param/` | Costmap and DWA parameters |
| `visual_layer_params.yaml` | Local costmap subscribes to `/visual_mine/obstacles` |

The main launch **owns** `move_base` (`clear_params=true`) and loads the visual-layer parameters last.

## Costmaps {#costmap}

| Layer | observation_sources | Notes |
| -- | ---- | ---- |
| global | empty (static map only) | Avoid marking obstacles from localization drift |
| local | `scan` + `visual_mine` | Lidar plus the anti-tank cloud |

[`orbbec_mine_antitank.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/orbbec_mine_antitank.py) publishes the anti-tank cloud once at P21 (map frame, republished every 0.5 s).

> [!NOTE]
> `visual_mine_avoidance.py` does start during prep, but `enable_at=false`, so it **does not publish** the match cloud.

## cmd_vel chain {#cmd-vel}

![cmd_vel chain](/images/raicom2026/cmd_vel_chain.png)

```
move_base → /move_base/cmd_vel → cmd_vel_merge → /cmd_vel → base_controller
```

[`cmd_vel_merge.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/cmd_vel_merge.py) currently has `enable_line_follow=false` and **only forwards** velocity.

## nav and move_base {#nav-mb}

- Waypoints: [`nav_competition.yaml`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/param/nav_competition.yaml)
- Goals go out through actionlib as `MoveBaseGoal`. A failed stop is skipped and the report is filled with 0.
- At a task stop the robot **aligns its heading** before vision runs.
