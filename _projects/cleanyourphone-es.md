---
layout: project
title: "CleanYourPhone: debloat de Android reversible para agentes de código"
description: "Una skill de código abierto que hace debloat en Android de forma reversible y desactiva aplicaciones preinstaladas por ADB sin root."
img: /images/cleanyourphone-thumb.png
img_alt: "Banner de CleanYourPhone: tu teléfono, sin el bloatware"
importance: 2
category: products
project_key: cleanyourphone
lang: es
page_id: project-cleanyourphone
permalink: /projects/cleanyourphone/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/clean-your-phone
  - type: website
    url: https://jparedesds.github.io/cleanyourphone-web/
---

## Resumen

Una skill de debloat reversible para Android, de código abierto, creada para agentes de código. Desactiva aplicaciones y servicios preinstalados por ADB sin root, sin ROM personalizada y sin desinstalar nada; un solo comando restaura los cambios que registró la CLI.

## Problema

Una aplicación que desactiva otras aplicaciones necesita root, Shizuku o privilegios de propietario del dispositivo. Una skill es solo texto: el agente ejecuta `adb`, muestra un plan y pregunta antes de tocar nada.

## Funcionalidades principales

- Desactiva con `pm disable-user --user 0`; `pm enable` es la forma de deshacerlo
- Hace copia de listas de paquetes, ajustes, roles, IME y `getprop` antes del primer cambio
- Rechaza paquetes protegidos y paquetes que ocupan un rol esencial
- Trabaja en lotes de cinco paquetes, verificando después de cada lote
- Incluye perfiles de modelo y firmware de Google, Samsung, Xiaomi, Redmi, POCO y OnePlus
- Puede configurar opcionalmente DNS privado y genera un informe de qué cambió y por qué

## Stack

- CLI de Python 3.10+ con biblioteca estándar
- `SKILL.md` con los comandos `adb` directos, así que no hace falta Python
- Android SDK Platform-Tools (ADB)
