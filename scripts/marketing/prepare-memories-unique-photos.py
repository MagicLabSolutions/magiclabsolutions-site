"""Prepare unique native photo fixtures without changing Memories app code.

Use the bundled Python/Pillow runtime; pass the archived original stock cache.
Only native home/highlights scenes are recaptured. Films and soundtracks stay put.
"""
import hashlib
import json
from pathlib import Path
import shutil
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT/'docs/marketing/october-2026'
original = Path(sys.argv[1])
target = BASE/'localized/work/memories-unique-cache'
target.mkdir(parents=True, exist_ok=True)
shutil.copytree(original, target, dirs_exist_ok=True)

# Reserve distinct family/pet/travel images for every photo in the latest month.
recent = {
    1130:'revision-2/family-birthday.png',1131:'revision-2/baby-picnic.png',1132:'revision-2/travel-lake.png',
    1120:'memories/family-garden.png',1121:'memories/pet-puppy.png',1122:'memories/family-reading.png',
    1110:'revision-2/family-beach.png',1111:'revision-2/travel-city.png',1112:'revision-2/pet-cat.png',
    1100:'revision-2/family-baking.png',1101:'revision-2/pet-garden.png',1102:'memories/family-snow.png',
}
pool = []
seen = set()
for file in sorted(original.glob('*.jpg')):
    digest = hashlib.sha256(file.read_bytes()).hexdigest()
    if digest not in seen:
        pool.append(file);seen.add(digest)
keys = json.loads((BASE/'sources/memories/demo-cache-keys.json').read_text())
child_keys = sorted((key for key in keys if key.startswith('child-')), key=lambda key:int(key.split('-')[1]), reverse=True)
assert len(pool) >= len(child_keys)-len(recent), 'Not enough genuinely distinct archived photos'
records=[]
for key in child_keys:
    seed = int(key.split('-')[1])
    source = BASE/'assets'/recent[seed] if seed in recent else pool.pop(0)
    with Image.open(source) as photo:
        photo.convert('RGB').save(target/key, 'JPEG', quality=95)
    records.append({'key':key,'source':str(source),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
                    'fixture_sha256':hashlib.sha256((target/key).read_bytes()).hexdigest()})
assert len({r['fixture_sha256'] for r in records}) == len(records), 'Duplicate visible album photo'
(BASE/'sources/memories/unique-photo-fixture/manifest.json').write_text(json.dumps({
    'policy':'Unique photo identity for every child album item; native views render fixture files. Only panels 1 and 3 are recaptured.',
    'count':len(records),'records':records},indent=2)+'\n')
print(target)
