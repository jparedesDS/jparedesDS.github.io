---
layout: project
title: "Email MAPI Tools Automation"
description: "Automates documentation entry from Outlook emails into Excel and the ERP database, then sends the processed data back."
img: /images/myemailmapi.png
img_alt: "Email MAPI automation processing an HTML table from Outlook"
importance: 4
category: data-automation
project_key: email-mapi-automation
lang: en
page_id: project-email-mapi-automation
permalink: /projects/email-mapi-automation/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/email-mapi-automation
---

## Overview

A Windows automation that reads HTML tables embedded in Outlook emails, cleans and reshapes the data, updates the ERP database and sends a new email with an Excel attachment.

## Problem

Documentation entry arrived as HTML tables in email and had to be copied into Excel and the ERP by hand. The tool performs that extraction, transformation and notification on a schedule.

## Main features

- Captures email from a configured address every 30 minutes between 07:30 and 17:00
- Extracts the HTML table into a pandas DataFrame and creates the columns needed for the database
- Sends an automated email with the processed data attached as an `.xlsx` file
- Selects recipients from the processed data and updates the database after sending
- Uses Outlook automation on Windows

## Stack

- Python 3
- pandas and NumPy
- BeautifulSoup and regular expressions
- xlsxwriter
- `win32com.client` for Outlook automation
