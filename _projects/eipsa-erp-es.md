---
layout: project
title: "EIPSA ERP"
description: "Aplicación de escritorio ERP con acceso por roles que unifica la actividad diaria de los departamentos de una empresa industrial."
img: /images/myERP.png
img_alt: "Ventana principal de la aplicación de escritorio EIPSA ERP"
importance: 5
category: data-automation
project_key: eipsa-erp
lang: es
page_id: project-eipsa-erp
permalink: /projects/eipsa-erp/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/ERP_EIPSA
---

## Resumen

Un ERP de escritorio para Windows para una empresa industrial, que cubre la actividad diaria de sus departamentos. El acceso se basa en roles, de modo que cada usuario ve las funciones de su puesto, y los datos residen en PostgreSQL en un servidor local.

## Problema

Las áreas de la empresa necesitaban un único sistema que unificara sus procesos, los hiciera trazables y permitiera planificar y optimizar recursos.

## Funcionalidades principales

- Acceso por roles, con una parte distinta de la aplicación para cada puesto
- Datos almacenados en PostgreSQL en un servidor local
- Soporte para la actividad diaria de las secciones de la empresa
- Informes y documentos generados a partir de los datos de la aplicación
- Empaquetado como un único ejecutable de Windows con PyInstaller

## Stack

- Python 3.11
- PyQt6 y Tkinter
- PostgreSQL 15 con psycopg2
- pandas y Matplotlib
- openpyxl, docxtpl y PyFPDF
- PyInstaller
