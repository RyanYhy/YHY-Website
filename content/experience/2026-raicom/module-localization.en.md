---
title: Localization
linkTitle: Localization
description: AMCL and Cartographer pure localization, helper nodes, and the handoff to navigation.
weight: 50
---

[`nav_competition_2026.launch`](https://github.com/RyanYhy/raicom2026/blob/main/src/raicom2026/launch/nav_competition_2026.launch) switches mode with `loc_mode`:

| Mode | Argument | Notes |
| ---- | ---- | ---- |
| **Cartographer** | `loc_mode:=cartographer` (**match default**) | Loads `map2.pbstream` |
| **AMCL** | `loc_mode:=amcl` | Particle filter on the static map |

![Localization modes](/images/raicom2026/localization_modes.png)

prep always uses:

```bash
roslaunch raicom2026 nav_competition_2026.launch start_nav:=false loc_mode:=cartographer
```

## Cartographer helper nodes {#carto-nodes}

| Node | Role |
| ---- | ---- |
| `odom_cleaner.py` | Clean timestamps on `/odom` |
| `carto_init.py` | Inject the starting pose |
| `carto_relocalize.py` | Manual relocalization from RViz 2D Pose Estimate |

Configuration: [`config/cartographer/localization.lua`](https://github.com/RyanYhy/raicom2026/tree/main/src/raicom2026/config/cartographer)

## Handoff to nav_competition {#nav-boot}

When `nav_competition.py` starts it:

1. Waits for `/map`
1. Connects to `move_base`
1. Publishes the initial pose
1. Waits about 3 seconds for convergence
1. Cruises the `course`
{.steps}

In Cartographer mode, anti-tank detection also uses `/tracked_pose` to convert into the map frame.
