---
title: 比赛任务
linkTitle: 比赛任务
description: main_nav.py 的航点、A/B 区统计，以及到点以后等哪一个视觉结果。
weight: 60
---

脚本是 `community_mission/main_nav.py`，节点名 `navigation_task_node`。航点列表 `points` 写在文件顶部，一共 36 个，坐标系是 `map`。点号从 1 开始，和运行日志里的「到达点 N」一致。

它不自己识别。到了任务点就发话题，堵到视觉节点回复，再去下一个点。没到的点会打一条警告，然后继续往后走。

![话题](/images/zhihuishequ/task_topics.svg)
{caption="任务节点发启动信号，视觉节点回结果"}

## 点位上的任务 {#points}

| 点 | 任务 |
| -- | ---- |
| 1、20 | 红绿灯，等到 `/traffic_light_status` 为 `绿灯` |
| 9 | 播报「前方是禁止直行指示牌」 |
| 3、8、12 | A 区：人偶，紧接着电动车快照 |
| 13、18 | B 区：人偶，紧接着电动车快照 |
| 15、19、31 | 楼宇名 + 火焰 |
| 23、25、30 | 车牌 |
| 27 | 垃圾桶和投放 |
| 32 | 电动车移动追踪，这段时间速度由视觉节点发 |
| 其余 | 只做航点，到达后停 0.5 秒 |

A 区三个检测点都走完才播报一次。B 区两个检测点都走完才播报一次。播报内容是社区内人数、非社区人数，以及这两类人偶点上快照到的电动车总数（正常 + 倒伏）。

人偶计数规则：结果字符串里以 `g` 开头的算社区内，以 `b` 开头的算非社区。

## 和视觉的约定 {#protocol}

| 任务节点发布 | 载荷 | 等的回复 |
| ---- | ---- | ---- |
| `/traffic` | `traffic` | `/traffic_light_status` = `绿灯` |
| `/person_detect` | `start` | `/person_detect_status` |
| `/bicycle_snapshot` | `snap` | `/bicycle_snapshot_status` |
| `/fire_detect` | `start` | `/fire_detect_status` |
| `/plate_detect` | `start` | `/plate_detect_status` |
| `/trash_bin_detect` | `start` | `/trash_bin_status` |
| `/bicycle_detect` | `start` | `/bicycle_detect_status` |

发话题前会先睡 0.5 秒或 1 秒，给相机和上一帧留时间。人偶识别结束后立刻在同一点做电动车快照，快照会计入当前的 A 区或 B 区。

## 播报 {#speech}

`speak()` 起一个线程调用 `espeak -v zh`。A/B 区总结、禁止直行、以及视觉节点自己的车牌和垃圾桶结果，都会走这条路径。楼宇/火焰的中文结果记在日志里，任务节点收到后继续走，不再重复念一遍。
