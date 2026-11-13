---
title: About Us
subtitle: Two brothers building apps they genuinely use.
description: We design, build, and support native mobile apps for iOS and Android that feel perfectly at home on every device.
permalink: /about/
lang-ref: about
---

{% assign t = site.data.translations[site.active_lang] %}
{% if t.about.content %}
{{ t.about.content | markdownify }}
{% else %}
<div class="about-photo" style="display: flex; justify-content: center;">
  <img src="/images/evandro_fabio.jpeg" alt="Evandro and Fabio" style="width: 225px; height: 300px; object-fit: cover;" />
</div>

Hi! We're Evandro and Fabio — two brothers from Brazil building apps we genuinely use ourselves. We care a lot about making them useful, simple, and enjoyable. If you have ideas, feedback, or something isn't working right, we'd really love to hear from you.

<div class="about-socials">
  <a href="https://www.linkedin.com/in/evandro-harrison-hoffmann" target="_blank">
    <i class="fab fa-linkedin" aria-hidden="true"></i> Evandro
  </a>
  <a href="https://www.linkedin.com/in/fabio-gustavo-hoffmann-03931625" target="_blank">
    <i class="fab fa-linkedin" aria-hidden="true"></i> Fabio
  </a>
</div>

---

## What We Build

* Native iOS apps with Swift and SwiftUI — buttery-smooth navigation and custom transitions
* Cross-platform experiences for both iPhone/iPad and Android
* Universal layouts that adapt beautifully across devices and screen sizes
* Widgets, Live Activities, and platform-specific extensions that surface the right info at the right time
* Privacy-first storage with secure sync across devices

## How We Deliver

* Discovery sprints to clarify user needs, product vision, and launch goals
* Interactive prototypes and design systems aligned with platform guidelines
* Modular architectures (MVVM, async/await) and automated testing for confident scaling
* Performance tuning, accessibility audits, and crash monitoring to keep experiences polished
* Launch support — from beta testing to store submissions, release notes, and ASO follow-through

---

Ready to build something magical? [Drop us a message](/contact).
{% endif %}

<style>
.team { margin: 64px auto 8px; max-width: 760px; }
.team h2 { margin-bottom: 8px; }
.team .team-intro { color: #6b7280; margin: 0 0 28px; font-size: 16px; }
.team-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
.team-member {
  display: flex; align-items: center; gap: 16px;
  padding: 20px; background: #FFFFFF;
  border: 1px solid rgba(0,0,0,0.07); border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.05);
}
.team-avatar {
  flex: 0 0 auto; width: 48px; height: 48px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--app-accent, #3B82F6); color: #FFFFFF;
  font-weight: 700; font-size: 15px; letter-spacing: 0.02em;
}
.team-member .team-body { min-width: 0; }
.team-member h3 { margin: 0 0 2px; font-size: 17px; line-height: 1.25; color: #1f2937; }
.team-member .team-role { margin: 0 0 6px; color: #6b7280; font-size: 14px; }
.team-member .team-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 500; color: var(--app-accent, #3B82F6);
}
.team-member .team-link:hover { text-decoration: underline; }
@media (max-width: 600px) { .team-grid { grid-template-columns: 1fr; } }
</style>

<section class="team" aria-labelledby="team-heading">
  <h2 id="team-heading">The team</h2>
  <p class="team-intro">A small group behind Magic Lab Solutions.</p>
  <div class="team-grid">
    <article class="team-member">
      <span class="team-avatar" aria-hidden="true">EH</span>
      <div class="team-body">
        <h3>Evandro Harrison Hoffmann</h3>
        <p class="team-role">Co-founder</p>
        <a class="team-link" href="https://www.linkedin.com/in/evandro-harrison-hoffmann" target="_blank" rel="noopener">
          <i class="fab fa-linkedin" aria-hidden="true"></i> LinkedIn
        </a>
      </div>
    </article>
    <article class="team-member">
      <span class="team-avatar" aria-hidden="true">FH</span>
      <div class="team-body">
        <h3>Fabio Hoffmann</h3>
        <p class="team-role">Co-founder</p>
        <a class="team-link" href="https://www.linkedin.com/in/fabio-gustavo-hoffmann-03931625" target="_blank" rel="noopener">
          <i class="fab fa-linkedin" aria-hidden="true"></i> LinkedIn
        </a>
      </div>
    </article>
    <article class="team-member">
      <span class="team-avatar" aria-hidden="true">RP</span>
      <div class="team-body">
        <h3>Ruchi Parijat</h3>
        <p class="team-role">Senior Product Manager</p>
        <a class="team-link" href="https://www.linkedin.com/in/ruchiparijat" target="_blank" rel="noopener">
          <i class="fab fa-linkedin" aria-hidden="true"></i> LinkedIn
        </a>
      </div>
    </article>
  </div>
</section>
