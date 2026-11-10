---
layout: project
title: "CleanYourPhone — Reversible Android Debloat for Coding Agents"
description: "An open-source, reversible Android debloat skill that disables preinstalled apps over ADB without root."
img: /images/cleanyourphone-thumb.png
img_alt: "CleanYourPhone banner: your phone, minus the bloat"
importance: 2
category: products
project_key: cleanyourphone
lang: en
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

## Overview

An open-source, reversible debloat skill for Android built for coding agents. It disables preinstalled apps and services over ADB with no root, no custom ROM and nothing uninstalled, and one command restores the changes the CLI recorded.

## Problem

An app that disables other apps needs root, Shizuku or device-owner privileges. A skill is just text: the agent runs `adb`, shows a plan and asks before touching anything.

## Main features

- Disables with `pm disable-user --user 0`; `pm enable` is the undo
- Backs up package lists, settings, roles, IMEs and `getprop` before the first change
- Refuses protected packages and packages that hold a core role
- Works in batches of five packages, verifying after each batch
- Ships model and firmware profiles across Google, Samsung, Xiaomi, Redmi, POCO and OnePlus
- Can optionally set Private DNS, and produces a report of what changed and why

## Stack

- Python 3.10+ standard-library CLI
- `SKILL.md` with the raw `adb` commands, so no Python is required
- Android SDK Platform-Tools (ADB)
