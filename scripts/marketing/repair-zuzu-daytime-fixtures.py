"""Re-capture overview and nap in daytime on an exclusively owned simulator."""
import json,os,pathlib,signal,subprocess,sys,time
ROOT=pathlib.Path(__file__).resolve().parents[2];BASE=ROOT/'docs/marketing/october-2026/localized'
platform,sim,parent,child=sys.argv[1:];parent=int(parent);child=int(child)
try:
 while True:
  status=subprocess.run(['ps','-p',str(child),'-o','state='],capture_output=True,text=True).stdout.strip()
  if not status or status.startswith('Z'):break
  time.sleep(2)
 for locale in json.loads((BASE/'languages.json').read_text())['zuzu']['locales']:
  folder=BASE/'native/zuzu'/locale/platform;backup=BASE/'work/zuzu-before-daytime'/locale/platform;backup.mkdir(parents=True,exist_ok=True)
  for i in [1,6]:
   source=folder/f'native-{i}.png';dest=backup/source.name
   if source.exists() and not dest.exists():source.rename(dest)
 env=dict(os.environ,MAGICLAB_CAPTURE_APP='/private/tmp/magiclab-localization-capture-apps/Zuzu.app')
 subprocess.run([sys.executable,str(ROOT/'scripts/marketing/capture-localized-native.py'),'zuzu',platform,sim],cwd=ROOT,env=env,check=True)
 print('Repaired overview and nap:',platform,flush=True)
finally:os.kill(parent,signal.SIGCONT)
