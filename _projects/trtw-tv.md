---
layout: project
title: "trtw.tv — Live Spanish Subtitles for Twitch & YouTube"
description: "Chrome extension that transcribes English streams locally and overlays Spanish subtitles on Twitch and YouTube."
img: /images/trtw-tv.png
img_alt: "Spanish subtitles overlaid on a Twitch live stream"
importance: 4
category: products
project_key: trtw-tv
lang: en
page_id: project-trtw-tv
permalink: /projects/trtw-tv/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/trtw-tv
---

## Overview

A Chrome extension (Manifest V3) that captures tab audio, transcribes English with Whisper and overlays Spanish subtitles on Twitch and YouTube. It runs entirely on the user's machine with WebGPU and a WASM/CPU fallback.

## Problem

English live streams need Spanish subtitles without sending the audio to a server or relying on paid APIs and keys.

## Main features

- Chrome 138+ extension that captures the tab audio and follows the player
- Whisper `tiny.en`, `base.en` and `small.en` models through transformers.js
- WebGPU backend with a WASM/CPU fallback, so integrated graphics are enough
- Silero VAD, local-agreement confirmation and a hallucination filter
- Chrome built-in Translator API with an Opus-MT fallback
- Glossary, context and bilingual subtitle options
- Subtitles with a 1.5–3 s delay, measured latency in the popup

## Stack

- JavaScript and Chrome Manifest V3
- transformers.js and onnxruntime-web
- Whisper, Silero VAD and Opus-MT
- esbuild and Node.js 22 for the build
