---
layout: project
title: "Prueba de inspección por líquidos penetrantes fluorescentes"
description: "Detecta indicaciones de la prueba de líquidos penetrantes en componentes de metalurgia con un modelo de detección de objetos YOLO11l."
img: /images/myyolo11.png
img_alt: "Detección de una indicación de la prueba de líquidos penetrantes en un componente de metalurgia"
importance: 2
category: ai-vision
project_key: fluorescent-penetrant-inspection
lang: es
page_id: project-fluorescent-penetrant-inspection
permalink: /projects/fluorescent-penetrant-inspection/
nav_key: projects
private: false
tutorial:
links:
  - type: model
    url: https://huggingface.co/jparedesDS/fluorescent-penetrant-inspection
  - type: code
    url: https://github.com/jparedesDS/fluorescent-penetrant-inspection
---

## Resumen

Modelos de detección de objetos para la inspección por líquidos penetrantes fluorescentes (FPI, DP, LPI, PT) en empresas de metalurgia. El modelo publicado es un checkpoint YOLO11l servido en Hugging Face con una única etiqueta, `defecto`.

## Problema

La inspección por líquidos penetrantes depende de localizar visualmente las indicaciones superficiales. Este proyecto entrena modelos de detección para encontrar esas indicaciones en imágenes de inspección.

## Funcionalidades principales

- Modelo YOLO11l publicado en Hugging Face
- Única etiqueta admitida: `defecto`
- Ejemplo de inferencia de Ultralytics con `model.predict()`
- Matriz de confusión normalizada, muestras de etiquetas y resultados de validación documentados en la ficha del modelo

## Stack

- YOLO11 mediante la librería Ultralytics
- Python
