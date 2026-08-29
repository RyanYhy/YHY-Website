---
title: 使用说明
linkTitle: 使用说明
description: 环境、编译、udev、prep/go 两段式启动与 PC/实车同步。
weight: 20
---

默认工作空间路径为 `~/1raicom_ws`（与仓库 [raicom2026](https://github.com/RyanYhy/raicom2026) 同结构）。

## 环境要求 {#requirements}

| 组件 | 说明 |
| ---- | ---- |
| 系统 | Ubuntu 18.04 |
| ROS | Melodic |
| 本仓库 | `1raicom_ws`（catkin 根） |
| `~/cartographer_ws` | Cartographer 定位（**不在本仓库内**） |
| `~/cv_bridge_ws` | Python3 版 cv_bridge（YOLO 节点） |
| Conda `yolov8` | ONNX 推理 |

![环境 overlay](/images/raicom2026/env_overlay.png)
{caption="overlay 加载顺序（setup_env.sh）"}

### 统一环境入口 {#setup-env}

每个新终端：

```bash
source ~/1raicom_ws/scripts/setup_env.sh
```

[`setup_env.sh`](https://github.com/RyanYhy/raicom2026/blob/main/scripts/setup_env.sh) 依次 overlay ROS → cartographer → 1raicom_ws → cv_bridge，并强制 `1raicom_ws` 在 `ROS_PACKAGE_PATH` 最前。

## 编译 {#build}

```bash
cd ~/1raicom_ws
source /opt/ros/melodic/setup.bash
catkin_make
```

> [!TIP] lslidar 首次并行编译
> 若失败，**再执行一次** `catkin_make` 即可。

## 外设与 udev {#udev}

规则在 [`config/udev/`](https://github.com/RyanYhy/raicom2026/tree/main/config/udev)：

| 设备 | 节点 |
| ---- | ---- |
| 底盘 | `/dev/carserial` |
| IMU | `/dev/imu` |
| 雷达 | `/dev/lslidar` |
| 云台枪 | `/dev/gun` |
| webcam | `/dev/video*` |
| Orbbec | USB `2bc5` |

```bash
bash ~/1raicom_ws/scripts/check_devices.sh
```

## 比赛启动（两段式） {#match-start}

![prep 与 go](/images/raicom2026/prep_go_sequence.png)

### 赛前 prep {#prep}

```bash
source ~/1raicom_ws/scripts/setup_env.sh
bash ~/1raicom_ws/scripts/start_match_prep.sh
```

- 后台 `nav_competition_2026.launch`（`start_nav:=false`，`loc_mode:=cartographer`）
- 等待 `person_detect_service` 就绪后脚本退出，**prep 进程继续跑**
- 日志：`/tmp/prep.log`

### 出发 go {#go}

```bash
bash ~/1raicom_ws/scripts/start_match_go.sh
```

- 清空 `src/raicom2026/data/reports/`
- 仅启动 `match_go.launch` → `nav_competition.py`

### 清理 {#clean}

```bash
bash ~/1raicom_ws/scripts/clean_ros.sh
```

## 地图与模型 {#assets}

| 资源 | 路径 |
| ---- | ---- |
| 比赛地图 | `src/raicom2026/data/maps/map2.yaml` |
| pbstream | `src/raicom2026/data/maps/map2.pbstream` |
| ONNX | `data/models/person.onnx`、`mine.onnx`、`antitank.onnx` |
| 航点 | `param/nav_competition.yaml` |
| 报告 | `data/reports/report.txt` |

## clone 后建议先看 {#entry-files}

| 文件 | 作用 |
| ---- | ---- |
| `scripts/setup_env.sh` | 环境 |
| `scripts/start_match_*.sh` | 比赛入口 |
| `launch/nav_competition_2026.launch` | 主 launch |
| `param/nav_competition.yaml` | 航点课程 |
| `scripts/nav_competition.py` | 导航编排 |

## PC 与实车同步 {#sync}

1. PC 改代码 → `git push`
1. PC → 车：`scp` 同步 `src/`、`scripts/`、`config/`
1. 车上 `catkin_make` + `source setup_env.sh`
{.steps}

> [!NOTE]
> 车上通常无法直连 GitHub，不要在车上 `git push`。
