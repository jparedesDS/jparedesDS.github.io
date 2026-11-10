---
layout: project
title: "HLTV Team and Player Stats Scraper"
description: "Scrapes HLTV team and player statistics and computes a weighted performance score for Counter-Strike 2."
img: /images/myhltv.png
img_alt: "HLTV team and player statistics scraped into a table"
importance: 6
category: data-automation
project_key: hltv-scraper
lang: en
page_id: project-hltv-scraper
permalink: /projects/hltv-scraper/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/hltv-scraper
---

## Overview

A Selenium scraper that collects HLTV team and player statistics and writes them to a CSV sorted by player. It also computes a single performance score from win rate, K/D ratio, Rating 2.1 and HLTV Impact.

## Problem

Comparing Counter-Strike 2 players and teams across HLTV pages by hand is slow and inconsistent. The scraper gathers the statistics into one structured file.

## Main features

- Extracts teams, maps played, win rates and lineup statistics
- Collects individual stats such as impact, KAST, opening kills and kill types
- Computes a normalised performance score: 30% win rate, 30% K/D ratio, 20% Rating 2.1 and 20% HLTV Impact
- Writes a CSV with one row per player and the full set of statistics

## Stack

- Python 3.7+
- Selenium and undetected-chromedriver
- BeautifulSoup
- pandas, NumPy and scikit-learn
- openpyxl
