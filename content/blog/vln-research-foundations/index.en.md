---
title: VLN Foundations and a Survey of Navigation Methods
linkTitle: VLN Foundations
description: Notes on scenes, tasks, simulators, evaluation metrics, and success rates for my zero-shot R2R-CE navigation project using qwen3-vl-plus.
date: 2026-10-15
lastmod: 2026-10-17
draft: false
tags: [Research Notes, VLN, R2R-CE, Embodied AI, Qwen3-VL]
---

Recently, I have been working on a VLN project that uses the relatively affordable `qwen3-vl-plus` API for zero-shot navigation on R2R-CE. While going through the related material, I have mainly been trying to understand a few things: what each dataset provides, what kind of environment the robot moves through, and how to read the success rates reported by different methods.

This post covers the foundations I organized on October 15, followed by a survey of methods updated through October 17. I first separate scenes, tasks, and simulation platforms, then work through navigation approaches, evaluation metrics, and paper results.

![Concept illustration of a wheeled robot observing an indoor environment and choosing its next action from a language instruction](cover.png)
{caption="Language instructions, current observations, and actions form a navigation loop that keeps updating"}

## Zero-Shot Navigation and Affordable APIs {#project-start}

VLN stands for Vision-and-Language Navigation. A simple way to understand it is this: a robot receives a natural-language instruction, uses what it can see to decide where to go next, and stops at an appropriate location.

For example, "leave the bedroom, walk through the hallway, and stop beside the table" contains more than a destination. The robot also needs to recognize the bedroom, hallway, and table, understand how they relate to one another, and work out how much of the instruction it has completed.

I am taking a zero-shot approach: rather than training or fine-tuning a navigation policy on R2R-CE demonstrations, I use an existing vision-language model to make decisions. Here, "zero-shot" refers to the navigation task; the foundation model itself has already been pretrained.

I think of "affordable API" as a budget constraint for the project. Alongside success rate, I need to consider how many calls, images, and tokens a complete route requires, as well as how long it takes. A cheap individual call does not necessarily make the whole route cheap.

## Scenes, Navigation Tasks, and Simulators {#three-layers}

When I first encountered these names, the most useful distinction was between three layers.

**Scene data provides the environment.** Matterport3D, or MP3D, includes images, 3D reconstructions, and other data obtained by scanning real buildings. It first answers the question, "What does the building look like?"

**Navigation task data specifies what to do.** R2R and RxR provide starting locations, language instructions, reference routes or goals, and evaluation splits. They answer, "What route should the agent follow in this building?"

**A simulator makes the interaction run.** Matterport3D Simulator and Habitat execute actions and return observations according to their environment representations, allowing navigation algorithms to interact with the environment.

Having a 3D scene therefore does not mean having a complete VLN task. Even a basic experiment needs to connect the environment, task definition, and execution platform.

### MP3D and HM3D {#scene-datasets}

