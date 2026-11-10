---
layout: project
title: "Scraper de estadísticas de equipos y jugadores de HLTV"
description: "Extrae estadísticas de equipos y jugadores de HLTV y calcula una puntuación de rendimiento ponderada para Counter-Strike 2."
img: /images/myhltv.png
img_alt: "Estadísticas de equipos y jugadores de HLTV extraídas en una tabla"
importance: 6
category: data-automation
project_key: hltv-scraper
lang: es
page_id: project-hltv-scraper
permalink: /projects/hltv-scraper/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/hltv-scraper
---

## Resumen

Un scraper de Selenium que recopila estadísticas de equipos y jugadores de HLTV y las escribe en un CSV ordenado por jugador. También calcula una única puntuación de rendimiento a partir del porcentaje de victorias, el ratio K/D, el Rating 2.1 y el HLTV Impact.

## Problema

Comparar jugadores y equipos de Counter-Strike 2 entre las páginas de HLTV a mano es lento e inconsistente. El scraper reúne las estadísticas en un único archivo estructurado.

## Funcionalidades principales

- Extrae equipos, mapas jugados, porcentajes de victoria y estadísticas de las alineaciones
- Recopila estadísticas individuales como impacto, KAST, bajas de apertura y tipos de baja
- Calcula una puntuación de rendimiento normalizada: 30 % porcentaje de victorias, 30 % ratio K/D, 20 % Rating 2.1 y 20 % HLTV Impact
- Escribe un CSV con una fila por jugador y el conjunto completo de estadísticas

## Stack

- Python 3.7+
- Selenium y undetected-chromedriver
- BeautifulSoup
- pandas, NumPy y scikit-learn
- openpyxl
