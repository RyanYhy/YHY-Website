---
title: Usage
linkTitle: Usage
description: Environment, build, udev, the prep/go start sequence, and syncing the PC with the robot.
weight: 20
---

The default workspace is `~/1raicom_ws` (same layout as [raicom2026](https://github.com/RyanYhy/raicom2026)).

## Requirements {#requirements}

| Component | Notes |
| ---- | ---- |
| OS | Ubuntu 18.04 |
| ROS | Melodic |
| This repository | `1raicom_ws` (catkin root) |
| `~/cartographer_ws` | Cartographer localization (**not in this repository**) |
| `~/cv_bridge_ws` | Python 3 cv_bridge for the YOLO node |
| Conda `yolov8` | ONNX inference |

![Environment overlay](/images/raicom2026/env_overlay.png)
{caption="Overlay order in setup_env.sh"}

### One environment entry {#setup-env}

In every new terminal:

```bash
source ~/1raicom_ws/scripts/setup_env.sh
```

[`setup_env.sh`](https://github.com/RyanYhy/raicom2026/blob/main/scripts/setup_env.sh) overlays ROS, then cartographer, then 1raicom_ws, then cv_bridge, and forces `1raicom_ws` to the front of `ROS_PACKAGE_PATH`.

## Build {#build}

```bash
cd ~/1raicom_ws
source /opt/ros/melodic/setup.bash
catkin_make
```

> [!TIP] First parallel build of lslidar
> If it fails, run `catkin_make` **once more**.

## Devices and udev {#udev}

Rules live in [`config/udev/`](https://github.com/RyanYhy/raicom2026/tree/main/config/udev):

| Device | Node |
| ---- | ---- |
| Chassis | `/dev/carserial` |
| IMU | `/dev/imu` |
| Lidar | `/dev/lslidar` |
| Gimbal gun | `/dev/gun` |
| Webcam | `/dev/video*` |
| Orbbec | USB `2bc5` |

```bash
bash ~/1raicom_ws/scripts/check_devices.sh
```

## Match start (two stages) {#match-start}

![prep and go](/images/raicom2026/prep_go_sequence.png)

### prep {#prep}

```bash
source ~/1raicom_ws/scripts/setup_env.sh
bash ~/1raicom_ws/scripts/start_match_prep.sh
```

- Background `nav_competition_2026.launch` (`start_nav:=false`, `loc_mode:=cartographer`)
- The script exits after `person_detect_service` is ready. **The prep process keeps running.**
- Log: `/tmp/prep.log`

### go {#go}

```bash
bash ~/1raicom_ws/scripts/start_match_go.sh
```

- Clears `src/raicom2026/data/reports/`
- Starts only `match_go.launch` → `nav_competition.py`

### Clean up {#clean}

```bash
bash ~/1raicom_ws/scripts/clean_ros.sh
```

## Maps and models {#assets}

| Asset | Path |
| ---- | ---- |
| Match map | `src/raicom2026/data/maps/map2.yaml` |
| pbstream | `src/raicom2026/data/maps/map2.pbstream` |
| ONNX | `data/models/person.onnx`, `mine.onnx`, `antitank.onnx` |
| Waypoints | `param/nav_competition.yaml` |
| Report | `data/reports/report.txt` |

## Read these first after clone {#entry-files}

| File | Role |
| ---- | ---- |
| `scripts/setup_env.sh` | Environment |
| `scripts/start_match_*.sh` | Match entry points |
| `launch/nav_competition_2026.launch` | Main launch |
| `param/nav_competition.yaml` | Waypoint course |
| `scripts/nav_competition.py` | Navigation orchestrator |

## Sync the PC and the robot {#sync}

1. Edit on the PC, then `git push`
1. PC → robot: `scp` `src/`, `scripts/`, and `config/`
1. On the robot, `catkin_make` and `source setup_env.sh`
{.steps}

> [!NOTE]
> The robot usually cannot reach GitHub. Do not `git push` from the robot.
