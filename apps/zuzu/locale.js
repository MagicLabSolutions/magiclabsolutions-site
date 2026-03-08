/**
 * Zuzu Marketing – Screenshot Locale Detection
 *
 * Detects the user's browser language and swaps screenshots
 * from screenshots/raw/ (en-US) to screenshots/{locale}/.
 * Falls back to raw/ (en-US) if the locale isn't available.
 *
 * Usage: Add data-locale-img attribute to any <img> that uses
 * a screenshots/raw/ path. This script runs on DOMContentLoaded.
 */
(function () {
  'use strict';

  // All available locales (must match directory names under screenshots/)
  var LOCALES = [
    'ar', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el',
    'en', 'en-AU', 'en-GB', 'en-IN', 'en-US',
    'es', 'es-419', 'es-US',
    'fi', 'fr', 'fr-CA',
    'gu', 'he', 'hi', 'hr', 'hu',
    'id', 'it', 'ja',
    'kk', 'kn', 'ko',
    'lt', 'ml', 'mr', 'ms',
    'nb', 'nl',
    'or', 'pa', 'pl', 'pt-BR', 'pt-PT',
    'ro', 'ru',
    'sk', 'sl', 'sv',
    'ta', 'te', 'th', 'tr',
    'uk', 'ur',
    'vi',
    'zh-HK', 'zh-Hans', 'zh-Hant'
  ];

  var LOCALE_SET = {};
  LOCALES.forEach(function (l) { LOCALE_SET[l.toLowerCase()] = l; });

  /**
   * Map browser language tag to the best available locale directory.
   * Tries exact match first, then base language, then falls back to null.
   */
  function resolveLocale(browserLang) {
    if (!browserLang) return null;

    var tag = browserLang.trim();

    // Exact match (case-insensitive)
    var lower = tag.toLowerCase();
    if (LOCALE_SET[lower]) return LOCALE_SET[lower];

    // Try common mappings for Chinese variants
    if (lower === 'zh-cn' || lower === 'zh-sg') return 'zh-Hans';
    if (lower === 'zh-tw' || lower === 'zh-mo') return 'zh-Hant';
    if (lower === 'zh') return 'zh-Hans';

    // Try base language (e.g., "de-AT" → "de")
    var base = tag.split('-')[0].toLowerCase();
    if (LOCALE_SET[base]) return LOCALE_SET[base];

    // Try regional fallbacks
    if (base === 'pt') return 'pt-PT';
    if (base === 'nb' || base === 'nn' || base === 'no') return 'nb';

    return null;
  }

  function swapScreenshots() {
    // Prefer navigator.language, fallback to URL param ?lang=xx
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    var browserLang = urlLang || navigator.language || navigator.userLanguage;
    var locale = resolveLocale(browserLang);

    // en-US is the default in screenshots/raw/, no swap needed
    if (!locale || locale === 'en-US') return;

    var imgs = document.querySelectorAll('img[data-locale-img]');
    imgs.forEach(function (img) {
      var src = img.getAttribute('src');
      if (src && src.indexOf('screenshots/raw/') !== -1) {
        img.setAttribute('src', src.replace('screenshots/raw/', 'screenshots/' + locale + '/'));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', swapScreenshots);
  } else {
    swapScreenshots();
  }
})();
