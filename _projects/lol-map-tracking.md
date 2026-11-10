---
layout: project
title: "LoL Map Tracking Object Detection"
description: "Tracks League of Legends champions on the minimap with a YOLO11m object-detection model."
importance: 7
category: ai-vision
project_key: lol-map-tracking
lang: en
page_id: project-lol-map-tracking
permalink: /projects/lol-map-tracking/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/lol-map-tracking-object-detection
---

## Overview

A YOLO11m model that detects League of Legends champions on the minimap. The model card lists the champions as labels and documents validation with a normalised confusion matrix and prediction batches.

## Problem

Minimap tracking requires recognising every champion from a small icon. The model covers the full champion list as detection labels.

## Main features

- YOLO11m checkpoint for minimap tracking
- Full League of Legends champion label set
- Ultralytics inference example with `model.predict()`
- Validation results, label samples and prediction batches in the model card

## Stack

- YOLO11 through the Ultralytics library
- Python
