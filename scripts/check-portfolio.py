#!/usr/bin/env python3
"""Validate built product routes, local assets, structured data and catalog coverage."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets, self.ids, self.links, self.schemas = [], [], [], []
        self.demo_count = 0
        self.capture_tour_count = 0
        self.schema = None
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag in ('img', 'script', 'source', 'track', 'video') and attrs.get('src'):
            self.assets.append(attrs['src'])
        if tag == 'video' and attrs.get('poster'):
            self.assets.append(attrs['poster'])
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            self.assets.append(attrs['href'])
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])
        if 'data-demo' in attrs:
            self.demo_count += 1
        if 'data-capture-tour' in attrs:
            self.capture_tour_count += 1
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.schema = ''
    def handle_data(self, data):
        if self.schema is not None:
            self.schema += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.schema is not None:
            self.schemas.append(self.schema)
            self.schema = None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('build', type=Path)
    args = parser.parse_args()
    source = Path(__file__).resolve().parents[1]
    products = json.loads((source / '_data/portfolio.json').read_text())
    errors = []
    locales = ('', 'pt-BR/', 'de/', 'es/', 'fr/', 'ja/', 'ko/', 'zh-Hans/')
    for locale in locales:
        for product in products:
            route = f'{locale}apps/{product["slug"]}/index.html'
            path = args.build / route
            if not path.is_file():
                errors.append(f'Missing {route}')
                continue
            page = Page()
            page.feed(path.read_text())
            if page.demo_count + page.capture_tour_count != 1:
                errors.append(f'{route}: expected one demo or real capture tour')
            if len(page.ids) != len(set(page.ids)):
                errors.append(f'{route}: duplicate element IDs')
            for url in page.assets:
                if url.startswith('/') and not (args.build / unquote(urlsplit(url).path).lstrip('/')).is_file():
                    errors.append(f'{route}: missing asset {url}')
            for schema in page.schemas:
                try:
                    json.loads(schema)
                except json.JSONDecodeError as exc:
                    errors.append(f'{route}: invalid structured data: {exc}')
            if not page.schemas:
                errors.append(f'{route}: no product structured data')
        home = Page()
        home.feed((args.build / locale / 'index.html').read_text())
        for product in products:
            if f'/{locale}apps/{product["slug"]}/' not in home.links:
                errors.append(f'{locale}home: missing {product["slug"]}')
    for internal in ('docs', 'scripts'):
        if (args.build / internal).exists():
            errors.append(f'Internal {internal} directory included in public build')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'PASS: {len(products)} products × {len(locales)} locales; assets, IDs, JSON-LD and catalog links.')

if __name__ == '__main__':
    main()
