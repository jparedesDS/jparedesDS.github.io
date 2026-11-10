---
layout: default
title: Tutoriales
permalink: /blog/
lang: es
page_id: blog
nav: true
nav_order: 2
nav_key: blog
pagination:
  enabled: true
  collection: posts
  per_page: 10
  permalink: /page/:num/
  sort_field: date
  sort_reverse: true
---

{% assign active_lang = site.active_lang | default: site.lang | default: 'en' %}
{% assign strings = site.data[active_lang].strings %}
<div class="post">
  <header class="post-header">
    <h1 class="post-title">{{ page.title }}</h1>
    <p class="post-description">{{ strings.blog.description }}</p>
  </header>
  {% include blog-list.liquid %}
</div>
