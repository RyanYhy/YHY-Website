---
title: 2025 Smart Community
linkTitle: 2025 Smart Community
description: ROS navigation, multi-task vision, and match orchestration across three packages.
date: 2025-12-20
weight: 20
type: docs
icon: fa-solid fa-city
sidebar_root_for: self
sidebar_root_link_self: true
sidebar_expanded: true
navbar_autohide: false
cascade:
  type: docs
  navbar_autohide: false
  footer_style: slim
  comments: false
  feedback: false
  reading_time: false
  share: [copy]
  search_boost: 1.0
  build:
    list: local
    render: always
    publishResources: true
---

Vehicle ROS documentation for the Smart Community event of the Global AI Algorithm Elite Competition. National second prize, 2025. The code is three packages: `community_nav`, `community_vision`, and `community_mission`.

> [!NOTE] Reading order
> Follow the sidebar or the list on this page: overview, usage, each module, summary, then the appendix.

## Overview {#overview}

What the robot does, how the three packages split the work, and how data moves.

→ [Read the overview](overview/)

## Usage {#usage}

Environment, dependencies, build, and the three terminals used in a match.

→ [Read the usage guide](usage/)

## Hardware and drivers {#module-hardware}

Chassis, IMU, lidar, Orbbec camera, and the driver chain started by `nav_multi.launch`.

→ [Read hardware and drivers](module-hardware/)

## Navigation {#module-navigation}

Map, AMCL, `move_base`, and where the parameter files live.

→ [Read navigation](module-navigation/)

## Vision {#module-vision}

Traffic lights, dolls, fire, license plates, trash bins, e-bikes, and the model for each.

→ [Read vision](module-vision/)

## Match tasks {#module-mission}

Waypoints in `main_nav.py`, the task at each stop, and the topics shared with vision.

→ [Read match tasks](module-mission/)

## Summary {#summary}

How the three packages fit together, and where to edit waypoints or models.

→ [Read the summary](summary/)

## Appendix {#appendix}

A function-to-file index, plus scripts that the three-step start does not launch.

→ [Read the appendix](appendix/)
