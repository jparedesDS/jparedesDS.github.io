---
layout: project
title: "CleanYourMail: limpieza de bandeja de entrada reversible para agentes de código"
description: "Una skill local y nativa para agentes que archiva boletines, promociones y spam de forma reversible: nada se elimina de forma permanente."
img: /images/cleanyourmail-thumb.png
img_alt: "Banner de CleanYourMail: tu bandeja de entrada, sin el ruido"
importance: 1
category: products
project_key: cleanyourmail
lang: es
page_id: project-cleanyourmail
permalink: /projects/cleanyourmail/
nav_key: projects
private: false
tutorial:
links:
  - type: case_study
    url: /cleanyourmail/
  - type: code
    url: https://github.com/jparedesDS/cleanyourmail
  - type: website
    url: https://jparedesds.github.io/cleanyourmail-web/
  - type: release
    url: https://github.com/jparedesDS/cleanyourmail/releases/tag/v1.1.5
  - type: local_app
    url: https://github.com/jparedesDS/cleanyourmail-app
---

## Resumen

Una skill local y nativa para agentes que lee las cabeceras de correo, clasifica boletines, promociones, notificaciones sociales, contacto en frío y spam, y los archiva en carpetas o etiquetas. Cada movimiento queda registrado con COPYUID y Message-ID y se puede deshacer; nada se elimina de forma permanente.

## Problema

La mayoría de los limpiadores de bandeja de entrada piden una contraseña, leen el correo y borran la evidencia. CleanYourMail se ejecuta en local, lee solo las cabeceras y registra cada movimiento para poder revertirlo.

## Funcionalidades principales

- Analiza solo las cabeceras: ni cuerpos de mensaje ni adjuntos
- Clasifica el correo en boletín, promoción, social, notificación, contacto en frío, spam, transaccional y personal
- Protege el correo bancario, de seguridad, facturas, viajes, médico, gubernamental, legal, personal, marcado con estrella, respondido y reciente
- Escribe un `plan.json` revisable antes de aplicar cualquier cambio
- Registra los movimientos con COPYUID y Message-ID, y `undo` los restaura
- Cancela suscripciones mediante POST de un clic RFC 8058, `mailto:` o un enlace manual
- Exporta reglas para filtros de Gmail y Sieve

## Stack

- Biblioteca estándar de Python 3.11+, sin `pip install`
- IMAP y SMTP, con contraseñas de aplicación de Gmail e inicio de sesión por código de dispositivo de Microsoft
- Un servidor IMAP falso en proceso para la batería de pruebas
