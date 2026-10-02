"""Sequential fixture capture jobs on one explicitly owned simulator."""
import os,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
platform,simulator=sys.argv[1:3]
wait_pid=int(sys.argv[3]) if len(sys.argv)>3 else None
if wait_pid:
 while True:
  try:os.kill(wait_pid,0);time.sleep(2)
  except ProcessLookupError:break
jobs=[('myrenewals','/private/tmp/magiclab-localization-capture-apps/SubscriptionManager.app'),('zuzu','/private/tmp/magiclab-zuzu-capture/Build/Products/Debug-iphonesimulator/Zuzu.app'),('soooon','/private/tmp/magiclab-localization-capture-apps/Soooon.app'),('sundust','/private/tmp/magiclab-sundust-studio-build/Build/Products/Release-iphonesimulator/Sundust.app')]
for slug,app in jobs:
 print('START',slug,platform,flush=True)
 if slug=='myrenewals':
  native=ROOT/'docs/marketing/october-2026/localized/native'/slug
  for folder in native.glob('*/'+platform):
   backup=ROOT/'docs/marketing/october-2026/localized/work/native-myrenewals-v1'/folder.parent.name/platform
   if not backup.exists():backup.parent.mkdir(parents=True,exist_ok=True);folder.rename(backup)
 env=dict(os.environ,MAGICLAB_CAPTURE_APP=app)
 subprocess.run([sys.executable,str(ROOT/'scripts/marketing/capture-localized-native.py'),slug,platform,simulator],cwd=ROOT,env=env,check=True)
 print('DONE',slug,platform,flush=True)
