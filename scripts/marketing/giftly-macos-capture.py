"""Native offscreen Mac capture. Use the isolated capture-only binary, never the user's app."""
import argparse, hashlib, json, subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/marketing/october-2026/giftly-macos'
parser = argparse.ArgumentParser()
parser.add_argument('--binary', required=True)
parser.add_argument('--locales', nargs='*')
args = parser.parse_args()
binary = Path(args.binary).resolve()
assert '.app/Contents/MacOS/' in str(binary) and 'marketing' in str(binary)
copy_source = OUT / 'fixtures.json'
copy = json.loads(copy_source.read_text())
expected = json.loads((ROOT / 'docs/marketing/october-2026/localized/languages.json').read_text())['giftly']['locales']
assert set(copy) == set(expected)
records = []
binary_hash = hashlib.sha256(binary.read_bytes()).hexdigest()
for locale, data in copy.items():
    if args.locales and locale not in args.locales:
        continue
    dest = OUT / 'native' / locale
    dest.mkdir(parents=True, exist_ok=True)
    for screen in ['today', 'upcoming', 'people', 'calendar']:
        target = dest / (screen + '.png')
        result = subprocess.run([str(binary), '-marketingLocale', locale, '-marketingScreen', screen,
            '-marketingOut', str(target), '-marketingSize', data['clothingSize'],
            '-AppleLanguages', '('+locale+')', '-AppleLocale', locale.replace('-', '_')],
            capture_output=True, text=True, timeout=35, check=True)
        assert target.exists() and 'CAPTURE '+locale+' '+screen in result.stdout, result.stderr[-1000:]
        records.append({'locale':locale, 'screen':screen, 'file':str(target.relative_to(ROOT)),
            'sha256':hashlib.sha256(target.read_bytes()).hexdigest(), 'nativeLocale':result.stdout.strip(),
            'binarySHA256':binary_hash, 'capturedAt':datetime.now(timezone.utc).isoformat()})
    print(locale+' native Mac captures ready', flush=True)
manifest = OUT / 'capture-manifest.json'
previous_data = json.loads(manifest.read_text()) if manifest.exists() else {}
previous = previous_data.get('captures', [])
keys = {(r['locale'],r['screen']) for r in records}
manifest.write_text(json.dumps({**previous_data, 'sourceRevision':'498473153fb492cbca2c6face9bad0853a4c079e',
    'binarySHA256':binary_hash, 'fixtureSHA256':hashlib.sha256(copy_source.read_bytes()).hexdigest(),
    'captureEntrySHA256':hashlib.sha256((OUT / 'CaptureMain.swift').read_bytes()).hexdigest(),
    'method':'Offscreen NSHostingView / AppKit 2x, light appearance, in-memory SampleData, no production services',
    'captures':[r for r in previous if (r['locale'],r['screen']) not in keys]+records}, ensure_ascii=False, indent=2)+'\n')
