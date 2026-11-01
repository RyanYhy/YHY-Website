---
title: Trying a Vibe Video from One Problem
linkTitle: A Vibe Video Trial
description: "A trial vibe-style video of Quoit Design: what auto routing did, what Opus cost, and how specific the shot notes had to be."
date: 2026-11-01
draft: false
tags: [Study Notes, Video, Quoit Design]
---

After finishing [Quoit Design](../quoit-design-closest-pair/) on October 30, I wanted to turn it into a vibe-style explainer video. Videos of that kind have been everywhere lately. I had heard that one video costs about 5 to 6 yuan, so I subscribed to Cursor Premium. I wanted to see two things with this problem: how far model-made video has got, and whether the result gets any traffic once it is posted.

The video is not finished. This note only records the models, the cost, and the picture changes as of November 1.

![A script, a voxel quoit stall, a robot with a camera, a clock, and coins](cover.png)
{caption="The script, the picture, the time, and the cost stayed four separate parts of this trial"}

## I First Gave It to the Router {#auto-route}

I had also heard that Grok bot in Cursor picks a model by how hard the task is, that Opus 5.5 looks better than the others for video built from generated code, and that the bot can route there. I gave the task to Grok bot first.

A project introduction I made for a classmate looked acceptable to me, although that script was rough. I then wrote a script with Gemini 4 Argon that seemed clear to me and gave it to Grok bot. The picture came out badly, with mistakes that were visible at a glance. The interface did not show which model it had used.

## Opus Had Spent Ten Yuan Before Ten Seconds Were Done {#opus-cost}

I changed route: through a relay, I called Opus 5.5 inside Claude Code. I had written that prompt shot by shot. The original text is not in my notes, so I am not reconstructing it here.

On one 10-second segment, Opus 5.5 had already cost 10 yuan before the segment was finished. Finishing the whole video at that price would be well above the 5 to 6 yuan I had heard, so I did not keep the whole video on Opus 5.5.

## A Vague Note Does Not Change the Shot {#prompt}

I then stayed in Claude Code and continued with the auto mode of the API provided by Cursor. The first cut went through about four or five revisions. A change usually landed closer to what I wanted only after the picture was described specifically.

The opening felt empty and plain. Sending that impression back did not fix it. After I gave Gemini 4 Argon the same description together with the frame, it returned a list of concrete changes. Generating from that list made the opening much clearer. The Chinese prompt I actually used is below.

```text
将当前扁平的 3D 场景升级为具有真实物理光影和景深质感的 3D 体素微缩景观（Lego Brick / MagicaVoxel 渲染风格），具体修改要求如下：

- PBR 物理材质替换：移除纯色无光材质（BasicMaterial）。地面改为带微弱镜面反射的深色粗糙石板（Roughness 0.4, Metalness 0.2），以反射上方霓虹灯光；套圈摊顶棚采用有布料纹理的红白条纹材质；玩偶与橘色 Claude 机器人采用光滑的亚克力/塑料玩具材质（Clearcoat 效果）。

- 全局光照与自发光（Bloom）：添加 Three.js EffectComposer 的 UnrealBloomPass 辉光后处理。让“CYBER QUOIT·赛博套圈”灯牌、摩天轮彩灯、串灯和烟花具有真实的霓虹灯管发光（Emissive）与光晕扩散效果。

- 立体光影与体积感：在摊位内部上方增加一排暖黄色点光源（PointLight）照亮货架玩偶并投射真实阴影（castShadow = true）；场景底部加入深紫色的指数雾效（FogExp2），拉开前景摊位与后方摩天轮、旋转木马及城市剪影的空间纵深感。

- 镜头与景深（DoF）：使用透视相机（FOV 35-45），添加轻微的移轴景深效果（BokehPass），让前景的套圈网格区域和摊位保持绝对清晰，背景的摩天轮、旋转木马和远景大楼产生自然的光学虚化。

- 地面套圈区强化：将摊位前方的矩形地毯改为带有发光网格刻度线的 3D 赛博电子地垫，为后续“地面生成玩具点集”的算法动画留出高亮视觉中心。
```

## Ten Seconds Took Half an Hour or More {#time}

A clear script did not make the wait short. About 10 seconds of demo, from reading the request through writing the code to rendering the video, took at least 30 to 40 minutes, sometimes longer. The version that came out of that wait looked all right to me.

Auto mode did not show which model ran. I guess most of it was Grok 4.7. That is a guess, not a model name I could check on screen.

## The Video Is Not Posted Yet {#later}

The full video is still rendering. When it is done I plan to post it on Bilibili and Douyin and see whether a video built from this problem gets any attention. The links and the traffic numbers will be added here after it is posted.
