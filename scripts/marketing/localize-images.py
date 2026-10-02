"""Translate editable campaign copy for actual app languages, never pixels or UI.

Imports reviewed translation files collected through the public translation UI.
No paid API or credential access.
No store upload, voice generation, or native app changes. Resumable by locale.
"""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'docs/marketing/october-2026'
OUT = BASE / 'localized'
CATALOGS = {
    'hooray': ['Hooray/src/i18n/Web.xcstrings'],
    'sundust': ['Sundust/ios/Sundust/Localizable.xcstrings'],
    'giftly': ['Giftly/Giftly/Resources/Localizable.xcstrings'],
    'brainfold': ['Brainfold/Brainfold/Resources/Localizable.xcstrings'],
    'memories': ['Memories/Memories/Localization/Localizable.xcstrings'],
    'poof': ['Poof/app/Poof/Resources/Localizable.xcstrings'],
    'soooon': ['Soooon/app/Soooon/Resources/Localizable.xcstrings'],
    'myrenewals': ['SubscriptionManager/SubscriptionManager/Localization/Localizable.xcstrings'],
    'toctoc': ['TocToc/Packages/TocTocKit/Sources/TocTocPresentation/Resources/Localizable.xcstrings'],
    'zuzu': ['zuzu/Zuzu/Localization/Localizable.xcstrings'],
}

def inventory(campaign):
    result = {}
    for p in campaign['products']:
        slug = p['slug']
        if slug == 'tumtum':
            # The approved store collection and supported play languages are eight,
            # rather than every historical partially translated parent string.
            locales = {'en-US', 'pt-BR', 'es', 'fr', 'de', 'ja', 'ko', 'zh-Hans'}
            sources = ['TumTum/Tools/store/screenshots.json', 'TumTum/AGENTS.md']
        elif slug == 'groundcontrol':
            locales, sources = {'en-US'}, ['GroundControl: English-only native app']
        elif slug == 'giftly':
            locales = {r.split('|')[0].strip() for r in (BASE/'giftly-localized/copy.tsv').read_text().splitlines() if r.strip()}
            sources = ['giftly-localized/capture-provenance.json']
        else:
            sources = CATALOGS[slug]
            locales = {'en-US'}
            for name in sources:
                d = json.loads((ROOT.parent/name).read_text())
                for e in d['strings'].values():
                    locales.update(e.get('localizations', {}))
            repo = ROOT.parent/p['source_repository']
            for folder in repo.glob('**/*.lproj'):
                if not any(x in str(folder).lower() for x in ['build/', '.build/', 'pods/', 'node_modules/']):
                    locales.add(folder.stem)
            locales.discard('Base')
            locales.discard('en')
        result[slug] = {'locales': sorted(locales), 'sources': sources,
                        'store_policy': p.get('store_policy', 'new-approved-style')}
    return result

def source_copy(campaign):
    result = {}
    for p in campaign['products']:
        cfg = p.get('studio_art', {})
        pairs = cfg.get('copy') or p.get('store_pilot_copy') or [r[:2] for r in p['panels']]
        result[p['slug']] = {'panels': [[*pair, p['panels'][i][2]] for i, pair in enumerate(pairs)],
                             'cta': p['cta']}
        if p.get('social_copy'):
            result[p['slug']]['social_copy'] = p['social_copy']
    return result

def strings(value):
    if isinstance(value, dict):
        for child in value.values(): yield from strings(child)
    elif isinstance(value, list):
        for child in value: yield from strings(child)
    else: yield value

def translate(locale, source, inv, lookup):
    subset = {slug: v for slug, v in source.items() if locale in inv[slug]['locales']}
    originals = list(dict.fromkeys(strings(source)))
    source_locale = {'es-419':'es','es-US':'es','fr-CA':'fr'}.get(locale, locale)
    def replace(value):
        if isinstance(value, dict): return {k:replace(v) for k,v in value.items()}
        if isinstance(value, list): return [replace(v) for v in value]
        if locale.startswith('en'): return value
        return lookup[source_locale][str(originals.index(value))]
    translated = replace(subset)
    overrides_file = OUT/'copy-overrides.json'
    overrides = json.loads(overrides_file.read_text()).get(locale, {}) if overrides_file.exists() else {}
    def polish(value):
        if isinstance(value, dict): return {k:polish(v) for k,v in value.items()}
        if isinstance(value, list): return [polish(v) for v in value]
        return overrides.get(value, value)
    translated = polish(translated)
    if 'giftly' in subset:
        for row in (BASE/'giftly-localized/copy.tsv').read_text().splitlines():
            parts = row.split('|')
            if parts[0].strip() == locale:
                for i in range(4):
                    translated['giftly']['panels'][i][:2] = [s.replace('\\n', '\n') for s in parts[1+i*2:3+i*2]]
    validate_shape(subset, translated)
    file = OUT/'copy'/f'{locale}.json'
    file.parent.mkdir(parents=True, exist_ok=True)
    if file.exists() and 'soooon' in translated:
        original_store = json.loads(file.read_text()).get('products', {}).get('soooon', {}).get('original_store')
        if original_store: translated['soooon']['original_store'] = original_store
    file.write_text(json.dumps({'locale':locale, 'direction':'rtl' if locale in ['ar','he','ur'] else 'ltr',
        'source_sha256':hashlib.sha256(json.dumps(subset, sort_keys=True).encode()).hexdigest(),
        'products':translated, 'status':'Translated copy; per-image render QA tracked separately'},
        ensure_ascii=False, indent=2)+'\n')
    return locale, len(subset)

def validate_shape(original, translated):
    if isinstance(original, dict):
        assert isinstance(translated, dict) and original.keys() == translated.keys(), 'Object shape changed'
        for key in original:
            validate_shape(original[key], translated[key])
    elif isinstance(original, list):
        assert isinstance(translated, list) and len(original) == len(translated), 'Panel count changed'
        for a, b in zip(original, translated):
            validate_shape(a, b)
    else:
        assert isinstance(translated, str) and translated.strip(), 'Empty translation'

def main():
    campaign = json.loads((BASE/'campaign.json').read_text())
    inv = inventory(campaign)
    OUT.mkdir(exist_ok=True)
    (OUT/'languages.json').write_text(json.dumps(inv, ensure_ascii=False, indent=2)+'\n')
    source_file = OUT/'source-copy.json'
    source = json.loads(source_file.read_text()) if source_file.exists() else source_copy(campaign)
    source_file.write_text(json.dumps(source, ensure_ascii=False, indent=2)+'\n')
    if '--inventory-only' in sys.argv:
        print({slug:len(v['locales']) for slug,v in inv.items()})
        return
    incoming = Path(sys.argv[1])
    lookup = {p.stem:json.loads(p.read_text()) for p in incoming.glob('*.json')}
    missing = []
    for locale in sorted(set.union(*(set(v['locales']) for v in inv.values()))):
        alias = {'es-419':'es','es-US':'es','fr-CA':'fr'}.get(locale, locale)
        if not locale.startswith('en') and alias not in lookup:
            missing.append(locale); continue
        print(*translate(locale, source, inv, lookup), flush=True)
    if missing: print('Pending translation:', ', '.join(missing))

if __name__ == '__main__': main()
