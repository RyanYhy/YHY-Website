---
title: Hardware and drivers
linkTitle: Hardware and drivers
description: On-robot devices, udev, driver packages, EKF fusion, and the TF tree.
weight: 30
---

## Hardware {#hardware}

| Device | Role | udev node |
| ---- | ---- | ---- |
| Mecanum chassis | Omnidirectional motion | `/dev/carserial` |
| Wit IMU | Attitude and angular rate | `/dev/imu` |
| Leishen N10_P | 2D lidar | `/dev/lslidar` |
| Gimbal and water-pellet gun | Aim and fire | `/dev/gun` |
| USB camera | People and mines (on the gimbal) | `/dev/video*` |
| Orbbec DCW2 | Anti-tank RGB and depth | USB `2bc5` |

![Hardware and drivers](/images/raicom2026/hardware_topology.png)

## Driver packages {#drivers}

| ROS package | Node | Output |
| ---- | ---- | ---- |
| `chassis_driver` | `base_controller.py` | Serial chassis |
| `imu_driver` | `wit_multi_ros.py` | `/imu` |
| `leishen/lslidar_driver` | Lidar node | `/scan` |
| `car_bringup` | `base_node` | `odom_raw` |
| `orbbec_camera` | SDK driver | `/camera/color/*`, `/camera/depth/*` |
| `robot_bringup` | `bringup_robot.launch` | **Brings up** the rows above, plus EKF and URDF |

## Bringup chain {#bringup}

[`bringup_robot.launch`](https://github.com/RyanYhy/raicom2026/blob/main/src/robot_bringup/launch/bringup_robot.launch):

```
lslidar → imu → base_controller → odom_raw → EKF → /odom
       → static TF → robot_state_publisher
```

The main launch pulls this in with `<include>`.

## EKF {#ekf}

| Item | Notes |
| -- | ---- |
| Node | `robot_localization` / `ekf_localization_node` |
| Input | `odom_raw` + `/imu` |
| Output | `/odom` |

Parameters: [`robot_localization.yaml`](https://github.com/RyanYhy/raicom2026/blob/main/src/robot_navigation/param/robot_localization.yaml)

## URDF and TF {#tf}

```
map → odom → base_footprint → base_link → laser_link
                           → camera_link → camera_color_optical_frame
```

The webcam sits on the gimbal and has **no TF frame of its own**. Detection uses the servo angles.

## Gimbal serial port {#gimbal-serial}

`/dev/gun` can be opened by **only one process**. [`gimbal_server.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/gimbal_server.py) owns it.
