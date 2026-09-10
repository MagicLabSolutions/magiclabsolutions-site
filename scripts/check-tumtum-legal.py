#!/usr/bin/env python3
"""Check published destinations, language switching and tracking-free legal pages."""
from html.parser import HTMLParser
from pathlib import Path
import sys


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


root = Path(sys.argv[1] if len(sys.argv) > 1 else "_site")
for prefix, language in [("", "en"), ("pt-BR/", "pt-BR")]:
    for document in ["privacy-policy", "terms-of-use"]:
        path = root / prefix / "tumtum" / document / "index.html"
        text = path.read_text()
        page = Page()
        page.feed(text)
        assert "ferh=" not in text and "{{" not in text, path
        assert not any(tag in {"script", "form", "iframe"} for tag, _ in page.tags), path
        assert next(attrs["lang"] for tag, attrs in page.tags if tag == "html") == language
        for target_lang, target_prefix in [("en", ""), ("pt-BR", "/pt-BR")]:
            target = f"https://magiclabsolutions.com{target_prefix}/tumtum/{document}/"
            assert any(tag == "a" and attrs.get("lang") == target_lang and attrs.get("href") == target
                       for tag, attrs in page.tags), f"Broken language switch: {path} -> {target}"
        for tag, attrs in page.tags:
            resource = attrs.get("src") or (attrs.get("href") if tag == "link" and attrs.get("rel") in {"stylesheet", "icon"} else None)
            if resource:
                assert resource.startswith("/"), f"External resource on a legal page: {resource}"
                assert (root / resource.lstrip("/")).is_file(), resource
        print(f"PASS {path.relative_to(root)}")
