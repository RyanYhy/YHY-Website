---
title: Match tasks
linkTitle: Match tasks
description: Waypoints in main_nav.py, zone A/B totals, and which vision result each stop waits for.
weight: 60
---

The script is `community_mission/main_nav.py`. The node name is `navigation_task_node`. The `points` list at the top of the file has 36 poses in the `map` frame. Numbers start at 1, matching the log line "到达点 N".

The script does not recognize anything itself. At a task stop it publishes a topic, blocks until vision replies, then goes to the next point. A stop it cannot reach logs a warning, and the loop continues.

![Topics](/images/zhihuishequ/task_topics.svg)
{caption="The mission node sends the start signal. The vision node sends the result."}

## Tasks on the course {#points}

| Stop | Task |
| -- | ---- |
| 1, 20 | Traffic light. Wait until `/traffic_light_status` is `绿灯` |
| 9 | Speak "前方是禁止直行指示牌" |
| 3, 8, 12 | Zone A: dolls, then an e-bike snapshot |
| 13, 18 | Zone B: dolls, then an e-bike snapshot |
| 15, 19, 31 | Building name and fire |
| 23, 25, 30 | License plate |
| 27 | Trash bins and whether the trash was sorted correctly |
| 32 | Moving e-bike tracking. Vision publishes velocity during this stretch |
| The rest | Waypoint only. Pause 0.5 seconds after arrival |

Zone A speaks once, after all three of its detection stops. Zone B speaks once, after both of its stops. The sentence gives the resident count, the non-resident count, and the total e-bikes snapshotted at those doll stops (upright plus fallen).

A result token that starts with `g` counts as a resident. A token that starts with `b` counts as a non-resident.

## Contract with vision {#protocol}

| Mission publishes | Payload | Reply it waits for |
| ---- | ---- | ---- |
| `/traffic` | `traffic` | `/traffic_light_status` = `绿灯` |
| `/person_detect` | `start` | `/person_detect_status` |
| `/bicycle_snapshot` | `snap` | `/bicycle_snapshot_status` |
| `/fire_detect` | `start` | `/fire_detect_status` |
| `/plate_detect` | `start` | `/plate_detect_status` |
| `/trash_bin_detect` | `start` | `/trash_bin_status` |
| `/bicycle_detect` | `start` | `/bicycle_detect_status` |

The node sleeps 0.5 or 1 second before publishing, so the camera and the previous frame can settle. Right after doll detection, the same stop runs an e-bike snapshot, and that snapshot is added to the current zone, A or B.

## Speech {#speech}

`speak()` starts a thread that runs `espeak -v zh`. Zone A/B summaries, the no-straight-ahead sign, and the plate and trash sentences from the vision node all use that path. The Chinese building-and-fire sentence stays in the log. After the mission node receives it, the robot continues and does not speak it again.
