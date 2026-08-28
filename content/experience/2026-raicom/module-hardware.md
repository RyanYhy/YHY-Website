---
title: 硬件与驱动
linkTitle: 硬件与驱动
description: 实车外设、udev、驱动 ROS 包、EKF 融合与 TF 链。
weight: 30
---

## 硬件清单 {#hardware}

| 设备 | 用途 | udev 节点 |
| ---- | ---- | --------- |
| 麦克纳姆轮底盘 | 全向移动 | `/dev/carserial` |
| Wit IMU | 姿态/角速度 | `/dev/imu` |
| 镭神 N10_P | 2D 激光 | `/dev/lslidar` |
| 云台 + 水弹枪 | 瞄准/开火 | `/dev/gun` |
| USB 摄像头 | 人物/雷区（云台） | `/dev/video*` |
| Orbbec DCW2 | 反坦克 RGB+深度 | USB `2bc5` |

![硬件与驱动](/images/raicom2026/hardware_topology.png)

## 驱动包对照 {#drivers}

| ROS 包 | 节点 | 输出 |
| ------ | ---- | ---- |
| `chassis_driver` | `base_controller.py` | 串口底盘 |
| `imu_driver` | `wit_multi_ros.py` | `/imu` |
| `leishen/lslidar_driver` | 雷达节点 | `/scan` |
| `car_bringup` | `base_node` | `odom_raw` |
| `orbbec_camera` | SDK 驱动 | `/camera/color/*`、`/camera/depth/*` |
| `robot_bringup` | `bringup_robot.launch` | **聚合启动** 上表 + EKF + URDF |

## bringup 启动链 {#bringup}

[`bringup_robot.launch`](https://github.com/RyanYhy/raicom2026/blob/main/src/robot_bringup/launch/bringup_robot.launch)：

```
lslidar → imu → base_controller → odom_raw → EKF → /odom
       → static TF → robot_state_publisher
```

主 launch 通过 `<include>` 引入。

## EKF 融合 {#ekf}

| 项 | 说明 |
| -- | ---- |
| 节点 | `robot_localization` / `ekf_localization_node` |
| 输入 | `odom_raw` + `/imu` |
| 输出 | `/odom` |

参数：[`robot_localization.yaml`](https://github.com/RyanYhy/raicom2026/blob/main/src/robot_navigation/param/robot_localization.yaml)

## URDF 与 TF {#tf}

```
map → odom → base_footprint → base_link → laser_link
                           → camera_link → camera_color_optical_frame
```

webcam 装在云台上，**无独立 TF**，识别用舵机角。

## 云台串口 {#gimbal-serial}

`/dev/gun` **只能单进程打开**，由 [`gimbal_server.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/gimbal_server.py) 独占。
