---
layout: project
title: "DocFlow SaaS"
description: "Control documental de principio a fin para pedidos de proyectos de ingeniería, leyendo el ERP en modo de solo lectura y archivando cada PDF devuelto."
img: /images/docflow-saas.svg
img_alt: "Panel de control documental de DocFlow con el estado de la documentación de proyectos"
importance: 1
category: data-automation
project_key: docflow-saas
lang: es
page_id: project-docflow-saas
permalink: /projects/docflow-saas/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/docflow
---

## Resumen

DocFlow Lite es una aplicación de escritorio para el control documental de pedidos de proyectos de ingeniería. Sigue cada pedido desde su apertura y los envíos al cliente hasta las devoluciones por portal, reclamaciones, portadas e informes de progreso, leyendo los datos del ERP en modo de solo lectura y archivando cada PDF devuelto en su carpeta de red.

## Problema

Un pedido grande puede requerir cientos de descargas de portales y muchas revisiones de documentos. Hacerlo a mano es lento y corre el riesgo de sobrescribir un documento archivado. DocFlow automatiza el flujo y mantiene cada revisión en la carpeta correcta.

## Funcionalidades principales

- Lee la base de datos PostgreSQL del ERP en modo de solo lectura, con archivos Excel como alternativa
- Procesa las devoluciones de envíos de eGesDoc, AYESA, SACYR Proarc, PRODOC/Wood, Document Space/Hyundai, GAIA, Aconex y Sendoc
- Descarga los paquetes de los portales cada 10 minutos y archiva cada PDF devuelto en su carpeta de revisión sin sobrescribir una revisión ya archivada
- Genera portadas para el cliente a partir de plantillas de Word y Excel y el informe mensual de progreso del proveedor
- Escalado de reclamaciones en tres niveles, sobres de DocuSign, vistas departamentales e informes interactivos web y en Excel
- Resúmenes de IA opcionales mediante la API de Claude

## Stack

- Python 3.12+ con una interfaz CustomTkinter
- PostgreSQL en modo de solo lectura mediante psycopg2, además de pandas, openpyxl y calamine
- imaplib, smtplib, APScheduler y keyring para correo, programación y credenciales
- requests con truststore para los portales
- Edición de Word y Excel a nivel de ZIP, con COM para la conversión a PDF
- anthropic para los resúmenes de IA opcionales
