from pathlib import Path
import subprocess,time,shutil
u='7E98BBE3-6DA5-439F-BCC3-63A9C9F2480C';bundle='com.magiclabsolutions.memories.marketing';phone='8BA967B0-0E64-4135-9E9E-5DF5335E9079';out=Path('/Users/fabio.hoffmann/Development/MagicLabSolutions/magiclabsolutions-site/docs/marketing/october-2026/sources/memories/ipad');out.mkdir(exist_ok=True)
subprocess.run(['xcrun','simctl','install',u,'/private/tmp/magiclab-memories-studio-build/Build/Products/Debug-iphonesimulator/Memories.app'],check=True,capture_output=True)
a=Path(subprocess.check_output(['xcrun','simctl','get_app_container',phone,'com.magiclabsolutions.memories','data'],text=True).strip())/'Library/Caches/marketing-stock';b=Path(subprocess.check_output(['xcrun','simctl','get_app_container',u,bundle,'data'],text=True).strip())/'Library/Caches/marketing-stock';shutil.copytree(a,b,dirs_exist_ok=True)
for i,scene in enumerate(['home','film','highlights','soundtrack']):
 subprocess.run(['xcrun','simctl','terminate',u,bundle],capture_output=True);log=Path(f'/private/tmp/memories-ipad-{scene}.log')
 with log.open('w') as f:
  p=subprocess.Popen(['xcrun','simctl','launch','--console-pty',u,bundle,'-screenshots','-marketing-screen',scene,'-AppleLanguages','(en)','-AppleLocale','en_US'],stdout=f,stderr=subprocess.STDOUT)
  for tick in range(120):
   time.sleep(1);s=log.read_text(errors='replace')
   if 'Terminating app due to' in s:raise RuntimeError(s[-1000:])
   if '[ScreenshotSeed] done in' in s:break
  else:raise RuntimeError('Seed did not finish')
  time.sleep(3);subprocess.run(['xcrun','simctl','io',u,'screenshot',str(out/f'native-{i+1}.png')],check=True,capture_output=True);print(scene,flush=True)
  subprocess.run(['xcrun','simctl','terminate',u,bundle],capture_output=True);p.wait(timeout=10)
