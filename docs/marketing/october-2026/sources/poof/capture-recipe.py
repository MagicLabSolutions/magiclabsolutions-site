import subprocess,time
from pathlib import Path
root=Path('/private/tmp/magiclab-poof-native/en-US');root.mkdir(parents=True,exist_ok=True)
binary='/private/tmp/magiclab-poof-build/Build/Products/Debug/Poof Direct.app/Contents/MacOS/Poof Direct'
for state in ['results','junk','apps','developer','menubar']:
 log=root/f'{state}.log'
 with log.open('w') as out:
  p=subprocess.Popen([binary,'-demo','-sandboxed','-pro','-expand','YES','-mute','-AppleLanguages','(en)','-AppleLocale','en_US','-screen',state,'-marketingOut',str(root/f'{state}.png'),'-screenOut',str(root/f'{state}.png')],stdout=out,stderr=subprocess.STDOUT)
  try:
   for _ in range(90):
    time.sleep(.4)
    if 'SCREEN READY' in log.read_text():break
    if p.poll() is not None:raise RuntimeError(log.read_text()[-1000:])
   assert (root/f'{state}.png').exists(),state
   print(state,flush=True)
  finally:
   p.terminate();p.wait(timeout=10)
