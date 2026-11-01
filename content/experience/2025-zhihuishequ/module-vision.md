---
title: 视觉
linkTitle: 视觉
description: yolo_onnx.py 的七类任务、模型文件，以及和任务节点的话题。
weight: 50
---

节点名是 `multi_task_detector`，脚本是 `community_vision/yolo_onnx.py`。它订阅 `/camera/color/image_raw`，平时不识别；收到任务话题后做一次（或一段追踪），再把结果发回去。

红绿灯、人偶、火焰、垃圾桶用自己写的 ONNX Runtime 封装。电动车用 `ultralytics` 加载 `motorbike.onnx`。车牌和楼宇名用 CnOcr。

## 模型 {#models}

| 文件 | 任务 | 类别 |
| ---- | ---- | ---- |
| `traffic.onnx` | 红绿灯 | 红灯、黄灯、绿灯 |
| `best.onnx` | 人偶 | `good` 社区内，`bad` 非社区 |
| `fire.onnx` | 火焰 | 检测框计数 |
| `bin_new.onnx` | 垃圾桶开闭 | 厨余 / 有害 / 其他 / 可回收，开或关 |
| `rubbish.onnx` | 桶里的垃圾 | 按颜色归到对应垃圾桶，判断投放对不对 |
| `motorbike.onnx` | 电动车 | 正常 / 倒伏；快照或 ByteTrack |

这六个文件必须和脚本放在同一目录。截图覆盖写到 `ro_test_img/`，例如 `result_person.jpg`、`result_fire.jpg`、`result_plate.jpg`、`result_trash.jpg`、`result_bicycle_snapshot.jpg`。追踪还会写 `raw_record.mp4` 和 `output_tracked.mp4`。

## 话题 {#topics}

| 任务 | 任务节点发来 | 视觉节点回复 |
| ---- | ---- | ---- |
| 红绿灯 | `/traffic` | `/traffic_light_status` |
| 人偶 | `/person_detect` | `/person_detect_status` |
| 楼宇 / 火焰 | `/fire_detect` | `/fire_detect_status` |
| 车牌 | `/plate_detect` | `/plate_detect_status` |
| 垃圾桶 | `/trash_bin_detect` | `/trash_bin_status` |
| 电动车追踪 | `/bicycle_detect` | `/bicycle_detect_status` |
| 电动车快照 | `/bicycle_snapshot` | `/bicycle_snapshot_status` |

人偶结果是逗号分隔的 `good` / `bad`。快照结果形如 `Total:1,Normal:0,Fallen:1`。红绿灯只有字符串 `绿灯` 会让任务节点继续走。

## 各任务在做什么 {#tasks}

### 红绿灯 {#traffic}

看到绿灯后发布 `绿灯`。任务节点会一直等到这个字符串。

### 人偶 {#person}

`good` 记成社区内人员，`bad` 记成非社区人员。计数和播报在 `main_nav.py` 里按 A、B 区累加，视觉节点只回当帧结果。

### 楼宇与火焰 {#fire}

先对画面做 OCR，抽出「锦绣大厦」「盛世大厦」这类楼名，再用 `fire.onnx` 数火焰框。回给任务节点的是一句中文，例如大厦名称和隐患个数。

### 车牌 {#plate}

CnOcr 读车牌，结果用 `espeak` 播报。任务节点只等一个完成信号。

### 垃圾桶 {#trash}

`bin_new.onnx` 看每个桶是开还是关，`rubbish.onnx` 看桶里是什么。脚本按桶的颜色判断投放是否正确，拼成一句话播报。

### 电动车 {#bicycle}

快照是单帧：数当前画面里正常和倒伏的车，给 A/B 区累加。

移动追踪分两段：

1. 视觉节点发 `/cmd_vel`，一边走一边把原始画面录到 `raw_record.mp4`
1. 到达目标后停，用 ByteTrack 离线数停车区里正常和倒伏的车，再通知任务节点
{.steps}
