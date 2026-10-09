"""Capture only a caller-specified isolated Catalyst build, with bundled sample data."""
import argparse, hashlib, json, os, subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--binary',required=True);p.add_argument('--locales');p.add_argument('--force',action='store_true');args=p.parse_args()
root=Path(__file__).resolve().parents[2];output=root/'docs/marketing/october-2026/memories-macos-1.1.1';binary=Path(args.binary).resolve()
assert '/memories-macos-marketing-' in str(binary), 'Use the isolated capture build only'
locales=json.loads((root/'docs/marketing/october-2026/localized/languages.json').read_text())['memories']['locales']
if args.locales:locales=args.locales.split(',')
def binary_digest():
 files=[binary]+sorted(binary.parent.glob('Memories.debug.dylib'))
 return hashlib.sha256(b''.join(f.read_bytes() for f in files)).hexdigest()
binary_hash=binary_digest()
for i,locale in enumerate(locales):
 destination=output/'native'/locale;destination.mkdir(parents=True,exist_ok=True);record=destination/'provenance.json'
 if not args.force and record.exists() and json.loads(record.read_text())['binarySha256'] == binary_hash and all((destination/f'native-{j}.png').exists() for j in range(1,7)):
  print('CACHED',locale,flush=True);continue
 command=[str(binary),'-screenshots','-marketing-stock',str(root/'docs/marketing/october-2026/localized/work/memories-unique-cache'),'-marketing-birthday',str(root/'docs/marketing/october-2026/memories-1.1.1/assets/birthday-film.jpg'),'-marketing-screen','home','-UIViewAnimationsDisabled','YES','-marketing-out',str(destination),'-AppleLanguages',f'({locale})','-AppleLocale',locale.replace('-','_'),'-NSQuitAlwaysKeepsWindows','NO']
 with (destination/'capture.log').open('w') as log:
  r=subprocess.run(command,env={**os.environ,'DISABLE_ANIMATIONS':'1'},stdout=log,stderr=subprocess.STDOUT,timeout=180)
 assert r.returncode==0,(locale,r.returncode)
 assert binary_digest()==binary_hash,'Capture binary changed during the run'
 capture_log=(destination/'capture.log').read_text()
 assert '[ScreenshotSeed] failed to write fixture' not in capture_log, (locale,'Incomplete offline media fixture')
 captures=[l for l in capture_log.splitlines() if l.startswith('CAPTURE ')]
 assert len(captures)==6 and all('2400x1552' in l for l in captures),(locale,captures)
 record.write_text(json.dumps({'source':'Native Mac Catalyst UIKit hierarchy, 1200 × 776 pt, 2x; no desktop or personal app data captured','locale':locale,'binarySha256':binary_hash,'captures':captures,'images':{f'native-{j}.png':hashlib.sha256((destination/f'native-{j}.png').read_bytes()).hexdigest() for j in range(1,7)}},ensure_ascii=False,indent=2)+'\n')
 print('CAPTURED',locale,f'{i+1}/{len(locales)}',flush=True)