[MP3D](https://niessner.github.io/Matterport/) contains 90 building-scale scenes, with RGB-D images, camera poses, 3D reconstructions, and other data. Classic navigation tasks such as R2R and RxR are built on these scenes. For my current project, its immediate value is that I can reuse established task annotations and evaluation settings.

[HM3D](https://aihabitat.org/datasets/hm3d/) provides 1,000 building-scale 3D scenes, offering more environments for embodied navigation. But it is not, by itself, a complete VLN dataset with human-written route instructions. Using these environments for language-guided navigation also requires routes, instructions, and corresponding task definitions.

Both can be used with Habitat, but replacing MP3D with HM3D does not mean I am still running the original R2R-CE evaluation. **Having more scenes and having the same task are two different things.**

## Common VLN Datasets {#navigation-datasets}

The differences between these names mainly come down to task design. Some share the same buildings but ask the robot to do different things.

### R2R: Following a Route Instruction {#r2r}

R2R stands for Room-to-Room, a classic indoor VLN dataset. It uses MP3D scenes and pairs routes with human-written English instructions that guide an agent from a starting point to a goal.

The R2R dataset in the [original paper](https://arxiv.org/abs/1711.07280) contains 7,189 routes and 21,567 instructions, with three independent English descriptions for each route. These are three ways of describing the same route, not three subtasks to execute in sequence.

The original R2R task is built around viewpoints on a navigation graph. Understanding this representation helps explain how it differs from R2R-CE.

### RxR: Richer Routes and Language-Visual Alignment {#rxr}

RxR stands for Room-Across-Room. It also uses MP3D environments, but expands the instruction languages to English, Hindi, and Telugu, with longer and more varied routes.

One feature I find worth remembering is dense spatiotemporal grounding. I first understand this as fine-grained alignment between language, observations, and movement.

During data collection, a guide moves along a route and describes the surroundings. The system records timestamped views and poses, which are then aligned with words in the instruction. Researchers can therefore study not just the final route, but also "what the person saw and where they were facing when they said this sentence." These are observations recorded during collection, not human pose trajectories automatically available to a model at test time. The [official RxR explanation](https://research.google/blog/rxr-a-multilingual-benchmark-for-navigation-instruction-following/) gives a more visual introduction.

![Official RxR animation aligning words in a navigation instruction with observations and movement along the route](rxr-language-grounding.gif)
{caption="An example of language, observation, and movement alignment in RxR"}

Image source: [example animation in the official RxR repository](https://github.com/google-research-datasets/RxR/blob/main/merged.gif).

### R4R: Separating Arrival from Route Following {#r4r}

R4R stands for Room-for-Room. It creates longer navigation tasks by joining compatible routes from R2R and concatenating their instructions. The "4" in the name does not mean a fixed route through four rooms.

It drew my attention to a distinction: **reaching the destination and faithfully following the instruction are two abilities that need separate evaluation.**

Suppose an instruction asks the robot to leave the hall, enter the study, go through a corridor, and then enter the bedroom. But there happens to be a door connecting the hall directly to the bedroom. Taking that shortcut might reach the goal without following the full instruction.

Checking the final location is therefore not enough; the actual route matters too. This is why the [R4R paper](https://aclanthology.org/P19-1181/) emphasizes instruction fidelity.

### REVERIE: Identifying an Object as Well as Navigating {#reverie}

[REVERIE](https://arxiv.org/abs/1904.10151) defines a different task. It uses high-level language descriptions to guide an agent near a target object and requires the agent to identify that object correctly.

For example, "go to the bedroom and find the lamp on the bedside table" is not just about completing a route. Once in the bedroom, the agent still needs to identify the particular object.

My shorthand for these differences is: R2R focuses on route instructions; RxR adds multilingual instructions and fine-grained alignment; R4R emphasizes instruction fidelity over longer routes; and REVERIE combines navigation with object identification. Similar names alone are not a reason to compare their success rates directly.

## R2R versus R2R-CE {#discrete-continuous}

For my current project, the most directly relevant distinction is between R2R and R2R-CE.

In the original R2R, the agent moves between predefined panoramic observation locations. Navigation graph edges already indicate which locations are mutually reachable, so the algorithm mainly chooses the next adjacent viewpoint.

R2R-CE transfers these language navigation tasks into continuous 3D environments, usually running in Habitat. The agent must actually move and turn, changing its position incrementally within navigable space while encountering obstacles and collisions.

![Original VLN-CE task setup showing 3D simulation, first-person observations, and low-level movement actions](vlnce-environment.png)
{caption="Continuous environments and low-level movement actions in VLN-CE"}

Image source: [official VLN-CE project page](https://jacobkrantz.github.io/vlnce/).

### Continuous Environments Do Not Require Continuous Actions {#continuous-actions}

One point to keep clear is that **a continuous environment does not require continuously valued actions.**

The [base VLN-CE task configuration](https://github.com/jacobkrantz/VLN-CE/blob/master/habitat_extensions/config/vlnce_task.yaml) can use fixed-distance forward steps and fixed-angle turns, such as moving forward 0.25 meters or turning 15 degrees. The action choices are finite, but movement is no longer restricted to the observation nodes of the original navigation graph.

Another approach is for a higher-level component to propose a local waypoint and let a lower-level component move toward it. However, proposing a point does not guarantee that the robot can reach it. Checking reachability, avoiding obstacles, and reporting failures are still part of the system.

This makes the connection between language understanding, visual judgment, and physical movement clearer to me. Switching to a stronger API does not automatically replace all the control and traversability decisions.

## Measuring Navigation Results {#metrics}

I divide evaluation into three questions: **did it arrive, did it move efficiently, and did it follow the specified route?**

### NE, SR, and OSR: Reaching the Goal {#arrival-metrics}

**NE**, or Navigation Error, usually measures the shortest navigable distance from the final position to the goal, in meters. Lower is better. This distance follows traversable paths through the environment; a short straight-line distance through a wall does not necessarily mean the robot is close to the goal.

**SR** means Success Rate. Each episode is judged against the task's success rules, and the overall proportion is reported. In common R2R-CE settings, the agent must stop within the goal's success distance, usually three meters. The exact implementation, including how STOP is counted, depends on the evaluation code for the version being used.

**OSR**, or Oracle Success Rate, asks whether the trajectory ever entered the goal's success region. Even if the agent later moves away, the trajectory may still count as an oracle success. The [VLN-CE metric implementation](https://github.com/jacobkrantz/VLN-CE/blob/master/habitat_extensions/measures.py) is useful for checking the calculation.

A high OSR but low SR therefore means that some trajectories passed near the goal without successfully finishing. Stopping decisions, task progress, and subsequent movement are worth examining, but the gap between the two numbers alone does not identify the cause of failure.

### SPL and Path Length: Moving Efficiently {#efficiency-metrics}

**SPL**, or Success weighted by Path Length, combines success with path efficiency. An unsuccessful episode scores zero. A successful episode is discounted according to the ratio between the shortest path length and the actual path length.

For example, if the shortest navigable path from the start to the goal is 10 meters and the agent succeeds after traveling 20 meters, the episode's SPL score is 0.5. The scores are then averaged across episodes. The [SPL evaluation paper](https://arxiv.org/abs/1807.06757) gives the formal definition.

**TL / PL** usually refers to the actual trajectory or path length, also in meters. It needs to be read alongside success rate: a short path might mean efficient navigation, or it might mean the agent stopped incorrectly very early.

SPL uses the shortest path between the start and goal as its reference. That is not always the full route requested by the instruction, so SPL alone cannot tell us whether the agent faithfully followed the entire instruction.

### nDTW: Following the Reference Route {#path-fidelity}

To check how closely the actual route matches the reference route, I can also look at **nDTW**. It uses dynamic time warping to align trajectories and measures their similarity, rather than just comparing their endpoints. The [nDTW paper](https://arxiv.org/abs/1907.05446) discusses this type of evaluation for instruction-guided navigation.

In the earlier R4R example, taking a shortcut from the hall to the bedroom could reach the destination while following the reference route less faithfully. This makes the distinction between "reaching the goal" and "following the route" feel much more concrete to me.

## A Survey of Success Rates across Approaches {#comparing-results}

When reading an experimental results table, I first check the kind of approach and then the tasks it was evaluated on. I keep a few comparison conditions in mind:

- Is the task the original R2R or R2R-CE in continuous environments?
- Is the split `val_seen`, `val_unseen`, or the test set? Does the evaluation use the full split or a subset?
- Does the model receive RGB, depth, or pose information? Can it access panoramic observations?
- Does the system include a trained navigation policy, waypoint predictor, or other modules? Is prior exploration allowed?
- Which model version is used? How many calls, how much time, and how much money does each episode require?

Whether a model is trained, how the foundation model is deployed, and which additional modules are used are different dimensions. For example, a method can leave the main model unchanged while using both an API and pretrained perception modules. I organized the following representative results around these distinctions to get a sense of what different approaches currently achieve.

### Representative Results as of October 17 {#literature-update}

**1. Small zero-shot models: around 30%.**

[LightZeroNav](https://arxiv.org/html/2603.16947v2), using Qwen3-VL-8B, reports **30.0% +/- 2.0%** SR on a **100-episode R2R-CE subset**; its 4B version reports **27.0% +/- 3.0%**. Rather than fine-tuning on navigation tasks, it organizes execution through task decomposition, observation filtering, and progress assessment. This is the concrete reference behind "small models at around 30%" in my notes.

**2. Zero-shot open-weight large models or affordable APIs: representative results around 40%-50%.**

[SpaceVLN](https://arxiv.org/html/2606.08992v1#A3.SS3) evaluates **1,839 episodes** from R2R-CE `val_unseen`. Its `Qwen3-VL-Plus + Qwen3-VL-Flash` configuration achieves **40.3%** SR, while its locally deployed Qwen3.5 configuration achieves **48.9%**. Plus handles planning and Flash handles execution, with RGB-D, pose information, and spatial memory also used in the system. These results are directly relevant to my project using an affordable API.

**3. Trained navigation models: representative full-split results around 70%-80%.**

[Qwen-RobotNav-8B](https://github.com/QwenLM/Qwen-RobotNav) reports **72.1%** SR on R2R-CE `val_unseen`; [Robostral Navigate](https://mistral.ai/news/robostral-navigate/) reports **76.6%**. The latter is an 8B model trained for navigation using monocular RGB input. This approach encodes more navigation ability into model parameters, unlike zero-shot navigation through direct calls to a general-purpose model.

**4. Zero-shot navigation with flagship APIs: some 100-episode subset results approach 80%.**

The [zero-shot navigation evaluation of GPT-6-Astra](https://arxiv.org/html/2609.29861v1) uses monocular RGB and primitive actions on a **100-episode R2R-CE subset**. It achieves **76.0%** SR with medium reasoning and **79.0%** with ultra reasoning. The reasoning budget matters alongside the model itself: changing the reasoning configuration changes the result even with the same model.

**5. Hybrid systems combining flagship models and trained modules: full-split results around 80%.**

[Table 6 of the NavGPT-3 preprint](https://arxiv.org/html/2610.10787v1#S4.T6) provides a representative example. On the **full R2R-CE `val_unseen` split**, GPT-6 Astra combined with the 8B NavGPT VLA achieves **81.51%** SR and **70.42%** SPL; the Claude Opus 5 configuration achieves **79.01%** SR. For comparison, the standalone 8B NavGPT VLA achieves **74.51%** SR.

I classify this as a hybrid system because it combines the reasoning ability of a flagship language model with a trained navigation policy. The higher-level model interprets instructions, plans, and reviews execution, while NavGPT VLA executes actions at a higher frequency. The system also provides mapping and backtracking tools. The comparison is not just about model size, but also how these abilities work together.

I am interested in these results not just to find the highest success rate, but to understand the roles of model capability, observations, and navigation modules. For a "zero-shot + affordable API" approach, the cost of completing an episode is another unavoidable part of the comparison.
