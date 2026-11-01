---
title: Navigation
linkTitle: Navigation
description: Map, AMCL, move_base, and the parameter files in community_nav.
weight: 40
---

`roslaunch community_nav nav_multi.launch` starts the whole navigation stack. Localization is AMCL, not Cartographer.

## Core pieces {#components}

| Piece | Role | Location |
| ---- | ---- | ---- |
| `map_server` | Publishes `/map` | `maps/multi_map.yaml`, `multi_map.pgm` |
| AMCL | `map → odom` | `move_base_multi.launch` |
| `move_base` | Global planner plus DWA | Same launch; parameters in `param/` |
| EKF | `/odom` | `bringup_robot.launch` |

Map resolution is 0.05 m and the origin is `[-5, -5, 0]`. After replacing the map, remeasure the waypoints in `main_nav.py`. They are written into the script and are not loaded from yaml.

## Parameter files {#params}

All of them are in `community_nav/param/`:

| File | Contents |
| ---- | ---- |
| `costmap_common_params.yaml` | Loaded for both global and local costmaps |
| `global_costmap_params.yaml` | Global costmap |
| `local_costmap_params.yaml` | Local costmap |
| `global_planner_params.yaml` | Global planner |
| `dwa_local_planner_params.yaml` | DWA |
| `move_base_params.yaml` | `move_base` itself |
| `robot_localization.yaml` | EKF, loaded by bringup |

In `move_base_multi.launch`, AMCL `odom_model_type` defaults to `omni`.

## Velocity {#cmd-vel}

Most of the time velocity comes from `move_base`. At the e-bike tracking stop (waypoint 32), `main_nav.py` waits there. `yolo_onnx.py` publishes `/cmd_vel` directly, then publishes a zero twist, and the mission node continues with the later waypoints.

The RViz config is `rviz/nav_riz.rviz`. `use_rviz:=false` turns it off.

## Mapping {#mapping}

The match launch loads the existing `multi_map`. To rebuild it, use `launch/gmapping_multi.launch`. That launch is not part of the three-step start. After mapping, replace `maps/multi_map.yaml` and `multi_map.pgm`, then check the waypoints again.
