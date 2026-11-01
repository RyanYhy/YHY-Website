---
title: Vision
linkTitle: Vision
description: The seven tasks in yolo_onnx.py, the model files, and the topics shared with the mission node.
weight: 50
---

The node name is `multi_task_detector`. The script is `community_vision/yolo_onnx.py`. It subscribes to `/camera/color/image_raw` and stays idle until a task topic arrives. It then runs once, or tracks for a stretch, and publishes the result.

Traffic lights, dolls, fire, and trash bins use a small ONNX Runtime wrapper. E-bikes use `ultralytics` on `motorbike.onnx`. License plates and building names use CnOcr.

## Models {#models}

| File | Task | Classes |
| ---- | ---- | ---- |
| `traffic.onnx` | Traffic lights | Red, yellow, green |
| `best.onnx` | Dolls | `good` is a resident, `bad` is not |
| `fire.onnx` | Fire | Count of detection boxes |
| `bin_new.onnx` | Bin open or closed | Kitchen, hazardous, other, recyclable; open or closed |
| `rubbish.onnx` | Trash inside a bin | Mapped by bin color, then marked correct or wrong |
| `motorbike.onnx` | E-bikes | Upright or fallen; snapshot or ByteTrack |

Those six files must sit in the same directory as the script. Snapshots overwrite files in `ro_test_img/`, including `result_person.jpg`, `result_fire.jpg`, `result_plate.jpg`, `result_trash.jpg`, and `result_bicycle_snapshot.jpg`. Tracking also writes `raw_record.mp4` and `output_tracked.mp4`.

## Topics {#topics}

| Task | Mission publishes | Vision replies |
| ---- | ---- | ---- |
| Traffic light | `/traffic` | `/traffic_light_status` |
| Dolls | `/person_detect` | `/person_detect_status` |
| Building / fire | `/fire_detect` | `/fire_detect_status` |
| License plate | `/plate_detect` | `/plate_detect_status` |
| Trash bins | `/trash_bin_detect` | `/trash_bin_status` |
| E-bike tracking | `/bicycle_detect` | `/bicycle_detect_status` |
| E-bike snapshot | `/bicycle_snapshot` | `/bicycle_snapshot_status` |

Doll results are comma-separated `good` / `bad`. A snapshot looks like `Total:1,Normal:0,Fallen:1`. The mission node moves on from a traffic light only when the status string is `绿灯`.

## What each task does {#tasks}

### Traffic light {#traffic}

When it sees green it publishes `绿灯`. The mission node waits until that string arrives.

### Dolls {#person}

`good` counts as a resident and `bad` as a non-resident. Totals and the spoken summary are accumulated by zone A or B inside `main_nav.py`. The vision node only returns the current frame.

### Building and fire {#fire}

OCR runs on the frame first and keeps building names such as 锦绣大厦 and 盛世大厦. `fire.onnx` then counts fire boxes. The reply to the mission node is one Chinese sentence with the building name and the hazard count.

### License plate {#plate}

CnOcr reads the plate and `espeak` speaks it. The mission node only waits for a completion signal.

### Trash bins {#trash}

`bin_new.onnx` sees whether each bin is open or closed. `rubbish.onnx` sees what is inside. The script checks that against the bin color, then speaks one sentence.

### E-bikes {#bicycle}

A snapshot is a single frame. It counts upright and fallen bikes and adds them to zone A or B.

Tracking has two stages:

1. The vision node publishes `/cmd_vel`, drives, and records the raw frames to `raw_record.mp4`
1. At the goal it stops, runs ByteTrack offline, counts upright and fallen bikes in the parking area, and tells the mission node
{.steps}
