---
layout: project
title: "CleanYourMail — Reversible Inbox Cleanup for Coding Agents"
description: "A local, agent-native skill that files newsletters, promotions and spam reversibly — nothing is permanently deleted."
img: /images/cleanyourmail-thumb.png
img_alt: "CleanYourMail banner: your inbox, minus the noise"
importance: 1
category: products
project_key: cleanyourmail
lang: en
page_id: project-cleanyourmail
permalink: /projects/cleanyourmail/
nav_key: projects
private: false
tutorial:
links:
  - type: case_study
    url: /cleanyourmail/
  - type: code
    url: https://github.com/jparedesDS/cleanyourmail
  - type: website
    url: https://jparedesds.github.io/cleanyourmail-web/
  - type: release
    url: https://github.com/jparedesDS/cleanyourmail/releases/tag/v1.1.5
  - type: local_app
    url: https://github.com/jparedesDS/cleanyourmail-app
---

## Overview

A local, agent-native skill that reads email headers, classifies newsletters, promotions, social notifications, cold outreach and spam, and files them into folders or labels. Every move is journaled with COPYUID and Message-ID and can be undone; nothing is permanently deleted.

## Problem

Most inbox cleaners ask for a password, read the mail and delete the evidence. CleanYourMail runs locally, reads headers only and journals every move so it can be reversed.

## Main features

- Scans headers only: no message bodies and no attachments
- Classifies mail into newsletter, promotion, social, notification, cold outreach, spam, transactional and personal
- Protects bank, security, invoice, travel, medical, government, legal, personal, starred, answered and recent mail
- Writes a reviewable `plan.json` before applying any change
- Journals moves with COPYUID and Message-ID, and `undo` restores them
- Unsubscribes through RFC 8058 one-click POST, `mailto:` or a manual link
- Exports rules for Gmail filters and Sieve

## Stack

- Python 3.11+ standard library, no `pip install`
- IMAP and SMTP, with Gmail App Passwords and Microsoft device-code sign-in
- An in-process fake IMAP server for the test suite
