"""Export real Poof view components with the existing mock disk, per app locale."""
import hashlib,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/marketing/october-2026/localized'
binary=Path('/private/tmp/magiclab-localization-poof-build/Build/Products/Debug/Poof Direct.app/Contents/MacOS/Poof Direct')
records=[]
for locale in sys.argv[1:] or json.loads((OUT/'languages.json').read_text())['poof']['locales']:
 folder=OUT/'native/poof'/locale/'mac';folder.mkdir(parents=True,exist_ok=True)
 for i,scene in enumerate(['results','junk','apps','developer'],1):
  file=folder/f'native-{i}.png'
  if not file.exists():
   with (folder/f'native-{i}.log').open('w') as log:
    p=subprocess.Popen([str(binary),'-native-export','-demo','-sandboxed','-pro','-expand','YES','-mute','-AppleLanguages',f'({locale})','-AppleLocale',locale.replace('-','_'),'-screen',scene,'-marketingOut',str(file)],stdout=log,stderr=subprocess.STDOUT)
    try:
     p.wait(timeout=25)
     if p.returncode or not file.exists():raise RuntimeError(f'{locale}/{scene}: native export failed')
    finally:
     if p.poll() is None:p.terminate();p.wait(timeout=3)
  records.append({'locale':locale,'platform':'mac','panel':i,'source':str(file.relative_to(ROOT)),'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
 print('poof',locale,'captured',flush=True)
 (OUT/'capture-poof-mac.json').write_text(json.dumps({'binary_sha256':hashlib.sha256(binary.read_bytes()).hexdigest(),'method':'Native NSHostingView exports of production Sidebar, SmartScanScreen and GroupScreen; existing mock disk only; no real scan or cleanup','records':records},indent=2)+'\n')
