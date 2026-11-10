---
layout: project
title: "Twitter - Sentiment Analysis with Emojis"
description: "Classifies the emotional tone of tweets from their emoji usage with natural language processing."
img: /images/myemoji.png
img_alt: "Emoji frequency and sentiment charts from Twitter data"
importance: 7
category: data-automation
project_key: twitter-sentiment-emojis
lang: en
page_id: project-twitter-sentiment-emojis
permalink: /projects/twitter-sentiment-emojis/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/NLP-sentiment-analysis-with-emojis
---

## Overview

A notebook study of how emojis in tweets relate to emotional tone. It extracts and counts emojis, explores their distribution by account and applies natural-language processing to classify sentiment.

## Problem

Emojis carry sentiment that plain text analysis can miss. The project uses them as sentiment indicators and studies their relationship with the rest of the tweet.

## Main features

- Cleans and normalises tweet text and extracts emojis
- Visualises emoji frequency and the distribution of tweets per account
- Analyses correlations between popular accounts and their emoji usage
- Classifies tweets into sentiment categories with NLP
- Produces charts and tables linking emoji usage to the detected sentiment

## Stack

- Python
- pandas and NumPy
- Matplotlib and Seaborn
- NLTK
- Jupyter Notebook
