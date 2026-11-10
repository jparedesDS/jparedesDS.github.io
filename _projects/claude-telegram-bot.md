---
layout: project
title: "Claude Telegram Bot"
description: "Telegram bridge for Claude Code: notifications, approvals and remote control from your phone."
img: /images/telegram-bot.png
img_alt: "Claude Telegram bot approval message on a phone"
importance: 5
category: products
project_key: claude-telegram-bot
lang: en
page_id: project-claude-telegram-bot
permalink: /projects/claude-telegram-bot/
nav_key: projects
private: false
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/claude-telegram
---

## Overview

A Telegram bridge for Claude Code that sends notifications, lets you approve or reject tool executions from your phone and forwards messages to active sessions. It can monitor several sessions at once.

## Problem

Claude Code sessions that need approval or attention interrupt work away from the computer. The bridge moves those prompts and controls to Telegram.

## Main features

- Notifications when Claude Code needs approval, hits an error or finishes a task
- Approve or reject tool executions from Telegram
- Send messages to active Claude Code sessions
- Monitor multiple sessions at once
- Commands for status, mute, unmute and asking a specific session
- Graceful degradation when the bot is not running

## Stack

- Python 3.11+
- Claude Code hooks that post to a local HTTP server on port 7483
- Telegram Bot API
