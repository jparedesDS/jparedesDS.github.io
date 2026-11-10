---
layout: project
title: "Twitter Sentiment Analysis"
description: "Identifies positive and negative sentiment in tweets and explores their natural-language characteristics."
img: /images/mytwittersentiment.png
img_alt: "Sentiment distribution charts from Twitter data"
importance: 8
category: data-automation
project_key: twitter-sentiment-analysis
lang: en
page_id: project-twitter-sentiment-analysis
permalink: /projects/twitter-sentiment-analysis/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/tensorflow-twitter-sentiment-analysis
---

## Overview

A study of positive and negative sentiment in tweets that also explores natural-language characteristics such as word frequency, hashtags and mentions. It visualises sentiment distribution and trends over time.

## Problem

Twitter produces a large volume of opinion. The project classifies sentiment automatically and looks at the language features behind each trend.

## Main features

- Classifies tweets as positive, negative or neutral
- Explores word frequency, hashtags and mentions
- Identifies topics and hashtags associated with viral discussion
- Generates plots and word clouds for sentiment distribution and trends

## Stack

- Python
- tweepy for the Twitter API
- pandas and NumPy
- Matplotlib and Seaborn
- TextBlob or VADER for sentiment analysis
