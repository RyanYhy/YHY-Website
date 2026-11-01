---
title: 总结
linkTitle: 总结
description: 三个功能包怎么配合，以及改航点、改模型和改导航时先看哪里。
weight: 70
---

## 模块依赖 {#deps}

分层和数据流见 [概述](../overview/)。启动顺序不能反：先有 `move_base` 和相机，再加载模型，最后才发航点。视觉节点晚于任务节点启动时，任务会在第一个红绿灯一直等。

## 改哪里 {#dev-tips}

| 目标 | 改这里 |
| ---- | ---- |
| 航点、朝向、哪个点做什么任务 | `community_mission/main_nav.py` 里的 `points` 和各类 `*_indices` |
| 换检测模型或阈值 | `community_vision/yolo_onnx.py`，模型文件仍放在该脚本同目录 |
| 代价地图、DWA、AMCL | `community_nav/param/`、`launch/move_base_multi.launch` |
| 串口、雷达屏蔽角、TF | `community_nav/launch/` |
| 换比赛地图 | `community_nav/maps/multi_map.yaml` 和 `.pgm`，然后重测航点 |

> [!TIP] 两个 Python 不要混在同一个环境
> `yolo_onnx.py` 依赖 conda 里的 ONNX 和 ultralytics。`main_nav.py` 用系统里的 `rospy`。视觉终端要 `conda activate paddle_env` 之后再 source ROS。

## 关键入口 {#entry}

| 用途 | 路径 |
| ---- | ---- |
| 导航 launch | `src/community_nav/launch/nav_multi.launch` |
| 视觉节点 | `src/community_vision/yolo_onnx.py` |
| 任务节点 | `src/community_mission/main_nav.py` |
| 模型 | `src/community_vision/*.onnx` |
| conda 环境 | 工作空间根目录 `environment.yml` |

文件级对照见 [附录](../appendix/)。
