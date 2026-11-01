---
title: 导航
linkTitle: 导航
description: "地图、AMCL、`move_base`，以及 `community_nav` 里的参数文件。"
weight: 40
---

导航整包由 `roslaunch community_nav nav_multi.launch` 拉起。定位是 AMCL，不是 Cartographer。

## 核心组件 {#components}

| 组件 | 作用 | 位置 |
| ---- | ---- | ---- |
| `map_server` | 发布 `/map` | `maps/multi_map.yaml`、`multi_map.pgm` |
| AMCL | `map → odom` | `move_base_multi.launch` |
| `move_base` | 全局规划 + DWA | 同 launch，参数在 `param/` |
| EKF | `/odom` | `bringup_robot.launch` |

地图分辨率 0.05 m，原点 `[-5, -5, 0]`。换地图后要重测 `main_nav.py` 里的航点，航点是写死在脚本里的，不读 yaml。

## 参数文件 {#params}

都在 `community_nav/param/`：

| 文件 | 内容 |
| ---- | ---- |
| `costmap_common_params.yaml` | 全局、局部代价地图都会加载 |
| `global_costmap_params.yaml` | 全局代价地图 |
| `local_costmap_params.yaml` | 局部代价地图 |
| `global_planner_params.yaml` | 全局规划器 |
| `dwa_local_planner_params.yaml` | DWA |
| `move_base_params.yaml` | `move_base` 自身 |
| `robot_localization.yaml` | EKF，由 bringup 加载 |

`move_base_multi.launch` 里 AMCL 的 `odom_model_type` 默认是 `omni`。

## 速度 {#cmd-vel}

平时速度来自 `move_base`。到电动车移动追踪点（点 32）后，`main_nav.py` 停在那里等结果，`yolo_onnx.py` 直接往 `/cmd_vel` 发速度，走完再把零速度发出去，然后任务节点继续后面的航点。

RViz 配置是 `rviz/nav_riz.rviz`。`use_rviz:=false` 可以关掉。

## 建图 {#mapping}

比赛 launch 加载的是已经建好的 `multi_map`。重新建图用 `launch/gmapping_multi.launch`，不在三步启动流程里。建完图后把 `maps/multi_map.yaml` 和 `multi_map.pgm` 换掉，再核对航点。
