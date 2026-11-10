---
layout: project
title: "Clasificación de imagen y visión de fotogramas de Futurama"
description: "Clasificación multietiqueta de personajes de Futurama en fotogramas de vídeo: 2.º puesto público y 3.º privado en una competición de Kaggle."
img: /images/myimage-classification.png
img_alt: "Fotograma de Futurama clasificado por personaje con el modelo ResNet152"
importance: 5
category: ai-vision
project_key: futurama-image-classification
lang: es
page_id: project-futurama-image-classification
permalink: /projects/futurama-image-classification/
nav_key: projects
private: false
tutorial:
links:
  - type: kaggle
    url: https://www.kaggle.com/competitions/comp-mediavida-2-futurama/leaderboard
  - type: code
    url: https://github.com/jparedesDS/image-classification-multilabel
---

## Resumen

Dos enfoques para la clasificación multietiqueta de personajes de Futurama en fotogramas de vídeo, creados para la competición de Kaggle de Mediavida. Una CNN personalizada de Keras y un modelo ResNet152 preentrenado en ImageNet alcanzaron el 2.º puesto en la clasificación pública y el 3.º en la privada.

## Problema

La competición pedía los personajes presentes en cada fotograma, un problema multietiqueta evaluado con la raíz del error cuadrático medio por columnas (MCRMSE).

## Funcionalidades principales

- CNN personalizada de Keras para identificar personajes, con un MCRMSE de 0,12527
- ResNet152 preentrenado en ImageNet_v2, con un MCRMSE de 0,09149
- Notebooks públicos para ambos enfoques en Kaggle
- 2.º puesto en la clasificación pública y 3.º en la privada

## Stack

- Python
- Keras y TensorFlow para la CNN personalizada
- PyTorch y torchvision para ResNet152
- NumPy, pandas, Matplotlib y Seaborn
