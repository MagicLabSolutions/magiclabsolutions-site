#!/usr/bin/env python3
"""
Seed translation YAML files for jekyll-polyglot.
Reads the English base file, translates UI strings via Google Translate,
and reads fastlane metadata for app descriptions where available.
"""

import os
import time
import yaml
from deep_translator import GoogleTranslator

SITE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRANSLATIONS_DIR = os.path.join(SITE_DIR, "_data", "translations")
FASTLANE_ROOTS = {
    "zuzu_ios": os.path.expanduser(
        "~/Development/MagicLabSolutions/Zuzu/fastlane/metadata"
    ),
    "zuzu_android": os.path.expanduser(
        "~/Development/MagicLabSolutions/ZuzuAndroid/fastlane/metadata/android"
    ),
}

# Map polyglot language codes to fastlane locale directories
FASTLANE_LOCALE_MAP = {
    "de": ["de-DE", "de"],
    "es": ["es-ES", "es"],
    "fr": ["fr-FR", "fr"],
    "pt-BR": ["pt-BR"],
    "ja": ["ja", "ja-JP"],
    "ko": ["ko", "ko-KR"],
    "zh-Hans": ["zh-Hans", "zh-CN"],
}

# Map polyglot language codes to Google Translate codes
GOOGLE_LANG_MAP = {
    "zh-Hans": "zh-CN",
    "pt-BR": "pt",
}

LANGUAGES = ["de", "es", "fr", "pt-BR", "ja", "ko", "zh-Hans"]


def load_yaml(path):
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def save_yaml(data, path):
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(
            data,
            f,
            default_flow_style=False,
            allow_unicode=True,
            sort_keys=False,
            width=200,
        )


def read_fastlane_file(root, locale_codes, filename):
    """Try to read a fastlane metadata file for a given locale."""
    for code in locale_codes:
        path = os.path.join(root, code, filename)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return f.read().strip()
    return None


def translate_text(text, dest_lang, retries=3):
    """Translate a string, with retries for rate limiting."""
    if not text or not text.strip():
        return text

    google_lang = GOOGLE_LANG_MAP.get(dest_lang, dest_lang)

    for attempt in range(retries):
        try:
            result = GoogleTranslator(source="en", target=google_lang).translate(text)
            return result if result else text
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  Rate limited, waiting {wait}s... ({e})")
                time.sleep(wait)
            else:
                print(f"  FAILED to translate: {text[:50]}... ({e})")
                return text


def translate_dict(data, dest_lang, path=""):
    """Recursively translate all string values in a dict."""
    result = {}
    for key, value in data.items():
        current_path = f"{path}.{key}" if path else key

        if isinstance(value, dict):
            result[key] = translate_dict(value, dest_lang, current_path)
        elif isinstance(value, str):
            # Skip content key (large markdown, handle separately)
            if key == "content":
                result[key] = value
                continue

            print(f"  {current_path}")
            result[key] = translate_text(value, dest_lang)
            time.sleep(0.2)
        else:
            result[key] = value

    return result


def main():
    print("Loading English base translations...")
    en_path = os.path.join(TRANSLATIONS_DIR, "en.yml")
    en_data = load_yaml(en_path)

    for lang in LANGUAGES:
        print(f"\n{'='*50}")
        print(f"Generating translations for: {lang}")
        print(f"{'='*50}")

        out_path = os.path.join(TRANSLATIONS_DIR, f"{lang}.yml")

        # Translate UI strings
        translated = translate_dict(en_data, lang)

        # Override with fastlane metadata where available
        locale_codes = FASTLANE_LOCALE_MAP.get(lang, [lang])

        for root_name, root_path in FASTLANE_ROOTS.items():
            if not os.path.exists(root_path):
                continue

            if "zuzu" in root_name:
                ios_mode = "ios" in root_name
                name_file = "name.txt" if ios_mode else "title.txt"
                subtitle_file = (
                    "subtitle.txt" if ios_mode else "short_description.txt"
                )

                subtitle = read_fastlane_file(root_path, locale_codes, subtitle_file)

                if subtitle and "home" in translated:
                    translated["home"]["zuzu_subtitle"] = subtitle
                    print(f"  [fastlane] Zuzu subtitle: {subtitle}")

        save_yaml(translated, out_path)
        print(f"Saved: {out_path}")

    print("\nDone! Translation files generated.")


if __name__ == "__main__":
    main()
