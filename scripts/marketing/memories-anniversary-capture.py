"""Two added scenes, current production SwiftUI views, synthetic offline fixtures.
Only operates the explicitly created Memories 1.1.1 simulators in capture-devices.json.
"""
from pathlib import Path
import hashlib,json,os,shutil,subprocess,sys,time
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/marketing/october-2026/memories-1.1.1'
APP=Path('/private/tmp/memories-111-build/Build/Products/Debug-iphonesimulator/Memories.app')
BUNDLE='com.magiclabsolutions.memories'
def run(*args,check=True):
 return subprocess.run(['xcrun','simctl',*args],check=check,capture_output=True,text=True).stdout.strip()
platform=sys.argv[1]; devices=json.loads((OUT/'capture-devices.json').read_text());device=devices[platform]
locales=sys.argv[2:] or list(json.loads((OUT/'copy.json').read_text())['locales'])
assert device in devices.values()
run('boot',device,check=False);run('bootstatus',device,'-b');run('install',device,str(APP))
run('ui',device,'appearance','light');run('status_bar',device,'override','--time','9:41','--batteryState','charged','--batteryLevel','100','--wifiMode','active','--wifiBars','3')
container=Path(run('get_app_container',device,BUNDLE,'data'));cache=container/'Library/Caches/marketing-stock'
shutil.copytree(ROOT/'docs/marketing/october-2026/localized/work/memories-unique-cache',cache,dirs_exist_ok=True)
shutil.copyfile(OUT/'assets/birthday-film.jpg',cache/'birthday-film.jpg')
records=[]
try:
 for locale in locales:
  folder=OUT/'native'/locale/platform;folder.mkdir(parents=True,exist_ok=True)
  for number,scene in [(5,'year'),(6,'projects')]:
   file=folder/f'native-{number}.png'
   if not file.exists():
    run('ui',device,'content_size','accessibility-extra-extra-large' if platform=='ipad' and scene=='projects' else 'large')
    projects=container/'Documents/projects'
    if projects.exists():shutil.rmtree(projects)
    log=folder/f'native-{number}.log'
    with log.open('w') as stream:
     process=subprocess.Popen(['xcrun','simctl','launch','--console-pty','--terminate-running-process',device,BUNDLE,'-screenshots','-marketing-screen',scene,'-AppleLanguages',f'({locale})','-AppleLocale',locale.replace('-','_')],stdout=stream,stderr=subprocess.STDOUT)
     try:
      for _ in range(450):
       time.sleep(.2);s=log.read_text(errors='replace')
       if 'Terminating app due to' in s:raise RuntimeError(f'Crash: {locale}/{scene}')
       if '[ScreenshotSeed] done in' in s:break
      else:raise RuntimeError(f'Seed not ready: {locale}/{scene}')
      time.sleep(2.4)
      run('io',device,'screenshot',str(file))
     finally:
      run('terminate',device,BUNDLE,check=False)
      try:process.wait(timeout=2)
      except subprocess.TimeoutExpired:process.terminate()
   records.append({'locale':locale,'platform':platform,'panel':number,'file':str(file.relative_to(ROOT)),'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
  print('CAPTURED',platform,locale,flush=True)
  (OUT/f'capture-{platform}.json').write_text(json.dumps({'simulator':device,'bundle':BUNDLE,'appBinary':hashlib.sha256((APP/'Memories').read_bytes()).hexdigest(),'method':'Production current SwiftUI views with offline synthetic yearly compilation and birthday photograph; native iPad geometry; neutral sample project names','records':records},indent=2)+'\n')
finally:
 run('terminate',device,BUNDLE,check=False);run('shutdown',device,check=False)
