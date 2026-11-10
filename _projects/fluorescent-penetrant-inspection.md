---
layout: project
title: "Fluorescent Penetrant Inspection Test"
description: "Detects liquid penetrant test indications in metallurgy components with a YOLO11l object-detection model."
img: /images/myyolo11.png
img_alt: "Detection of a liquid penetrant test indication on a metallurgy component"
importance: 2
category: ai-vision
project_key: fluorescent-penetrant-inspection
lang: en
page_id: project-fluorescent-penetrant-inspection
permalink: /projects/fluorescent-penetrant-inspection/
nav_key: projects
private: false
tutorial:
links:
  - type: model
    url: https://huggingface.co/jparedesDS/fluorescent-penetrant-inspection
  - type: code
    url: https://github.com/jparedesDS/fluorescent-penetrant-inspection
---

## Overview

Object-detection models for fluorescent penetrant inspection (FPI, DP, LPI, PT) in metallurgy companies. The published model is a YOLO11l checkpoint served on Hugging Face with a single `defecto` label.

## Problem

Liquid penetrant inspection depends on visually locating surface indications. This project trains detection models to find those indications in inspection images.

## Main features

- YOLO11l model published on Hugging Face
- Single supported label: `defecto`
- Ultralytics inference example with `model.predict()`
- Normalised confusion matrix, label samples and validation results documented in the model card

## Stack

- YOLO11 through the Ultralytics library
- Python
