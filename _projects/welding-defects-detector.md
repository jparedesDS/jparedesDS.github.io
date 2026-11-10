---
layout: project
title: "Welding Defects Detector"
description: "Detects welding defects in metallurgy inspection images with a YOLO11x object-detection model."
img: /images/mywelding.jpg
img_alt: "Welding defect detection result on a metallurgy inspection image"
importance: 4
category: ai-vision
project_key: welding-defects-detector
lang: en
page_id: project-welding-defects-detector
permalink: /projects/welding-defects-detector/
nav_key: projects
private: false
tutorial:
links:
  - type: model
    url: https://huggingface.co/jparedesDS/welding-defects-detection
  - type: code
    url: https://github.com/jparedesDS/welding-defects-detection
---

## Overview

A YOLO11x object-detection model for welding defects in metallurgy inspection images. It is published on Hugging Face with four labels: `Defect`, `Welding Line`, `Workpiece` and `porosity`.

## Problem

Welding inspection has to locate defects and tell them apart from the weld line and the workpiece itself. The model performs that detection on inspection images.

## Main features

- YOLO11x checkpoint published on Hugging Face
- Four supported labels: `Defect`, `Welding Line`, `Workpiece` and `porosity`
- Ultralytics inference example with `model.predict()`
- Normalised confusion matrix, label samples, correlogram and prediction batches in the model card

## Stack

- YOLO11 through the Ultralytics library
- Python
