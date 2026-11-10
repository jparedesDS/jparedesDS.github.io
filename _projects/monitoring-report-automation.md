---
layout: project
title: "Monitoring Report Automation"
description: "Reduces report generation time and manual data-entry errors by turning ERP exports into styled Excel reports."
importance: 11
category: data-automation
project_key: monitoring-report-automation
lang: en
page_id: project-monitoring-report-automation
permalink: /projects/monitoring-report-automation/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/monitoring-report
---

## Overview

A script that turns an ERP export into a styled Excel monitoring report. It cleans the data, splits documents by status and writes one sheet per view.

## Problem

Preparing the document monitoring report by hand took time and was prone to manual data-entry errors. The script performs the repeated cleaning, grouping and formatting automatically.

## Main features

- Imports the ERP Excel file, fills null values and converts dates
- Groups the documents into sent, not sent, commented and approved sets
- Calculates return days, contract weeks and additional notes
- Writes styled sheets for all documents, sent, not sent, commented and a general status chart
- Applies custom cell styles according to document status

## Stack

- Python
- pandas
- xlsxwriter and openpyxl
- tqdm and aspose-cells
