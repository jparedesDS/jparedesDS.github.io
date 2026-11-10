---
layout: project
title: "Pro POV CS2 — Autonomous Esports Content Pipeline"
description: "The autonomous engine behind the Pro POV CS2 channel: match discovery, demo parsing, POV recording and publishing."
img: /images/propov-cs2.png
img_alt: "Pro POV CS2 video thumbnail with a professional player's point of view"
importance: 1
category: esports
project_key: pro-pov-cs2
lang: en
page_id: project-pro-pov-cs2
permalink: /projects/pro-pov-cs2/
nav_key: projects
private: true
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/cs2data
    private: true
  - type: web
    url: /propovcs2/
  - type: youtube
    url: https://www.youtube.com/@Pro.POV.CS2
  - type: tiktok
    url: https://www.tiktok.com/@propov.cs2
  - type: instagram
    url: https://www.instagram.com/propovcs2/
  - type: x
    url: https://x.com/ProPOVCS2
---

## Overview

The engine behind the Pro POV CS2 channel: it finds pro matches on FACEIT and tier-1 HLTV events, downloads and parses the demos, records the player's point of view with CS2 and HLAE on GPU — reproducing their exact aspect ratio, crosshair code, viewmodel, HUD and radar — then renders per-round chapters, a thumbnail with the player's cut-out photo, and vertical clips, publishing to YouTube, Shorts, TikTok, Instagram Reels and X with generated SEO, all unattended every 20 minutes. Daily picks are chosen with an optimal-stopping policy over a learned threshold, player demand is estimated from YouTube view velocity, and a ridge audience model reorders the queue. SQLite state with priority queue, retries, FFmpeg quality gate and auto-pause when a CS2 update breaks recording.

> Private repository. Implementation details are not disclosed.
