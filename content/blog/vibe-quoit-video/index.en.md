---
title: An Attempt at a Vibe Knowledge Video
linkTitle: A Vibe Knowledge Video
description: "An attempt to make a vibe-style video of Quoit Design, and what Grok bot, Opus, and a more specific script each changed."
date: 2026-11-01
lastmod: 2026-11-03
draft: false
tags: [Study Notes, Video, Quoit Design]
---

After finishing [Quoit Design](../quoit-design-closest-pair/) on October 30, I wanted to turn it into a vibe-style explainer video. Videos of that kind have been everywhere lately. I already had a Cursor Premium subscription. The idea came from hearing that Grok bot in it can call Opus 5.5, and that Opus 5.5 looks better than the others for video built from generated code. I had also heard that one video costs about 5 to 6 yuan. I wanted to see two things with this problem: how far the result has got, and whether it gets any traffic once it is posted.

I have not subscribed to Claude. From what I had learned, its bans and limits on users in China are strict, and I did not want the account banned. So I did not open that subscription. I started with the Grok bot I was already using.

The video is not finished. Only stage 1 and stage 2 are done, 1 minute 12 seconds in total. This note only records the models, the cost, and the picture changes as of November 1.

![Filming a Quoit Design vibe video in front of a neon voxel stall](cover.png)
{caption="The script, the ten seconds, and the stack of coins stayed separate parts of this trial"}

## The Standing Brief {#brief}

For this kind of video I start by giving the model the same four instructions.

1. Set the format. Make it in Remotion, 1920×1080, 30 frames per second, 16:9 landscape. No voiceover. Chinese subtitles carry the points. The music is We Never, a track that has been everywhere lately.
2. Hit the beats. Analyze the music first, measure the beats per minute, and list the time of every downbeat. Every picture change lands on a downbeat.
3. Add sound effects. Every key action gets a sound, synthesized in code. The timbre is an instrument that fits whatever the picture is emphasizing.
4. Show a test cut. Make the first 10 seconds for me to look at. After I confirm it, continue one segment at a time, and redo only the segment that is not good enough.

## What the Grok Bot Video Was Like {#grok-bot}

The clip I made for a classmate at the start was a project introduction, not this algorithm explainer, and it looked all right. When I later made the algorithm explainer, the quality came out very poor, and I still don't know why. That result was certainly not from Opus 5.5. It was worse than what I got on my own computer with Cursor's auto mode.

## Opus Had Spent Ten Yuan Before Ten Seconds Were Done {#opus-cost}

I changed route: through a relay, I called Opus 5.5 inside Claude Code. The four instructions above are the standing brief. The version I gave Opus was written shot by shot, and that original text is not in my notes, so I am not reconstructing it here.

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

Those two stages already add up to 1 minute 12 seconds. The script is planned as 14 stages, and these two alone used more than 40% of a week's Cursor allowance. Making the video does spend a lot of tokens.

Auto mode does not label which model ran. This is a fairly complex job, so it would generally call the strongest in-house model, Grok 4.7 high.

## This Cut on Bilibili {#later}

Added on November 3: this cut is on Bilibili. The player stays on this page. The link under it opens Bilibili. It is not on Douyin yet, and the view counts are not written down here.

{{< bilibili id="BV1qc4P6GEt6" cid="43271260874" aid="117547500307998" >}}
