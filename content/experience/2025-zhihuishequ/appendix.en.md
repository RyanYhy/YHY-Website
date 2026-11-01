---
title: Appendix
linkTitle: Appendix
description: A function-to-file index, and scripts that stay in the package but are not part of the three-step start.
weight: 80
---

## Function to file {#cheatsheet}

| To change or inspect | Path (from the workspace) |
| ---- | ---- |
| Full vehicle start | `src/community_nav/launch/nav_multi.launch` |
| Chassis, IMU, EKF, URDF | `src/community_nav/launch/bringup_robot.launch` |
| AMCL and move_base | `src/community_nav/launch/move_base_multi.launch` |
| Lidar port and angle mask | `src/community_nav/launch/lslidar_serial_multi.launch` |
| Costmaps and DWA | `src/community_nav/param/` |
| Map | `src/community_nav/maps/multi_map.yaml` |
| Waypoints and task stops | `src/community_mission/main_nav.py` |
| Detection and speech details | `src/community_vision/yolo_onnx.py` |
| ONNX | The six files next to the script in `src/community_vision/` |
| Run snapshots and tracking video | `src/community_vision/ro_test_img/` (created at runtime) |

## Files the three-step start does not launch {#unused}

These remain in `community_nav` for mapping or collecting points. `nav_multi.launch` does not start them.

| File | Notes |
| ---- | ---- |
| `launch/gmapping_multi.launch` | gmapping |
| `launch/usb_cam-test.launch` | Monocular camera. Commented out of the main navigation launch |
| `scripts/joy_bringup.py`, `joy_bringup_ros.py`, `joy_bringup_ros_yolo.py`, `joy_ros_tf.py` | Joystick waypoint capture and photos |
| `scripts/uwb_to_pose.py`, `param/robot_localization_uwb.yaml` | UWB. Not loaded by the current bringup |

`joy_bringup_ros.py` and `joy_ros_tf.py` still save to absolute paths from the old machine.

## Topics {#topics}

| Name | Notes |
| ---- | ---- |
| `/cmd_vel` | To the chassis. The vision node publishes it while tracking an e-bike |
| `/scan` | Leishen lidar |
| `/odom` | EKF output |
| `/camera/color/image_raw` | Orbbec color image. The only vision input |
| `/move_base` | Action client used by the mission node |
| `/traffic`, `/traffic_light_status` | Traffic light |
| `/person_detect`, `/person_detect_status` | Dolls |
| `/fire_detect`, `/fire_detect_status` | Building and fire |
| `/plate_detect`, `/plate_detect_status` | License plate |
| `/trash_bin_detect`, `/trash_bin_status` | Trash bins |
| `/bicycle_detect`, `/bicycle_detect_status` | E-bike tracking |
| `/bicycle_snapshot`, `/bicycle_snapshot_status` | Single-frame e-bike snapshot |
