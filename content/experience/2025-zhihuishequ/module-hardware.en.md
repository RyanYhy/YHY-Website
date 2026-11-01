---
title: Hardware and drivers
linkTitle: Hardware and drivers
description: Chassis, IMU, Leishen lidar, Orbbec camera, and the driver chain started by nav_multi.
weight: 30
---

## Hardware {#hardware}

| Device | Role | Node |
| ---- | ---- | ---- |
| Chassis | Motion | `/dev/carserial`, 115200 |
| Wit IMU | Attitude | `/dev/imu`, 9600 |
| Leishen N10_P | 2D lidar `/scan` | `/dev/lslidar` |
| Orbbec Dabai DCW2 | Color image for every vision task | `/camera/color/image_raw` |

The body model is `community_nav/urdf/mowen.urdf.xacro`. The mesh is `meshes/base_link.STL`.

## In this package, and outside it {#drivers}

Nodes that `community_nav` starts itself:

| Node | Role |
| ---- | ---- |
| `wit_multi_ros.py` | IMU, publishes `/imu` |
| `base_controller.py` | Chassis serial port |
| `robot_state_publisher` | TF from the URDF |
| `ekf_localization_node` | `odom_raw` + `/imu` → `/odom` |

Three other packages are included from launch files. Their source is not in `community_nav`:

| ROS package | Role |
| ---- | ---- |
| `lslidar_driver` | Lidar, `lslidar_serial_multi.launch` |
| `car_bringup` | `base_node` turns wheel speed into `odom_raw` |
| `orbbec_camera` | `dabai_dcw2.launch` |

## Bringup chain {#bringup}

`nav_multi.launch` starts `map_server` first, includes `bringup_robot.launch` and `move_base_multi.launch`, then includes the Orbbec camera.

Order inside `bringup_robot.launch`:

```
lslidar → imu → base_controller → car_bringup/base_node
       → static TF → robot_state_publisher → EKF
```

Static TF:

| Transform | Notes |
| ---- | ---- |
| `base_footprint` → `laser_link` | `0.1 0 0.05`, yaw of π |
| `base_footprint` → `base_link` | Identity transform, for the IMU |

EKF parameters are `param/robot_localization.yaml`. Inputs are remapped to `odom_raw` and `imu`. The output is remapped to `odom`. `odom_frame` and `world_frame` are both `odom`. `base_link_frame` is `base_footprint`.

## Lidar angle mask {#lidar}

In `lslidar_serial_multi.launch`, `truncated_mode` is 1 and the masked sector is about 90° to 270°. Change that launch when the lidar mask changes. Do not change the vision script.
