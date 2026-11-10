---
layout: project
title: "Data Extraction from DXF Files"
description: "Extracts entities from DXF technical drawings and regenerates them in a user-defined format for automated documentation."
img: /images/mydxf.png
img_alt: "Entities extracted from an engineering DXF drawing"
importance: 3
category: ai-vision
project_key: dxf-data-extraction
lang: en
page_id: project-dxf-data-extraction
permalink: /projects/dxf-data-extraction/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/extract-data-dxf
---

## Overview

A Python script that extracts entities from DXF technical drawings and writes them into a new DXF with a user-defined format. It handles lines, circles, arcs, polylines, text and dimensions, and also produces a vector representation of the file.

## Problem

Technical drawings carry entity data that must be identified and reformatted before it can feed automated documentation workflows.

## Main features

- Extracts data from a wide variety of DXF entities
- Regenerates the entities in a custom output format
- Handles both 2D and 3D entities
- Produces a vector representation for visualisation or further processing
- Runs from the command line with an input DXF path

## Stack

- Python 3
- `ezdxf`
