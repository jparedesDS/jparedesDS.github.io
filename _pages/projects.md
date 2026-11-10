---
layout: null
title: "Projects"
lang: en
permalink: /projects/
---
{% assign is_es = false %}
{% if site.active_lang == "es" %}{% assign is_es = true %}{% endif %}
<!doctype html>
<html lang="{% if is_es %}es{% else %}en{% endif %}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="1; url={% if is_es %}/es{% endif %}/#portfolio">
    <link rel="canonical" href="{% if is_es %}/es{% endif %}/#portfolio">
    <title>{% if is_es %}Redirigiendo a los proyectos{% else %}Redirecting to projects{% endif %}</title>
    <script>
      const filter = location.hash.replace("#", "");
      if (["ai-vision", "data-automation", "products", "esports"].includes(filter)) {
        location.replace("{% if is_es %}/es{% endif %}/?filter=" + filter + "#portfolio");
      }
    </script>
  </head>
  <body>
    <p>
      <a href="{% if is_es %}/es{% endif %}/#portfolio">
        {% if is_es %}Continuar a los proyectos{% else %}Continue to projects{% endif %}
      </a>
    </p>
  </body>
</html>
