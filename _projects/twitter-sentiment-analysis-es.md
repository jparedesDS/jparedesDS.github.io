---
layout: project
title: "Análisis de sentimiento en Twitter"
description: "Identifica el sentimiento positivo y negativo en tuits y explora sus características de lenguaje natural."
img: /images/mytwittersentiment.png
img_alt: "Gráficos de distribución de sentimiento a partir de datos de Twitter"
importance: 8
category: data-automation
project_key: twitter-sentiment-analysis
lang: es
page_id: project-twitter-sentiment-analysis
permalink: /projects/twitter-sentiment-analysis/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/tensorflow-twitter-sentiment-analysis
---

## Resumen

Un estudio del sentimiento positivo y negativo en tuits que también explora características del lenguaje natural como la frecuencia de palabras, los hashtags y las menciones. Visualiza la distribución del sentimiento y su evolución temporal.

## Problema

Twitter genera un gran volumen de opinión. El proyecto clasifica el sentimiento automáticamente y analiza las características del lenguaje que hay detrás de cada tendencia.

## Funcionalidades principales

- Clasifica los tuits como positivos, negativos o neutros
- Explora la frecuencia de palabras, los hashtags y las menciones
- Identifica temas y hashtags asociados a conversaciones virales
- Genera gráficos y nubes de palabras para la distribución del sentimiento y las tendencias

## Stack

- Python
- tweepy para la API de Twitter
- pandas y NumPy
- Matplotlib y Seaborn
- TextBlob o VADER para el análisis de sentimiento
