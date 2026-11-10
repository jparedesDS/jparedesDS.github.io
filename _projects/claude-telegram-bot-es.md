---
layout: project
title: "Bot de Telegram para Claude"
description: "Puente de Telegram para Claude Code: notificaciones, aprobaciones y control remoto desde el móvil."
img: /images/telegram-bot.png
img_alt: "Mensaje de aprobación del bot de Telegram de Claude en un móvil"
importance: 5
category: products
project_key: claude-telegram-bot
lang: es
page_id: project-claude-telegram-bot
permalink: /projects/claude-telegram-bot/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/claude-telegram
---

## Resumen

Un puente de Telegram para Claude Code que envía notificaciones, permite aprobar o rechazar ejecuciones de herramientas desde el móvil y reenvía mensajes a las sesiones activas. Puede monitorizar varias sesiones a la vez.

## Problema

Las sesiones de Claude Code que necesitan aprobación o atención interrumpen el trabajo cuando estás lejos del ordenador. El puente traslada esos avisos y controles a Telegram.

## Funcionalidades principales

- Notificaciones cuando Claude Code necesita aprobación, encuentra un error o termina una tarea
- Aprobar o rechazar ejecuciones de herramientas desde Telegram
- Enviar mensajes a sesiones activas de Claude Code
- Monitorizar varias sesiones a la vez
- Comandos para estado, silenciar, activar y preguntar a una sesión concreta
- Degradación elegante cuando el bot no está en ejecución

## Stack

- Python 3.11+
- Hooks de Claude Code que publican en un servidor HTTP local en el puerto 7483
- API de Telegram Bot
