---
title: 附录
linkTitle: 附录
description: 未完成功能与「功能 → 文件」速查表。
weight: 90
---

## 未完成功能 {#unfinished}

### 黄线循线

| 环节 | 状态 |
| ---- | ---- |
| `visual_mine_avoidance.py` | prep 会起；发 `/visual_line/*` |
| `cmd_vel_merge.py` | `enable_line_follow=false` |
| 比赛效果 | **无**；速度仅透传 |

### visual_mine_avoidance

| 能力 | 状态 |
| ---- | ---- |
| 反坦克常驻推理 | `enable_at=false` |
| 比赛点云 | 由 `orbbec_mine_antitank` 发布 |
| bench | `roslaunch raicom2026 visual_mine_avoidance.launch` |

## 功能 → 文件速查 {#cheatsheet}

| 想改 / 想查 | 路径（相对仓库根） |
| ----------- | ------------------ |
| 航点、超时 | `src/raicom2026/param/nav_competition.yaml` |
| 导航编排 | `src/raicom2026/scripts/nav_competition.py` |
| 人物+打靶 | `src/raicom2026/scripts/webcam_person_gun.py` |
| 雷区+反坦克 | `src/raicom2026/scripts/orbbec_mine_antitank.py` |
| 云台 | `src/raicom2026/scripts/gimbal_server.py` |
| 报告 | `src/raicom2026/src/raicom2026/report.py` |
| 主 launch | `src/raicom2026/launch/nav_competition_2026.launch` |
| move_base 参数 | `src/robot_navigation/param/` |
| 地图 | `src/raicom2026/data/maps/map2.*` |
| prep/go | `scripts/start_match_*.sh` |

完整列表见 [GitHub 仓库](https://github.com/RyanYhy/raicom2026)。

## 常用 Topic / Service {#topics}

| 名称 | 说明 |
| ---- | ---- |
| `/cmd_vel` | 到底盘 |
| `/usb_cam/image_raw` | 云台相机 |
| `/camera/color/image_raw` | Orbbec |
| `/visual_mine/obstacles` | 反坦克点云 |
| `/person_detect_service` | 人物任务 |
| `/mine_detect_service` | 雷区任务 |
| `/antitank_check_service` | 反坦克 |
