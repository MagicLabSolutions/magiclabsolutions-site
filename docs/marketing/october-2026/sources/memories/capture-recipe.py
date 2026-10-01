from pathlib import Path
import subprocess,time,shutil
ROOT=Path('/Users/fabio.hoffmann/Development/MagicLabSolutions/magiclabsolutions-site');APP='/private/tmp/magiclab-memories-studio-build/Build/Products/Debug-iphonesimulator/Memories.app'
phone='8BA967B0-0E64-4135-9E9E-5DF5335E9079';pad='7E98BBE3-6DA5-439F-BCC3-63A9C9F2480C'
for platform,u in [('iphone',phone)]:
 subprocess.run(['xcrun','simctl','install',u,APP],check=True,capture_output=True)
 if platform=='ipad':
  a=Path(subprocess.check_output(['xcrun','simctl','get_app_container',phone,'com.magiclabsolutions.memories','data'],text=True).strip())/'Library/Caches/marketing-stock';b=Path(subprocess.check_output(['xcrun','simctl','get_app_container',pad,'com.magiclabsolutions.memories','data'],text=True).strip())/'Library/Caches/marketing-stock'
  if a.exists():shutil.copytree(a,b,dirs_exist_ok=True)
 out=ROOT/'docs/marketing/october-2026/sources/memories'/('ipad' if platform=='ipad' else '')
 for i,scene in enumerate(['home','film','highlights','soundtrack']):
  subprocess.run(['xcrun','simctl','terminate',u,'com.magiclabsolutions.memories'],capture_output=True)
  log=Path(f'/private/tmp/memories-{platform}-{scene}.log')
  with log.open('w') as f:
   process=subprocess.Popen(['xcrun','simctl','launch','--console-pty',u,'com.magiclabsolutions.memories','-screenshots','-marketing-screen',scene,'-AppleLanguages','(en)','-AppleLocale','en_US'],stdout=f,stderr=subprocess.STDOUT)
   for tick in range(120):
    time.sleep(1);s=log.read_text(errors='replace')
    if 'Terminating app due to' in s:raise RuntimeError(s[-1500:])
    if '[ScreenshotSeed] done in' in s:break
   else:raise RuntimeError(f'Seed timed out: {log}')
   time.sleep(3)
   subprocess.run(['xcrun','simctl','io',u,'screenshot',str(out/f'native-{i+1}.png')],check=True,capture_output=True)
   print(platform,scene,s.split('[ScreenshotSeed] done in')[-1].splitlines()[0],flush=True)
   subprocess.run(['xcrun','simctl','terminate',u,'com.magiclabsolutions.memories'],capture_output=True);process.wait(timeout=10)
