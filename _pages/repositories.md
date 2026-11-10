---
layout: page
title: Repositories
permalink: /repositories/
lang: en
page_id: repositories
nav: true
nav_order: 4
nav_key: repositories
description: "Curated public repositories and models."
---

{% assign active_lang = site.active_lang | default: site.lang | default: 'en' %}
{% assign strings = site.data[active_lang].strings %}
{% assign repositories = site.data[active_lang].repositories %}
<div class="repositories-page">
  <header class="repositories-header">
    <p class="repositories-kicker">GitHub</p>
    <h2 class="repositories-name">{{ repositories.profile.name }}</h2>
    <p class="repositories-handle">@{{ repositories.profile.username }}</p>
    <p class="repositories-description">{{ repositories.profile.description }}</p>
    <a class="repositories-profile-link" href="{{ repositories.profile.url }}" target="_blank" rel="noopener noreferrer">
      {{- strings.repositories.view_profile -}}
    </a>
  </header>

  <p class="repositories-count">
    {{ repositories.repos.size }} {{ strings.repositories.repo_count }}
  </p>

  <ul class="repositories-grid">
    {% for repo in repositories.repos %}
      <li class="repository-card">
        <div class="repository-card-header">
          <h3 class="repository-card-title">
            {% if repo.private %}
              {{ repo.name }}
            {% else %}
              <a href="{{ repo.url }}" target="_blank" rel="noopener noreferrer">{{ repo.name }}</a>
            {% endif %}
          </h3>
          {% if repo.private %}
            <span class="repository-private">{{ strings.repositories.private }}</span>
          {% endif %}
        </div>
        {% if repo.description %}
          <p class="repository-card-description">{{ repo.description }}</p>
        {% endif %}
        <div class="repository-card-meta">
          {% if repo.language %}
            <span class="repository-language">{{ repo.language }}</span>
          {% endif %}
        </div>
      </li>
    {% endfor %}
  </ul>

  <p class="repositories-footer-link">
    <a href="{{ repositories.profile.url }}" target="_blank" rel="noopener noreferrer">
      {{- strings.repositories.view_profile -}}
    </a>
  </p>
</div>
