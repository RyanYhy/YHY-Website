---
title: 使用说明
linkTitle: 使用说明
description: 环境、依赖、编译，以及导航、视觉、任务三个终端的启动顺序。
weight: 20
---

把含有 `src/community_nav`、`src/community_vision`、`src/community_mission` 的目录当作 catkin 工作空间。也可以把这三个包放进车上已有的 `competition_ws/src` 再编译。

## 环境要求 {#requirements}

| 组件 | 说明 |
| ---- | ---- |
| 系统 | Ubuntu 20.04 |
| ROS | Noetic |
| 本工作空间 | 上面三个功能包 |
| `orbbec_camera` | Dabai DCW2，不在本工作空间内 |
| `lslidar_driver` | 镭神雷达驱动，不在本工作空间内 |
| `car_bringup` | 里程计节点 `base_node`，不在本工作空间内 |
| Conda `paddle_env` | 只给 `yolo_onnx.py` 用 |

已经装过 `ros-noetic-desktop-full` 的话，导航和 RViz 一般都在。缺下面这些再补：

```bash
sudo apt update
sudo apt install -y \
  ros-noetic-navigation \
  ros-noetic-robot-localization \
  ros-noetic-robot-state-publisher \
  ros-noetic-xacro \
  ros-noetic-cv-bridge \
  espeak \
  espeak-data
```

语音用的是 `espeak -v zh`。日志里如果出现 `Full dictionary is not installed for 'zh'`，是中文词典不全，播报会不清楚，不影响导航和识别。

## 视觉环境 {#conda}

`environment.yml` 在工作空间根目录，环境名是 `paddle_env`，Python 3.10。这是当时整环境导出的，体积比较大。

```bash
conda env create -f environment.yml
conda activate paddle_env
```

`yolo_onnx.py` 会用到 `onnxruntime`、`opencv-python`、`numpy`、`pillow`、`ultralytics`、`cnocr`、`cnstd`。车牌和楼宇名的 OCR 模型第一次运行会下到 `~/.cnstd`，当时需要能联网。

`main_nav.py` 只用 ROS 自带的 Python，不要进 `paddle_env`。

## 编译 {#build}

```bash
cd /path/to/workspace
source /opt/ros/noetic/setup.bash
catkin_make
source devel/setup.bash
```

每个新终端都要 source ROS，再 source 本工作空间的 `devel/setup.bash`。

## 外设 {#devices}

| 设备 | 节点 | 参数 |
| ---- | ---- | ---- |
| 底盘 | `/dev/carserial` | 115200，`base_controller.py` |
| IMU | `/dev/imu` | 9600，`wit_multi_ros.py` |
| 雷达 | `/dev/lslidar` | 镭神 N10_P 串口 |
| 相机 | 奥比 Dabai DCW2 | `/camera/color/image_raw` |

## 比赛启动（三个终端） {#match-start}

![三个终端](/images/zhihuishequ/startup_sequence.svg)
{caption="先导航，再视觉，最后才发航点"}

### 1. 导航 {#nav}

不要进 conda。

```bash
source /opt/ros/noetic/setup.bash
source /path/to/workspace/devel/setup.bash
roslaunch community_nav nav_multi.launch
```

会起地图、底盘、IMU、雷达、AMCL、`move_base`、奥比相机和 RViz。不上 RViz：

```bash
roslaunch community_nav nav_multi.launch use_rviz:=false
```

### 2. 视觉 {#vision}

等相机话题有数据后再开。这个终端要进 conda，并且仍然 source ROS，否则 `rospy` 和 `cv_bridge` 对不上。

```bash
conda activate paddle_env
source /opt/ros/noetic/setup.bash
source /path/to/workspace/devel/setup.bash
cd /path/to/workspace/src/community_vision
python yolo_onnx.py
```

> [!NOTE] 必须在这个目录里运行
> 脚本按当前目录下的文件名加载 `traffic.onnx` 等模型。不要用 `rosrun` 把它换到别的工作目录。

日志出现 `多任务检测节点已就绪` 再进行下一步。截图和追踪视频写到同目录的 `ro_test_img/`。

### 3. 任务 {#mission}

用系统 Python，不要 `conda activate`。

```bash
source /opt/ros/noetic/setup.bash
source /path/to/workspace/devel/setup.bash
cd /path/to/workspace/src/community_mission
python main_nav.py
```

也可以 `rosrun community_mission main_nav.py`。它连上 `move_base` 后从第 1 个航点开始走。

## 模型放哪 {#models}

都在 `src/community_vision/`，和 `yolo_onnx.py` 同级：

| 文件 | 用途 |
| ---- | ---- |
| `traffic.onnx` | 红绿灯 |
| `best.onnx` | 人偶（`good` / `bad`） |
| `fire.onnx` | 火焰 |
| `bin_new.onnx` | 垃圾桶开闭 |
| `rubbish.onnx` | 垃圾类别 |
| `motorbike.onnx` | 电动车快照和追踪 |

车牌、楼宇名不走这些文件，走 CnOcr。
