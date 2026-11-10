---
layout: project
title: "Polymarket Auto-Betting Bot"
description: "Automated trading bot for BTC prediction markets on Polymarket with limit orders and Telegram controls."
img: /images/polymarket.png
img_alt: "Polymarket auto-betting bot dashboard in Telegram"
importance: 6
category: products
project_key: polymarket-autobetting
lang: en
page_id: project-polymarket-autobetting
permalink: /projects/polymarket-autobetting/
nav_key: projects
private: true
tutorial:
links:
  - type: code
    url: https://github.com/jparedesDS/polymarket-autobetting
    private: true
---

## Overview

Automated trading bot for BTC prediction markets (UP/DOWN 5m and 15m) on Polymarket. It uses limit maker orders at 45¢, Kelly criterion with Monte Carlo backtesting for position sizing, a bail-out mechanism when only one leg fills, and gasless auto-redeem with on-chain fallback. It includes a Telegram bot for a real-time dashboard, alerts and controls.

> Private repository. Implementation details are not disclosed.
