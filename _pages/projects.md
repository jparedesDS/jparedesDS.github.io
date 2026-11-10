---
layout: page
title: Projects
permalink: /projects/
lang: en
page_id: projects
nav: true
nav_order: 3
nav_key: projects
description: "AI, data, products and esports projects built end to end."
---

{% assign active_lang = site.active_lang | default: site.lang | default: 'en' %}
{% assign strings = site.data[active_lang].strings %}
{% assign featured = site.projects | where: "project_key", "subany-video" | first %}
<div class="projects-index">
  {% if featured %}
    <section class="featured-project" aria-labelledby="featured-project-title">
      <h2 id="featured-project-title">{{ strings.projects.featured }}</h2>
      {% include project-card.liquid project=featured featured=true %}
    </section>
  {% endif %}
  {% assign categories = "ai-vision,data-automation,products,esports" | split: "," %}
  {% for category in categories %}
    {% assign projects = site.projects | where: "category", category | sort: "importance" %}
    {% if category == "products" %}
      {% assign projects = projects | where_exp: "p", "p.project_key != 'subany-video'" %}
    {% endif %}
    <section id="{{ category }}" class="project-category-section" aria-labelledby="{{ category }}-title">
      <h2 id="{{ category }}-title">{{ strings.project_categories[category] }}</h2>
      <div class="project-grid">
        {% for project in projects %}
          {% include project-card.liquid project=project %}
        {% endfor %}
      </div>
    </section>
  {% endfor %}
</div>
