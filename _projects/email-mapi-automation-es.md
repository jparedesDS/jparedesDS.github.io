---
layout: project
title: "Automatización de herramientas MAPI de correo"
description: "Automatiza la entrada de documentación desde correos de Outlook en Excel y la base de datos del ERP, y después reenvía los datos procesados."
img: /images/myemailmapi.png
img_alt: "Automatización MAPI de correo procesando una tabla HTML de Outlook"
importance: 4
category: data-automation
project_key: email-mapi-automation
lang: es
page_id: project-email-mapi-automation
permalink: /projects/email-mapi-automation/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/email-mapi-automation
---

## Resumen

Una automatización de Windows que lee tablas HTML incrustadas en correos de Outlook, limpia y remodela los datos, actualiza la base de datos del ERP y envía un nuevo correo con un Excel adjunto.

## Problema

La entrada de documentación llegaba como tablas HTML por correo y había que copiarla a Excel y al ERP a mano. La herramienta realiza esa extracción, transformación y notificación de forma programada.

## Funcionalidades principales

- Captura el correo de una dirección configurada cada 30 minutos entre las 07:30 y las 17:00
- Extrae la tabla HTML a un DataFrame de pandas y crea las columnas necesarias para la base de datos
- Envía un correo automático con los datos procesados adjuntos en un archivo `.xlsx`
- Selecciona los destinatarios a partir de los datos procesados y actualiza la base de datos tras el envío
- Usa la automatización de Outlook en Windows

## Stack

- Python 3
- pandas y NumPy
- BeautifulSoup y expresiones regulares
- xlsxwriter
- `win32com.client` para la automatización de Outlook
