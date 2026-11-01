---
title: Match tasks
linkTitle: Match tasks
description: Orchestrator, person, mine, and anti-tank detection, the gimbal service, and the 6-line report.
weight: 70
---

Most of this code is in the `raicom2026` package. [Repository](https://github.com/RyanYhy/raicom2026/tree/main/src/raicom2026)

![Task service flow](/images/raicom2026/task_service_flow.png)

## Orchestrator nav_competition {#scheduler}

| Item | Notes |
| -- | ---- |
| Config | [`nav_competition.yaml`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/param/nav_competition.yaml) |
| go launch | [`match_go.launch`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/launch/match_go.launch) |
| Task types | `person` (A–D), `mine` (A/B), `antitank` |

| Service | Node |
| ---- | ---- |
| `/person_detect_service` | `webcam_person_gun.py` |
| `/mine_detect_service` | `orbbec_mine_antitank.py` |
| `/antitank_check_service` | `orbbec_mine_antitank.py` |

## Gimbal service gimbal_server {#gimbal}

- Exclusive owner of `/dev/gun`
- `/gun/aim`, `/gun/fire`, `/gun/home`
- People and mines **share** the gimbal

## People and shooting {#person}

[`webcam_person_gun.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/webcam_person_gun.py)

| Item | Notes |
| -- | ---- |
| Camera | `/usb_cam/image_raw` (848×480 MJPG) |
| Model | `person.onnx` |
| Flow | Scan and count → exact report string → aim and fire at the enemy |

Shooting and recognition live in **the same node**. The node does not write the serial port itself.

## Mines {#mine}

The mine half of [`orbbec_mine_antitank.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/orbbec_mine_antitank.py):

| Item | Notes |
| -- | ---- |
| Camera | Gimbal webcam |
| Gimbal | A `(70,70)`, B `(175,70)` |
| Model | `mine.onnx` |
| Report | `"A雷区未排雷数量x个,已经排雷数量x个"` (ASCII comma) |

## Anti-tank avoidance {#antitank}

The antitank half of the same script, plus move_base:

| Item | Notes |
| -- | ---- |
| Camera | Orbbec color and depth |
| Trigger | P21 `/antitank_check_service` |
| Output | `/visual_mine/obstacles` → local costmap |

## Report {#report}

[`report.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/src/raicom2026/report.py) and [`assemble_report.py`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/scripts/assemble_report.py) produce a `report.txt` of exactly **6 lines**.

![Two cameras](/images/raicom2026/dual_camera.png)
