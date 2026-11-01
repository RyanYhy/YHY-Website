---
title: 附录
linkTitle: 附录
description: 功能到文件的速查，以及三步启动用不到、但包里还留着的脚本。
weight: 80
---

## 功能 → 文件速查 {#cheatsheet}

| 想改 / 想查 | 路径（相对工作空间） |
| ----------- | ---- |
| 整车启动 | `src/community_nav/launch/nav_multi.launch` |
| 底盘 / IMU / EKF / URDF | `src/community_nav/launch/bringup_robot.launch` |
| AMCL 与 move_base | `src/community_nav/launch/move_base_multi.launch` |
| 雷达串口与屏蔽角 | `src/community_nav/launch/lslidar_serial_multi.launch` |
| 代价地图与 DWA | `src/community_nav/param/` |
| 地图 | `src/community_nav/maps/multi_map.yaml` |
| 航点与任务点 | `src/community_mission/main_nav.py` |
| 检测与播报细节 | `src/community_vision/yolo_onnx.py` |
| ONNX | `src/community_vision/` 下与脚本同级的六个文件 |
| 运行截图 / 追踪视频 | `src/community_vision/ro_test_img/`（运行时生成） |

## 三步启动用不到的文件 {#unused}

这些还在 `community_nav` 里，给建图或采点用。`nav_multi.launch` 不会起它们。

| 文件 | 说明 |
| ---- | ---- |
| `launch/gmapping_multi.launch` | gmapping 建图 |
| `launch/usb_cam-test.launch` | 单目相机，主导航里已注释 |
| `scripts/joy_bringup.py`、`joy_bringup_ros.py`、`joy_bringup_ros_yolo.py`、`joy_ros_tf.py` | 手柄采点、拍照 |
| `scripts/uwb_to_pose.py`、`param/robot_localization_uwb.yaml` | UWB，当前 bringup 未加载 |

`joy_bringup_ros.py` 和 `joy_ros_tf.py` 里的保存路径仍是旧机器上的绝对路径。

## 常用话题 {#topics}

| 名称 | 说明 |
| ---- | ---- |
| `/cmd_vel` | 到底盘；追踪电动车时由视觉节点发布 |
| `/scan` | 镭神雷达 |
| `/odom` | EKF 输出 |
| `/camera/color/image_raw` | 奥比彩色图，视觉唯一输入 |
| `/move_base` | 任务节点的 Action 客户端 |
| `/traffic`、`/traffic_light_status` | 红绿灯 |
| `/person_detect`、`/person_detect_status` | 人偶 |
| `/fire_detect`、`/fire_detect_status` | 楼宇与火焰 |
| `/plate_detect`、`/plate_detect_status` | 车牌 |
| `/trash_bin_detect`、`/trash_bin_status` | 垃圾桶 |
| `/bicycle_detect`、`/bicycle_detect_status` | 电动车追踪 |
| `/bicycle_snapshot`、`/bicycle_snapshot_status` | 电动车单帧快照 |
