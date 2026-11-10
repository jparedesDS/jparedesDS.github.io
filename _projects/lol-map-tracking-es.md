---
layout: project
title: "Detección de objetos para el seguimiento del mapa de LoL"
description: "Sigue a los campeones de League of Legends en el minimapa con un modelo de detección de objetos YOLO11m."
importance: 7
category: ai-vision
project_key: lol-map-tracking
lang: es
page_id: project-lol-map-tracking
permalink: /projects/lol-map-tracking/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/lol-map-tracking-object-detection
---

## Resumen

Un modelo YOLO11m que detecta campeones de League of Legends en el minimapa. La ficha del modelo enumera los campeones como etiquetas y documenta la validación con una matriz de confusión normalizada y lotes de predicción.

## Problema

El seguimiento en el minimapa exige reconocer a cada campeón a partir de un icono pequeño. El modelo cubre la lista completa de campeones como etiquetas de detección.

## Funcionalidades principales

- Checkpoint YOLO11m para el seguimiento en el minimapa
- Conjunto completo de etiquetas de campeones de League of Legends
- Ejemplo de inferencia de Ultralytics con `model.predict()`
- Resultados de validación, muestras de etiquetas y lotes de predicción en la ficha del modelo

## Stack

- YOLO11 mediante la librería Ultralytics
- Python
