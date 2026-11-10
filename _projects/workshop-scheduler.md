---
layout: project
title: "Appointment Management for Auto Repair Shops"
description: "Self-hosted appointment and customer management for auto repair shops, running on the local network."
img: /images/workshop-scheduler.svg
img_alt: "Ritmo Talleres daily appointment board by service bay"
importance: 3
category: products
project_key: workshop-scheduler
lang: en
page_id: project-workshop-scheduler
permalink: /projects/workshop-scheduler/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/talleres-ritmo
---

## Overview

A self-hosted scheduling and customer/vehicle management system for an auto repair shop. It runs on one computer on the shop's local network, with an agenda organised by service bay and real-time sync across every screen.

## Problem

A garage has to coordinate appointments by bay and mechanic, keep customer and vehicle records and warn about upcoming roadworthiness tests, without depending on an internet connection.

## Main features

- Drag-and-drop day and week agenda organised by service bay
- Full appointment lifecycle from pending to delivered, plus no-show and cancelled
- Customer and vehicle records with ITV expiry alerts
- WhatsApp, email or copied customer notifications
- Role-based access for administrator, reception and mechanic, enforced on the server
- Reports exportable to CSV and daily SQLite backups with an optional external copy folder
- Real-time updates across screens without refreshing

## Stack

- Node.js 22+ using `node:sqlite`, `node:http` and `node:crypto`, with zero external dependencies
- HTML, CSS and JavaScript without a framework
- SQLite database
