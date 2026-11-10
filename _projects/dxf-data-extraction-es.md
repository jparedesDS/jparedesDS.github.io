---
layout: project
title: "Extracción de datos de archivos DXF"
description: "Extrae entidades de planos técnicos DXF y las regenera en un formato definido por el usuario para la documentación automatizada."
img: /images/mydxf.png
img_alt: "Entidades extraídas de un plano DXF de ingeniería"
importance: 3
category: ai-vision
project_key: dxf-data-extraction
lang: es
page_id: project-dxf-data-extraction
permalink: /projects/dxf-data-extraction/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/extract-data-dxf
---

## Resumen

Un script de Python que extrae entidades de planos técnicos DXF y las escribe en un nuevo DXF con un formato definido por el usuario. Gestiona líneas, círculos, arcos, polilíneas, texto y cotas, y además genera una representación vectorial del archivo.

## Problema

Los planos técnicos contienen datos de entidades que deben identificarse y reformatearse antes de poder alimentar flujos de documentación automatizada.

## Funcionalidades principales

- Extrae datos de una amplia variedad de entidades DXF
- Regenera las entidades en un formato de salida personalizado
- Gestiona entidades tanto 2D como 3D
- Genera una representación vectorial para visualización o procesamiento posterior
- Se ejecuta desde la línea de comandos con la ruta de un DXF de entrada

## Stack

- Python 3
- `ezdxf`
