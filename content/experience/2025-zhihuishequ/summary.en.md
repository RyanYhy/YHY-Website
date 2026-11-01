---
title: Summary
linkTitle: Summary
description: How the three packages fit together, and where to edit waypoints, models, or navigation.
weight: 70
---

## Dependencies {#deps}

Layers and data flow are in the [overview](../overview/). The start order cannot be reversed: `move_base` and the camera first, then the models, and only then the waypoints. If the vision node starts after the mission node, the mission waits forever at the first traffic light.

## Where to change things {#dev-tips}

| Goal | Edit |
| ---- | ---- |
| Waypoints, headings, or which stop runs which task | `points` and the `*_indices` lists in `community_mission/main_nav.py` |
| A detection model or a threshold | `community_vision/yolo_onnx.py`. Keep the model file beside that script |
| Costmaps, DWA, or AMCL | `community_nav/param/` and `launch/move_base_multi.launch` |
| Serial ports, the lidar mask, or TF | `community_nav/launch/` |
| The match map | `community_nav/maps/multi_map.yaml` and `.pgm`, then remeasure waypoints |

> [!TIP] Do not mix the two Pythons
> `yolo_onnx.py` needs ONNX and ultralytics from conda. `main_nav.py` needs system `rospy`. On the vision terminal, `conda activate paddle_env` and then source ROS.

## Entry points {#entry}

| Use | Path |
| ---- | ---- |
| Navigation launch | `src/community_nav/launch/nav_multi.launch` |
| Vision node | `src/community_vision/yolo_onnx.py` |
| Mission node | `src/community_mission/main_nav.py` |
| Models | `src/community_vision/*.onnx` |
| Conda environment | `environment.yml` at the workspace root |

The file index is in the [appendix](../appendix/).
