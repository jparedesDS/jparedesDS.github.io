---
layout: project
title: "Image & Vision Classification of Futurama Frames"
description: "Multi-label classification of Futurama characters in video frames, 2nd public and 3rd private in a Kaggle competition."
img: /images/myimage-classification.png
img_alt: "Futurama frame classified by character with the ResNet152 model"
importance: 5
category: ai-vision
project_key: futurama-image-classification
lang: en
page_id: project-futurama-image-classification
permalink: /projects/futurama-image-classification/
nav_key: projects
private: false
tutorial:
links:
  - type: kaggle
    url: https://www.kaggle.com/competitions/comp-mediavida-2-futurama/leaderboard
  - type: code
    url: https://github.com/jparedesDS/image-classification-multilabel
---

## Overview

Two approaches to multi-label classification of Futurama characters in video frames, built for the Mediavida Kaggle competition. A custom Keras CNN and a ResNet152 model pretrained on ImageNet reached 2nd place on the public leaderboard and 3rd place on the private one.

## Problem

The competition asked for the characters present in each frame, a multi-label problem scored with Mean Columnwise Root Mean Square Error (MCRMSE).

## Main features

- Custom Keras CNN for character identification, with an MCRMSE of 0.12527
- ResNet152 pretrained on ImageNet_v2, with an MCRMSE of 0.09149
- Public notebooks for both approaches on Kaggle
- 2nd place on the public leaderboard and 3rd place on the private leaderboard

## Stack

- Python
- Keras and TensorFlow for the custom CNN
- PyTorch and torchvision for ResNet152
- NumPy, pandas, Matplotlib and Seaborn
