---
title: "subany.video"
summary: "Live subtitles and translation for streams, processed locally in the browser."
category: "products"
year: "2026"
image: "/images/subany-video-thumb.png"
imageAlt: "subany.video interface"
links:
  - label: "Website"
    url: "https://subany.video/"
    external: true
  - label: "Code"
    url: "https://github.com/jparedesDS/subtitle.me"
    external: true
  - label: "How it works"
    url: "/blog/2026/11/09/how-subany-video-works/"
    external: false
order: 1
---

## Problem

Live streams and videos are often only available in one language, and viewers who need subtitles depend on whatever the platform provides. Sending audio to a third-party service adds latency, cost and a privacy question, while asking people to install an app or create an account adds friction before they can watch anything.

## Approach

subany.video adds subtitles and translation directly in the browser. A speech-recognition model runs on the viewer's own machine with WebGPU, so audio does not need to be uploaded to a server. The recognised text is translated and drawn over the stream or video as it plays. There is no account and no installation step: the site opens, the video or stream is selected, and subtitles appear.

## Result

Viewers get live subtitles and translation while the media stays local to their device. The project is open source, and the step-by-step explanation of how the pipeline works is available as a separate article for anyone who wants the technical detail.
