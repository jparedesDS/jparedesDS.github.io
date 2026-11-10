---
layout: project
title: "Gestión de citas para talleres de reparación de automóviles"
description: "Gestión de citas y clientes autoalojada para talleres de reparación, ejecutada en la red local."
img: /images/workshop-scheduler.svg
img_alt: "Tablero diario de citas por bahía de Ritmo Talleres"
importance: 3
category: products
project_key: workshop-scheduler
lang: es
page_id: project-workshop-scheduler
permalink: /projects/workshop-scheduler/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/talleres-ritmo
---

## Resumen

Un sistema autoalojado de programación de citas y gestión de clientes y vehículos para un taller de reparación. Se ejecuta en un ordenador de la red local del taller, con una agenda organizada por bahía de servicio y sincronización en tiempo real entre todas las pantallas.

## Problema

Un taller tiene que coordinar las citas por bahía y mecánico, mantener los registros de clientes y vehículos y avisar de las próximas inspecciones técnicas, sin depender de una conexión a internet.

## Funcionalidades principales

- Agenda diaria y semanal con arrastrar y soltar, organizada por bahía de servicio
- Ciclo de vida completo de la cita, desde pendiente hasta entregada, además de ausencias y cancelaciones
- Registros de clientes y vehículos con avisos de caducidad de la ITV
- Notificaciones al cliente por WhatsApp, correo electrónico o copiadas
- Acceso por roles para administrador, recepción y mecánico, aplicado en el servidor
- Informes exportables a CSV y copias de seguridad diarias de SQLite con una carpeta externa opcional
- Actualizaciones en tiempo real entre pantallas sin recargar

## Stack

- Node.js 22+ con `node:sqlite`, `node:http` y `node:crypto`, sin dependencias externas
- HTML, CSS y JavaScript sin framework
- Base de datos SQLite
