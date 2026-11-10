---
layout: project
title: "trtw.tv: subtítulos en español en directo para Twitch y YouTube"
description: "Extensión de Chrome que transcribe retransmisiones en inglés en local y superpone subtítulos en español en Twitch y YouTube."
img: /images/trtw-tv.png
img_alt: "Subtítulos en español superpuestos sobre una retransmisión en directo de Twitch"
importance: 4
category: products
project_key: trtw-tv
lang: es
page_id: project-trtw-tv
permalink: /projects/trtw-tv/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/trtw-tv
---

## Resumen

Una extensión de Chrome (Manifest V3) que captura el audio de la pestaña, transcribe el inglés con Whisper y superpone subtítulos en español en Twitch y YouTube. Se ejecuta por completo en el equipo del usuario con WebGPU y una alternativa WASM/CPU.

## Problema

Las retransmisiones en directo en inglés necesitan subtítulos en español sin enviar el audio a un servidor ni depender de API de pago ni de claves.

## Funcionalidades principales

- Extensión para Chrome 138+ que captura el audio de la pestaña y sigue al reproductor
- Modelos Whisper `tiny.en`, `base.en` y `small.en` mediante transformers.js
- Backend WebGPU con alternativa WASM/CPU, así que basta con gráficos integrados
- Silero VAD, confirmación por acuerdo local y filtro de alucinaciones
- API Translator integrada de Chrome con alternativa Opus-MT
- Glosario, contexto y opciones de subtítulos bilingües
- Subtítulos con 1,5–3 s de retardo y latencia medida en la ventana emergente

## Stack

- JavaScript y Chrome Manifest V3
- transformers.js y onnxruntime-web
- Whisper, Silero VAD y Opus-MT
- esbuild y Node.js 22 para la compilación
