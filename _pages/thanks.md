---
title: Thank You!
subtitle: Your message was sent successfully.
description: Thank you for reaching out to Magic Lab Solutions.
permalink: /thanks/
lang-ref: thanks
---

{% assign t = site.data.translations[site.active_lang] %}

{{ t.thanks.message | default: "We appreciate you getting in touch! We'll review your message and get back to you as soon as possible." }}

{{ t.thanks.secondary | default: "In the meantime, feel free to explore our apps or learn more about what we do." }}

<div style="display: flex; gap: 12px; justify-content: center; margin-top: 2rem;">
  <a href="/apps/" class="button button--large">{{ t.thanks.explore_apps | default: "Explore Our Apps" }}</a>
  <a href="/about" class="button button--large">{{ t.thanks.about_us | default: "About Us" }}</a>
</div>
