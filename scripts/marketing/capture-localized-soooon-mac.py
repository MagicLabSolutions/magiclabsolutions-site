"""Render real macOS product screens in an owned offscreen fixture host."""
import hashlib,json,os,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[2];BASE=ROOT/'docs/marketing/october-2026/localized'
APP=pathlib.Path('/private/tmp/magiclab-soooon-localized-mac-build/Build/Products/Debug/Soooon.app');EXE=APP/'Contents/MacOS/Soooon'
locales=json.loads((BASE/'languages.json').read_text())['soooon']['locales']
for locale in locales:
 folder=BASE/'native/soooon'/locale/'mac';folder.mkdir(parents=True,exist_ok=True)
 for i,scene in enumerate(['home','detail','holidays','calendar','wardrobe'],1):
  file=folder/f'native-{i}.png'
  if file.exists():continue
  env=dict(os.environ,SOOOON_DEMO='1',SOOOON_NOW='2026-11-12T08:41:00Z',SOOOON_CALENDAR='allowed')
  with (folder/f'native-{i}.log').open('w') as log:
   subprocess.run([str(EXE),'-native-export','-marketing-screen',scene,'-marketingOut',str(file),'-AppleLanguages',f'({locale})','-AppleLocale',locale.replace('-','_')],env=env,stdout=log,stderr=subprocess.STDOUT,check=True,timeout=40)
  if not file.exists():raise RuntimeError(locale+' '+scene+': missing actual native output')
 record={'locale':locale,'capture_locale':locale,'platform':'mac','method':'actual product screens, offscreen AppKit host, fictional local data','binary_sha256':hashlib.sha256(EXE.read_bytes()).hexdigest(),'screens':[{'file':f'native-{i}.png','sha256':hashlib.sha256((folder/f'native-{i}.png').read_bytes()).hexdigest()} for i in range(1,6)]}
 (folder/'capture-soooon-mac.json').write_text(json.dumps(record,indent=2)+'\n');print('soooon mac',locale,'captured',flush=True)
