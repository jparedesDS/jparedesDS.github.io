---
layout: project
title: "OCR Weapon Detection in Counter-Strike 2"
description: "Captures the screen and detects weapon names in Counter-Strike 2 using Optical Character Recognition."
img: /images/ocr-identification.png
img_alt: "Screenshot of the OCR weapon detection tool running over Counter-Strike 2"
importance: 1
category: ai-vision
project_key: ocr-weapon-detection-cs2
lang: en
page_id: project-ocr-weapon-detection-cs2
permalink: /projects/ocr-weapon-detection-cs2/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/OCR-Identification-CS2-Weapons
---

## Overview

This project captures the screen and detects weapon names in Counter-Strike 2 using Optical Character Recognition. It preprocesses the captured image, applies OCR with Tesseract and extracts weapon names from a predefined list.

## Problem

Weapon names are only visible as pixels on the game screen. The tool reads that text directly from a captured frame, so no manual lookup is needed.

## Main features

- Captures the screen in real time
- Applies image preprocessing to enhance text recognition
- Uses Tesseract OCR to extract text from the captured frame
- Matches the extracted text against a predefined weapon list, including AK-47, M4A1-S, M4A1, AWP, FAMAS, Galil, Desert Eagle, USP-S and Glock-18

## Stack

- Python 3
- OpenCV and NumPy
- Tesseract OCR through `pytesseract`
- MSS for screen capture
