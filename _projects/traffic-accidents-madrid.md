---
layout: project
title: "Analysis of Traffic Accidents"
description: "Analysis and prediction of traffic accidents in the city of Madrid."
img: /images/mytraffic.png
img_alt: "Traffic accident analysis charts for the city of Madrid"
importance: 9
category: data-automation
project_key: traffic-accidents-madrid
lang: en
page_id: project-traffic-accidents-madrid
permalink: /projects/traffic-accidents-madrid/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/lazy-classifier-traffic-accidents-madrid
---

## Overview

Analysis and prediction work on the open traffic-accident dataset for the city of Madrid. The repository documents the dataset structure, the accident types and the severity coding used in the analysis.

## Problem

Madrid publishes one record per person involved in an accident and encodes severity numerically. The data has to be interpreted and prepared before it can be analysed or used for prediction.

## Main features

- Documents the structure of the Madrid traffic-accident dataset
- Explains the accident-type taxonomy, from double collisions to pedestrian hits
- Maps the numeric severity codes to minor, serious and fatal outcomes
- Analyses accidents and builds predictions from the historical data
