---
layout: project
title: "EIPSA ERP"
description: "Role-based ERP desktop application that unifies the daily activities of an industrial company's departments."
img: /images/myERP.png
img_alt: "EIPSA ERP desktop application main window"
importance: 5
category: data-automation
project_key: eipsa-erp
lang: en
page_id: project-eipsa-erp
permalink: /projects/eipsa-erp/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/ERP_EIPSA
---

## Overview

A Windows desktop ERP for an industrial company, covering the daily activities of its departments. Access is role-based, so each user sees the functions of their position, and the data lives in PostgreSQL on a local server.

## Problem

The company's areas needed one system that unified their processes, made them traceable and supported planning and resource optimisation.

## Main features

- Role-based access, with a different part of the application for each position
- Data stored in PostgreSQL on a local server
- Support for the daily activities of the company's sections
- Reports and documents generated from the application data
- Packaged as a single Windows executable with PyInstaller

## Stack

- Python 3.11
- PyQt6 and Tkinter
- PostgreSQL 15 with psycopg2
- pandas and Matplotlib
- openpyxl, docxtpl and PyFPDF
- PyInstaller
