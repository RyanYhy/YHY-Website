---
title: 概述
linkTitle: 概述
description: 全球人工智能算法精英大赛智慧社区赛项 — 任务目标、三个功能包、数据流与运行顺序。
weight: 10
---

2025 年全球人工智能算法精英大赛「智慧社区」赛项，全国二等奖。小车在社区场景里自主巡航，到指定点完成识别，并用语音播报结果。定位用 AMCL，规划用 `move_base`，视觉是单独的 ONNX 节点。

- **平台**：ROS Noetic · Ubuntu 20.04 · catkin 工作空间
- **代码**：`community_nav`、`community_vision`、`community_mission`

## 系统在做什么 {#mission}

比赛任务可以概括成三条链路：

1. **导航** — `main_nav.py` 按写死的航点走（`move_base` + AMCL）
1. **感知** — 到任务点后发话题，视觉节点做当次识别
1. **播报** — 区域统计和部分检测结果用 `espeak` 念出来
{.steps}

和后来的 RAICOM 智能侦察不同：这里没有 prep/go 两段脚本，也没有把结果写成报告文件。比赛时是开三个终端，按顺序启动。

## 三个功能包 {#packages}

| 包 | 做什么 | 比赛时谁启动 |
| ---- | ---- | ---- |
| `community_nav` | 地图、底盘、IMU、雷达、EKF、AMCL、`move_base`、奥比相机 | `roslaunch community_nav nav_multi.launch` |
| `community_vision` | 订阅相机，按话题切换检测任务 | `python yolo_onnx.py`（conda `paddle_env`） |
| `community_mission` | 航点与到点任务 | `python main_nav.py`（系统 Python） |

`orbbec_camera`、`lslidar_driver`、`car_bringup` 不在这三个包里，车上原来的工作空间里已经有。

![软件架构](/images/zhihuishequ/arch_layers.svg)
{caption="从硬件到比赛任务的六层结构"}

## 总数据流 {#dataflow}

![数据流](/images/zhihuishequ/dataflow.svg)
{caption="IMU 与里程进 EKF，雷达进 AMCL；相机只进视觉节点"}

**传感器 → 融合 → 定位 → 规划 → 底盘**

- 雷达 `/scan`、IMU、`odom_raw` 经 EKF 得到 `/odom`
- AMCL 用 `/scan` 和地图做定位，发布 `map → odom`
- `move_base` 输出速度到底盘

**任务触发** 用的是话题，不是 Service。`main_nav.py` 发 `/traffic`、`/person_detect` 等，`yolo_onnx.py` 回对应的 status。电动车移动追踪期间，视觉节点会直接往 `/cmd_vel` 发速度。

## 相机 {#camera}

全场视觉共用奥比中光 Dabai DCW2 的彩色图，话题是 `/camera/color/image_raw`。`nav_multi.launch` 里包含 `orbbec_camera` 的 `dabai_dcw2.launch`。单目 `usb_cam` 在这个 launch 里是注释掉的。

## 启动顺序 {#startup}

| 顺序 | 终端 | 命令 |
| ---- | ---- | ---- |
| 1 | 系统 Python | `roslaunch community_nav nav_multi.launch` |
| 2 | conda `paddle_env` | `python yolo_onnx.py` |
| 3 | 系统 Python | `python main_nav.py` |

等第 1 步相机已经在发图、第 2 步日志出现「多任务检测节点已就绪」，再跑第 3 步。详见 [使用说明](../usage/)。

## 运行时在等什么 {#nav-state}

`main_nav.py` 连上 `move_base` 之后按航点走。普通航点到达后只停 0.5 秒。任务点会堵住，直到视觉节点回结果，再回到下一个航点。红绿灯则一直等到识别为绿灯。航点走完，任务结束。
