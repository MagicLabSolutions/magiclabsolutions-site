"""Validate the complete English Kinfold delivery and archive all twelve store PNGs."""
import hashlib
import json
from pathlib import Path
import struct
import zipfile

ROOT = Path(__file__).resolve().parents[2]
PACKAGE = ROOT / 'docs/marketing/october-2026/kinfold-store'

def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()

def png(file):
    header = file.read_bytes()[:33]
    assert header[:8] == b'\x89PNG\r\n\x1a\n'
    width, height, depth, color, _, _, _ = struct.unpack('>IIBBBBB', header[16:29])
    return width, height, depth, color

validation = json.loads((PACKAGE / 'validation.json').read_text())
assert len(validation['records']) == 12
proofs = [json.loads((PACKAGE / ('capture-' + platform + '.json')).read_text()) for platform in ['iphone', 'ipad']]
assert proofs[0]['binary'] == proofs[1]['binary'], 'Platforms must use the same fixture executable'
for proof in proofs:
    assert len(proof['records']) == 7
    for record in proof['records']:
        assert digest(ROOT / record['file']) == record['sha256']
        assert record['launchEnvironment']['FV_DEBUG_INMEMORY'] == '1'
        assert 'XCTestConfigurationFilePath' in record['launchEnvironment']

records = []
for platform, dimensions in [('iphone', (1320, 2868)), ('ipad', (2064, 2752))]:
    panels = [r for r in validation['records'] if r['platform'] == platform]
    assert [r['number'] for r in panels] == list(range(1, 7))
    for record in panels:
        file = ROOT / record['file']
        assert png(file) == (*dimensions, 8, 2), 'Expected opaque 8-bit RGB PNG'
        assert digest(file) == record['sha256']
        assert digest(ROOT / record['capture']) == record['captureSha256']
        records.append({'platform': platform, 'number': record['number'], 'file': 'en-US/' + platform + '/' + file.name, 'dimensions': dimensions, 'sha256': record['sha256']})

manifest = {'app': 'Kinfold', 'appStoreId': '6785646082', 'locale': 'en-US', 'stage': 'English owner-review pilot', 'counts': {'iphone': 6, 'ipad': 6, 'total': 12}, 'records': records}
(PACKAGE / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
archive = PACKAGE / 'kinfold-app-store-en-US.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_STORED) as out:
    for record in records:
        out.write(PACKAGE / 'exports/en-US' / Path(record['file']).name, record['file'])
    out.write(PACKAGE / 'manifest.json', 'manifest.json')
    out.write(PACKAGE / 'README.md', 'README.md')
with zipfile.ZipFile(archive) as result:
    assert result.testzip() is None
    assert len([n for n in result.namelist() if n.endswith('.png')]) == 12
    for record in records:
        assert hashlib.sha256(result.read(record['file'])).hexdigest() == record['sha256']
print('Verified 14 native sources, 12 RGB masters, same capture binary, and complete ZIP:', archive)
