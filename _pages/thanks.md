---
title: Thank You!
subtitle: Your message was sent successfully.
description: Thank you for reaching out to Magic Lab Solutions.
permalink: /thanks/
lang-ref: thanks
---
{% assign t = site.data.translations[site.active_lang] %}

{{ t.thanks.message }}

{{ t.thanks.secondary }}

<div style="display: flex; gap: 12px; justify-content: center; margin-top: 2rem;">
  <a href="/apps/" class="button button--large">{{ t.thanks.explore_apps }}</a>
  <a href="/about" class="button button--large">{{ t.thanks.about_us }}</a>
</div>
