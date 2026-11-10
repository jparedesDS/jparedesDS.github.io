---
layout: project
title: "Detección de armas por OCR en Counter-Strike 2"
description: "Captura la pantalla y detecta nombres de armas en Counter-Strike 2 mediante reconocimiento óptico de caracteres."
img: /images/ocr-identification.png
img_alt: "Captura de la herramienta de detección de armas por OCR ejecutándose sobre Counter-Strike 2"
importance: 1
category: ai-vision
project_key: ocr-weapon-detection-cs2
lang: es
page_id: project-ocr-weapon-detection-cs2
permalink: /projects/ocr-weapon-detection-cs2/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/OCR-Identification-CS2-Weapons
---

## Resumen

Este proyecto captura la pantalla y detecta nombres de armas en Counter-Strike 2 mediante reconocimiento óptico de caracteres. Preprocesa la imagen capturada, aplica OCR con Tesseract y extrae los nombres de armas de una lista predefinida.

## Problema

Los nombres de las armas solo son visibles como píxeles en la pantalla del juego. La herramienta lee ese texto directamente de un fotograma capturado, así que no hace falta buscarlo a mano.

## Funcionalidades principales

- Captura la pantalla en tiempo real
- Aplica preprocesamiento de imagen para mejorar el reconocimiento del texto
- Usa Tesseract OCR para extraer el texto del fotograma capturado
- Compara el texto extraído con una lista de armas predefinida, incluida AK-47, M4A1-S, M4A1, AWP, FAMAS, Galil, Desert Eagle, USP-S y Glock-18

## Stack

- Python 3
- OpenCV y NumPy
- Tesseract OCR mediante `pytesseract`
- MSS para la captura de pantalla
