---
layout: project
title: "Automatización del informe de seguimiento"
description: "Reduce el tiempo de generación de informes y los errores de introducción manual de datos convirtiendo exportaciones del ERP en informes de Excel con estilo."
importance: 11
category: data-automation
project_key: monitoring-report-automation
lang: es
page_id: project-monitoring-report-automation
permalink: /projects/monitoring-report-automation/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/monitoring-report
---

## Resumen

Un script que convierte una exportación del ERP en un informe de seguimiento de Excel con estilo. Limpia los datos, divide los documentos por estado y escribe una hoja por vista.

## Problema

Preparar el informe de seguimiento de documentos a mano llevaba tiempo y era propenso a errores de introducción manual de datos. El script realiza automáticamente la limpieza, agrupación y formato repetitivos.

## Funcionalidades principales

- Importa el archivo Excel del ERP, rellena valores nulos y convierte fechas
- Agrupa los documentos en conjuntos enviados, no enviados, comentados y aprobados
- Calcula los días de devolución, las semanas de contrato y notas adicionales
- Escribe hojas con estilo para todos los documentos, enviados, no enviados, comentados y un gráfico general de estado
- Aplica estilos de celda personalizados según el estado del documento

## Stack

- Python
- pandas
- xlsxwriter y openpyxl
- tqdm y aspose-cells
