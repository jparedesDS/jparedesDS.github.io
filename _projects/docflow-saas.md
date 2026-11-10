---
layout: project
title: "DocFlow SaaS"
description: "End-to-end document control for engineering project orders, reading the ERP in read-only mode and archiving every returned PDF."
img: /images/docflow-saas.svg
img_alt: "DocFlow document control dashboard with project documentation status"
importance: 1
category: data-automation
project_key: docflow-saas
lang: en
page_id: project-docflow-saas
permalink: /projects/docflow-saas/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/docflow
---

## Overview

DocFlow Lite is a desktop application for document control on engineering project orders. It follows each order from opening and client transmittals to portal returns, claims, cover sheets and progress reports, reading ERP data in read-only mode and archiving every returned PDF in its network folder.

## Problem

A large order can require hundreds of portal downloads and many document revisions. Doing that by hand is slow and risks overwriting an archived document. DocFlow automates the flow while keeping each revision in the right folder.

## Main features

- Reads the ERP PostgreSQL database in read-only mode, with Excel files as a fallback
- Parses transmittal returns from eGesDoc, AYESA, SACYR Proarc, PRODOC/Wood, Document Space/Hyundai, GAIA, Aconex and Sendoc
- Downloads portal packages every 10 minutes and files each returned PDF into its revision folder without overwriting an archived revision
- Generates client cover sheets from Word and Excel templates and the monthly Vendor Progress Report
- Three-level claim escalation, DocuSign envelopes, departmental views and interactive web and Excel reports
- Optional AI summaries through the Claude API

## Stack

- Python 3.12+ with a CustomTkinter interface
- PostgreSQL in read-only mode through psycopg2, plus pandas, openpyxl and calamine
- imaplib, smtplib, APScheduler and keyring for mail, scheduling and credentials
- requests with truststore for the portals
- Word and Excel editing at ZIP level, with COM for PDF conversion
- anthropic for the optional AI summaries
