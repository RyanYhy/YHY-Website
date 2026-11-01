---
title: Appendix
linkTitle: Appendix
description: Unfinished features and a function-to-file index.
weight: 90
---

## Unfinished features {#unfinished}

### Yellow-line following {#yellow-line}

| Piece | State |
| ---- | ---- |
| `visual_mine_avoidance.py` | Starts in prep and publishes `/visual_line/*` |
| `cmd_vel_merge.py` | `enable_line_follow=false` |
| Match effect | **None**. Velocity is only forwarded. |

### visual_mine_avoidance {#visual-mine-avoidance}

| Capability | State |
| ---- | ---- |
| Always-on anti-tank inference | `enable_at=false` |
| Match point cloud | Published by `orbbec_mine_antitank` |
| bench | `roslaunch raicom2026 visual_mine_avoidance.launch` |

## Function to file {#cheatsheet}

| To change or inspect | Path (from the repository root) |
| ---- | ---- |
| Waypoints and timeouts | `src/raicom2026/param/nav_competition.yaml` |
| Navigation orchestrator | `src/raicom2026/scripts/nav_competition.py` |
| People and shooting | `src/raicom2026/scripts/webcam_person_gun.py` |
| Mines and anti-tank | `src/raicom2026/scripts/orbbec_mine_antitank.py` |
| Gimbal | `src/raicom2026/scripts/gimbal_server.py` |
| Report | `src/raicom2026/src/raicom2026/report.py` |
| Main launch | `src/raicom2026/launch/nav_competition_2026.launch` |
| move_base parameters | `src/robot_navigation/param/` |
| Maps | `src/raicom2026/data/maps/map2.*` |
| prep/go | `scripts/start_match_*.sh` |

The full tree is in the [GitHub repository](https://github.com/RyanYhy/raicom2026).

## Topics and services {#topics}

| Name | Notes |
| ---- | ---- |
| `/cmd_vel` | To the chassis |
| `/usb_cam/image_raw` | Gimbal camera |
| `/camera/color/image_raw` | Orbbec |
| `/visual_mine/obstacles` | Anti-tank cloud |
| `/person_detect_service` | Person task |
| `/mine_detect_service` | Mine task |
| `/antitank_check_service` | Anti-tank |
