---
title: "trtw.tv"
summary: "Live Spanish subtitles for Twitch and YouTube, transcribed locally with Whisper."
category: "products"
year: "2025"
image: "/images/trtw-tv.png"
imageAlt: "trtw.tv live subtitles"
links:
  - label: "Code"
    url: "https://github.com/jparedesDS/trtw-tv"
    external: true
order: 4
---

## Problem

English live streams are hard to follow for Spanish-speaking viewers, and the platforms do not provide live Spanish subtitles. Cloud transcription services add cost, require API keys and send the audio off the viewer's machine, which is a poor fit for a browser extension that should just work on any stream.

## Approach

trtw.tv is a Chrome extension (Manifest V3) that captures the audio of the active tab, transcribes English with Whisper and overlays Spanish subtitles on Twitch and YouTube. It runs entirely on the user's machine, using WebGPU when available and a WASM/CPU fallback when it is not, so integrated graphics are enough. Whisper `tiny.en`, `base.en` and `small.en` models are provided through transformers.js, with Silero VAD, local-agreement confirmation and a hallucination filter to keep the output stable. Translation uses the Chrome built-in Translator API with an Opus-MT fallback, and the extension supports a glossary, context and bilingual subtitles. The popup shows the measured latency, which sits around 1.5 to 3 seconds behind the stream.

## Result

Viewers can watch English Twitch and YouTube streams with live Spanish subtitles without sending audio to a server, creating an account or paying for an API. The extension follows the player, works on ordinary hardware and keeps the transcription local.
