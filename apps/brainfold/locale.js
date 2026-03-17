/**
 * Brainfold Marketing – Screenshot Locale Detection
 *
 * Detects the user's browser language and swaps screenshots
 * from screenshots/raw/ (en-US) to screenshots/{locale}/.
 * Also handles iPad screenshots from screenshots/ipad/raw/.
 * Falls back to raw/ (en-US) if the locale isn't available.
 *
 * Usage: Add data-locale-img to iPhone screenshots and
 * data-locale-img-ipad to iPad screenshots.
 */
(function () {
  'use strict';

  var LOCALES = [
    'ar', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el',
    'en', 'en-AU', 'en-GB', 'en-IN', 'en-US',
    'es', 'es-US',
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
    'zh-HK'
  ];

  var LOCALE_SET = {};
  LOCALES.forEach(function (l) { LOCALE_SET[l.toLowerCase()] = l; });

  function resolveLocale(browserLang) {
    if (!browserLang) return null;

    var tag = browserLang.trim();
    var lower = tag.toLowerCase();
    if (LOCALE_SET[lower]) return LOCALE_SET[lower];

    // Chinese variants
    if (lower === 'zh-cn' || lower === 'zh-sg' || lower === 'zh') return null;
    if (lower === 'zh-tw' || lower === 'zh-mo') return 'zh-HK';

    var base = tag.split('-')[0].toLowerCase();
    if (LOCALE_SET[base]) return LOCALE_SET[base];

    if (base === 'pt') return 'pt-PT';
    if (base === 'nb' || base === 'nn' || base === 'no') return 'nb';

    return null;
  }

  function swapScreenshots() {
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    var browserLang = urlLang || navigator.language || navigator.userLanguage;
    var locale = resolveLocale(browserLang);

    if (!locale || locale === 'en-US') return;

    // Swap iPhone screenshots
    var imgs = document.querySelectorAll('img[data-locale-img]');
    imgs.forEach(function (img) {
      var src = img.getAttribute('src');
      if (src && src.indexOf('screenshots/raw/') !== -1) {
        img.setAttribute('src', src.replace('screenshots/raw/', 'screenshots/' + locale + '/'));
      }
    });

    // Swap iPad screenshots
    var ipadImgs = document.querySelectorAll('img[data-locale-img-ipad]');
    ipadImgs.forEach(function (img) {
      var src = img.getAttribute('src');
      if (src && src.indexOf('screenshots/ipad/raw/') !== -1) {
        img.setAttribute('src', src.replace('screenshots/ipad/raw/', 'screenshots/ipad/' + locale + '/'));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', swapScreenshots);
  } else {
    swapScreenshots();
  }
})();
