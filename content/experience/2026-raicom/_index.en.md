---
title: 2026 RAICOM Reconnaissance
linkTitle: 2026 RAICOM
description: ROS software architecture, operating guide, and module notes for the vehicle. Read alongside the raicom2026 GitHub repository.
date: 2026-08-27
weight: 10
type: docs
icon: fa-solid fa-trophy
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

Vehicle ROS documentation for the RAICOM Intelligent Reconnaissance event. Source: [RyanYhy/raicom2026](https://github.com/RyanYhy/raicom2026).

> [!NOTE] Reading order
> Follow the sidebar or the list on this page: overview, usage, each module, summary, then the appendix.

## Overview {#overview}

Layered architecture, data flow, prep/go, and runtime state.

→ [Read the overview](overview/)

## Usage {#usage}

Environment, three workspaces, conda, build, and the two-stage start.

→ [Read the usage guide](usage/)

## Hardware and drivers {#module-hardware}

Devices, udev, driver packages, EKF, and the TF tree.

→ [Read hardware and drivers](module-hardware/)

## Mapping {#module-mapping}

Match maps `map2.yaml` / `map2.pbstream` and the Cartographer toolchain.

→ [Read mapping](module-mapping/)

## Localization {#module-localization}

Cartographer pure localization, AMCL, and the `loc_mode` switch.

→ [Read localization](module-localization/)

## Navigation {#module-navigation}

`move_base`, costmaps, the anti-tank point cloud, and the cmd_vel chain.

→ [Read navigation](module-navigation/)

## Match tasks {#module-tasks}

Person detection and shooting, mine counting, anti-tank avoidance, and the 6-line report.

→ [Read match tasks](module-tasks/)

## Summary {#summary}

Module dependencies, where to change things, and the main entry points.

→ [Read the summary](summary/)

## Appendix {#appendix}

Unfinished features and a function-to-file index.

→ [Read the appendix](appendix/)
