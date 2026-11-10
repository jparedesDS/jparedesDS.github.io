---
layout: project
title: "Detector de defectos de soldadura"
description: "Detecta defectos de soldadura en imágenes de inspección metalúrgica con un modelo de detección de objetos YOLO11x."
img: /images/mywelding.jpg
img_alt: "Resultado de la detección de un defecto de soldadura en una imagen de inspección metalúrgica"
importance: 4
category: ai-vision
project_key: welding-defects-detector
lang: es
page_id: project-welding-defects-detector
permalink: /projects/welding-defects-detector/
nav_key: projects
private: false
tutorial:
links:
  - type: model
    url: https://huggingface.co/jparedesDS/welding-defects-detection
  - type: code
    url: https://github.com/jparedesDS/welding-defects-detection
---

## Resumen

Un modelo de detección de objetos YOLO11x para defectos de soldadura en imágenes de inspección metalúrgica. Está publicado en Hugging Face con cuatro etiquetas: `Defect`, `Welding Line`, `Workpiece` y `porosity`.

## Problema

La inspección de soldaduras tiene que localizar los defectos y distinguirlos de la línea de soldadura y de la propia pieza. El modelo realiza esa detección en imágenes de inspección.

## Funcionalidades principales

- Checkpoint YOLO11x publicado en Hugging Face
- Cuatro etiquetas admitidas: `Defect`, `Welding Line`, `Workpiece` y `porosity`
- Ejemplo de inferencia de Ultralytics con `model.predict()`
- Matriz de confusión normalizada, muestras de etiquetas, correlograma y lotes de predicción en la ficha del modelo

## Stack

- YOLO11 mediante la librería Ultralytics
- Python
