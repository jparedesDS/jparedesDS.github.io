---
title: "CleanYourPhone"
summary: "Reversible Android debloating over ADB, with no root and a one-command undo."
category: "products"
year: "2026"
image: "/images/cleanyourphone-thumb.png"
imageAlt: "CleanYourPhone interface"
links:
  - label: "Website"
    url: "https://jparedesds.github.io/cleanyourphone-web/"
    external: true
  - label: "Code"
    url: "https://github.com/jparedesDS/clean-your-phone"
    external: true
order: 5
---

## Problem

Most Android phones ship with preinstalled apps and services that cannot be removed through the normal settings. The usual tools for disabling them need root, Shizuku or device-owner privileges, and an aggressive debloat can leave a phone in a state that is hard to reverse.

## Approach

CleanYourPhone is an open-source, reversible debloat skill for Android built for coding agents. It disables preinstalled packages over ADB with `pm disable-user --user 0`, and `pm enable` is the undo. Nothing is uninstalled and no root or custom ROM is required. Before the first change it backs up package lists, settings, roles, input methods and `getprop`, and it refuses protected packages and packages that hold a core role. Changes are applied in batches of five with verification after each batch. The project ships model and firmware profiles for Google, Samsung, Xiaomi, Redmi, POCO and OnePlus, can optionally set Private DNS, and produces a report of what changed and why.

## Result

Users can remove bloat from a phone without rooting it or losing the ability to restore it, because the CLI records every change and can put it back with one command. The same instructions work for a person following them manually or for an agent running the ADB commands.
