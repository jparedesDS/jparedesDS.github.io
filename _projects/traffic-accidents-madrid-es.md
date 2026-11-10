---
layout: project
title: "Análisis de accidentes de tráfico"
description: "Análisis y predicción de accidentes de tráfico en la ciudad de Madrid."
img: /images/mytraffic.png
img_alt: "Gráficos de análisis de accidentes de tráfico de la ciudad de Madrid"
importance: 9
category: data-automation
project_key: traffic-accidents-madrid
lang: es
page_id: project-traffic-accidents-madrid
permalink: /projects/traffic-accidents-madrid/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/lazy-classifier-traffic-accidents-madrid
---

## Resumen

Trabajo de análisis y predicción sobre el conjunto de datos abierto de accidentes de tráfico de la ciudad de Madrid. El repositorio documenta la estructura del conjunto de datos, los tipos de accidente y la codificación de gravedad utilizada en el análisis.

## Problema

Madrid publica un registro por persona implicada en un accidente y codifica la gravedad numéricamente. Los datos hay que interpretarlos y prepararlos antes de poder analizarlos o usarlos para predecir.

## Funcionalidades principales

- Documenta la estructura del conjunto de datos de accidentes de tráfico de Madrid
- Explica la taxonomía de tipos de accidente, desde colisiones dobles hasta atropellos
- Asigna los códigos numéricos de gravedad a resultados leves, graves y mortales
- Analiza los accidentes y construye predicciones a partir de los datos históricos
