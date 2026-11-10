---
layout: project
title: "Twitter: análisis de sentimiento con emojis"
description: "Clasifica el tono emocional de los tuits a partir del uso de emojis con procesamiento de lenguaje natural."
img: /images/myemoji.png
img_alt: "Gráficos de frecuencia de emojis y sentimiento a partir de datos de Twitter"
importance: 7
category: data-automation
project_key: twitter-sentiment-emojis
lang: es
page_id: project-twitter-sentiment-emojis
permalink: /projects/twitter-sentiment-emojis/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/NLP-sentiment-analysis-with-emojis
---

## Resumen

Un estudio en notebook sobre cómo se relacionan los emojis de los tuits con el tono emocional. Extrae y cuenta emojis, explora su distribución por cuenta y aplica procesamiento de lenguaje natural para clasificar el sentimiento.

## Problema

Los emojis transmiten un sentimiento que el análisis de texto plano puede pasar por alto. El proyecto los usa como indicadores de sentimiento y estudia su relación con el resto del tuit.

## Funcionalidades principales

- Limpia y normaliza el texto de los tuits y extrae los emojis
- Visualiza la frecuencia de emojis y la distribución de tuits por cuenta
- Analiza correlaciones entre cuentas populares y su uso de emojis
- Clasifica los tuits en categorías de sentimiento con PLN
- Genera gráficos y tablas que relacionan el uso de emojis con el sentimiento detectado

## Stack

- Python
- pandas y NumPy
- Matplotlib y Seaborn
- NLTK
- Jupyter Notebook
