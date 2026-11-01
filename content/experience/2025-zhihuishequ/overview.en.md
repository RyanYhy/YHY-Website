---
title: Overview
linkTitle: Overview
description: Smart Community event of the Global AI Algorithm Elite Competition — mission, three packages, data flow, and startup order.
weight: 10
---

National second prize, 2025, in the Smart Community event of the Global AI Algorithm Elite Competition. The robot cruises the community, runs recognition at set stops, and speaks the results. Localization is AMCL, planning is `move_base`, and vision is a separate ONNX node.

- **Platform**: ROS Noetic · Ubuntu 20.04 · catkin workspace
- **Code**: `community_nav`, `community_vision`, `community_mission`

## What the system does {#mission}

The match is three pipelines:

1. **Navigation** — `main_nav.py` follows waypoints written into the script (`move_base` + AMCL)
1. **Perception** — at a task stop, a topic asks the vision node to run once
1. **Speech** — zone totals and some detection results are spoken with `espeak`
{.steps}

This stack does not use the later RAICOM prep/go scripts, and it does not write a report file. A match is three terminals, started in order.

## Three packages {#packages}

| Package | Role | What starts it |
| ---- | ---- | ---- |
| `community_nav` | Map, chassis, IMU, lidar, EKF, AMCL, `move_base`, Orbbec camera | `roslaunch community_nav nav_multi.launch` |
| `community_vision` | Subscribe to the camera and switch detection tasks by topic | `python yolo_onnx.py` (conda `paddle_env`) |
| `community_mission` | Waypoints and the task at each stop | `python main_nav.py` (system Python) |

`orbbec_camera`, `lslidar_driver`, and `car_bringup` are not in these three packages. They already lived in the robot workspace.

![Software architecture](/images/zhihuishequ/arch_layers.svg)
{caption="Six layers from hardware up to the match tasks"}

## Data flow {#dataflow}

![Data flow](/images/zhihuishequ/dataflow.svg)
{caption="IMU and wheel odometry enter the EKF. Lidar enters AMCL. The camera goes only to the vision node."}

**Sensors → fusion → localization → planning → chassis**

- Lidar `/scan`, IMU, and `odom_raw` pass through the EKF to produce `/odom`
- AMCL localizes with `/scan` and the map, and publishes `map → odom`
- `move_base` sends velocity to the chassis

**Task triggers** are topics, not services. `main_nav.py` publishes `/traffic`, `/person_detect`, and the other commands. `yolo_onnx.py` answers on the matching status topic. During e-bike tracking, the vision node publishes `/cmd_vel` directly.

## Camera {#camera}

Every vision task uses the color image from an Orbbec Dabai DCW2, topic `/camera/color/image_raw`. `nav_multi.launch` includes `dabai_dcw2.launch` from `orbbec_camera`. The monocular `usb_cam` include in that launch is commented out.

## Startup order {#startup}

| Order | Terminal | Command |
| ---- | ---- | ---- |
| 1 | System Python | `roslaunch community_nav nav_multi.launch` |
| 2 | conda `paddle_env` | `python yolo_onnx.py` |
| 3 | System Python | `python main_nav.py` |

Wait until step 1 is publishing camera images and step 2 logs that the multi-task detector is ready, then run step 3. Details are in [Usage](../usage/).

## What the mission node waits for {#nav-state}

After `main_nav.py` connects to `move_base`, it walks the waypoints. A plain stop pauses for 0.5 seconds. A task stop blocks until the vision node replies, then the next waypoint starts. A traffic light blocks until the light is recognized as green. When the waypoint list ends, the mission ends.
