---
title: "DocFlow"
summary: "Multi-tenant document control that keeps project files archived, searchable and auditable."
category: "data-automation"
year: "2024"
image: "/images/docflow.svg"
imageAlt: "DocFlow"
links:
  - label: "Code"
    url: "https://github.com/jparedesDS/docflow"
    external: true
order: 2
---

## Problem

A large engineering project order can generate hundreds of documents, and each one can come back several times as new revisions. Tracking that by hand is slow and easy to get wrong: a returned document can overwrite an earlier version, a claim can be missed, and nobody has a single view of what is still outstanding.

## Approach

DocFlow is multi-tenant document control built around engineering project orders. It reads the project data it needs in read-only mode and ingests returned documents from external systems. Every revision is archived beside its previous versions instead of replacing them, so the history stays intact. From the same data it generates cover sheets and progress reports, tracks claim escalation, and gives each department its own view. Optional AI summaries condense long documents for people who need the gist before opening the file.

## Result

Document controllers follow an order from start to finish in one place. Files stay archived, searchable and auditable, returned documents no longer overwrite earlier revisions, and progress reporting comes from the same source as the document record. The product is used as a multi-tenant service, with each organisation working in its own space.
