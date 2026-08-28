---
title: 比赛任务
linkTitle: 比赛任务
description: 主调度、人物/雷区/反坦克检测、云台服务与 6 行报告。
weight: 70
---

代码主要在 `raicom2026` 包。[仓库](https://github.com/RyanYhy/raicom2026/tree/main/src/raicom2026)

![任务 Service 流](/images/raicom2026/task_service_flow.png)

## 主调度 nav_competition {#scheduler}

| 项 | 说明 |
| -- | ---- |
| 配置 | [`nav_competition.yaml`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/param/nav_competition.yaml) |
| go 启动 | [`match_go.launch`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/launch/match_go.launch) |
| 任务类型 | `person`（A–D）、`mine`（A/B）、`antitank` |

| Service | 执行节点 |
| ------- | -------- |
| `/person_detect_service` | `webcam_person_gun.py` |
| `/mine_detect_service` | `orbbec_mine_antitank.py` |
| `/antitank_check_service` | `orbbec_mine_antitank.py` |

## 云台服务 gimbal_server {#gimbal}

- 独占 `/dev/gun`
- `/gun/aim`、`/gun/fire`、`/gun/home`
- 人物与雷区**共用**云台

## 人物识别与打靶 {#person}

[`webcam_person_gun.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/webcam_person_gun.py)

| 项 | 说明 |
| -- | ---- |
| 相机 | `/usb_cam/image_raw`（848×480 MJPG） |
| 模型 | `person.onnx` |
| 流程 | 扫描计数 → 精确报告串 → 对 enemy 瞄准开火 |

打靶与识别在**同一节点**，不直写串口。

## 雷区识别 {#mine}

[`orbbec_mine_antitank.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/orbbec_mine_antitank.py) 的 mine 部分：

| 项 | 说明 |
| -- | ---- |
| 相机 | 云台 webcam |
| 云台 | A `(70,70)`、B `(175,70)` |
| 模型 | `mine.onnx` |
| 报告 | `"A雷区未排雷数量x个,已经排雷数量x个"`（半角逗号） |

## 反坦克与避障 {#antitank}

同一脚本的 antitank 部分 + move_base：

| 项 | 说明 |
| -- | ---- |
| 相机 | Orbbec color + depth |
| 触发 | P21 `/antitank_check_service` |
| 输出 | `/visual_mine/obstacles` → local costmap |

## 报告输出 {#report}

[`report.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/src/raicom2026/report.py) + [`assemble_report.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/assemble_report.py) → 恰好 **6 行** `report.txt`。

![双相机](/images/raicom2026/dual_camera.png)
