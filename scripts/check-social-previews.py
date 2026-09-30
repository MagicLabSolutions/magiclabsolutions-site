#!/usr/bin/env python3
"""Check localized share metadata and the actual JPEG dimensions in a Jekyll build."""
import argparse
import json
import struct
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.values = defaultdict(list)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            key = attrs.get('property', attrs.get('name', ''))
            self.values[key].append(attrs.get('content', ''))


def jpeg_size(path):
    data = path.read_bytes()
    assert data[:2] == b'\xff\xd8', f'{path}: not a JPEG'
    offset = 2
    while offset < len(data):
        assert data[offset] == 255, f'{path}: invalid JPEG marker'
        while data[offset] == 255:
            offset += 1
        marker = data[offset]
        offset += 1
        length = struct.unpack_from('>H', data, offset)[0]
        if marker in (0xC0, 0xC1, 0xC2):
            height, width = struct.unpack_from('>HH', data, offset + 3)
            return width, height
        offset += length
    raise AssertionError(f'{path}: JPEG dimensions not found')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('build', type=Path)
    build = parser.parse_args().build
    source = Path(__file__).resolve().parents[1]
    manifest = json.loads((source / '_data/share_images.json').read_text())
    checked = set()
    count = 0
    required = ('og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt',
                'og:image:width', 'og:image:height', 'og:image:type',
                'twitter:card', 'twitter:title', 'twitter:description',
                'twitter:image', 'twitter:image:alt')
    for locale in manifest['home']:
        prefix = '' if locale == 'en' else f'{locale}/'
        routes = [(f'/{prefix}', manifest['home'][locale])]
        for slug, variants in manifest['products'].items():
            routes.append((f'/{prefix}apps/{slug}/', variants.get(locale, variants['en'])))
        for route, card in routes:
            metadata = Metadata()
            metadata.feed((build / route.lstrip('/') / 'index.html').read_text())
            values = metadata.values
            for key in required:
                assert len(values[key]) == 1 and values[key][0].strip(), f'{route}: missing/duplicate {key}'
            for key in ('og:url', 'og:image', 'twitter:image'):
                url = urlsplit(values[key][0])
                assert url.scheme == 'https' and url.netloc, f'{route}: non-HTTPS {key}'
            assert urlsplit(values['og:url'][0]).path == route, f'{route}: incorrect localized URL'
            assert urlsplit(values['og:image'][0]).path == card['image'], f'{route}: incorrect image'
            assert values['og:image'] == values['twitter:image'], f'{route}: inconsistent images'
            assert values['twitter:card'] == ['summary_large_image'], route
            assert values['og:image:width'] == ['1200'] and values['og:image:height'] == ['630'], route
            assert values['og:image:type'] == ['image/jpeg'], route
            asset = build / card['image'].lstrip('/')
            if asset not in checked:
                assert jpeg_size(asset) == (1200, 630), f'{asset}: wrong dimensions'
                checked.add(asset)
            count += 1
    print(f'PASS: {count} localized share previews; {len(checked)} JPEG cards at 1200×630.')


if __name__ == '__main__':
    main()
