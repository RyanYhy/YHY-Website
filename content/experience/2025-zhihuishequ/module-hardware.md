---
title: 硬件与驱动
linkTitle: 硬件与驱动
description: 底盘、IMU、镭神雷达、奥比相机，以及 nav_multi 拉起的驱动链。
weight: 30
---

## 硬件清单 {#hardware}

| 设备 | 用途 | 节点 |
| ---- | ---- | ---- |
| 底盘 | 移动 | `/dev/carserial`，115200 |
| Wit IMU | 姿态 | `/dev/imu`，9600 |
| 镭神 N10_P | 2D 激光 `/scan` | `/dev/lslidar` |
| 奥比 Dabai DCW2 | 全部视觉任务的彩色图 | `/camera/color/image_raw` |

车体模型在 `community_nav/urdf/mowen.urdf.xacro`，网格是 `meshes/base_link.STL`。

## 谁在本包里，谁不在 {#drivers}

`community_nav` 自己启动的节点：

| 节点 | 作用 |
| ---- | ---- |
| `wit_multi_ros.py` | IMU，发布 `/imu` |
| `base_controller.py` | 底盘串口 |
| `robot_state_publisher` | 根据 URDF 发 TF |
| `ekf_localization_node` | `odom_raw` + `/imu` → `/odom` |

另外三个包由 launch include 进来，源码不在 `community_nav` 里：

| ROS 包 | 作用 |
| ------ | ---- |
| `lslidar_driver` | 雷达，`lslidar_serial_multi.launch` |
| `car_bringup` | `base_node` 把轮速换成 `odom_raw` |
| `orbbec_camera` | `dabai_dcw2.launch` |

## bringup 启动链 {#bringup}

`nav_multi.launch` 先起 `map_server`，再 include `bringup_robot.launch` 和 `move_base_multi.launch`，最后 include 奥比相机。

`bringup_robot.launch` 里的顺序：

```
lslidar → imu → base_controller → car_bringup/base_node
       → static TF → robot_state_publisher → EKF
```

静态 TF：

| 变换 | 备注 |
| ---- | ---- |
| `base_footprint` → `laser_link` | `0.1 0 0.05`，绕 Z 轴 π |
| `base_footprint` → `base_link` | 单位变换，给 IMU 用 |

EKF 配置是 `param/robot_localization.yaml`。输入重映射到 `odom_raw` 和 `imu`，输出重映射到 `odom`。`odom_frame`、`world_frame` 都是 `odom`，`base_link_frame` 是 `base_footprint`。

## 雷达角度屏蔽 {#lidar}

`lslidar_serial_multi.launch` 里 `truncated_mode` 为 1，屏蔽角大约是 90° 到 270°。改雷达遮挡时改这个 launch，不要改视觉脚本。
