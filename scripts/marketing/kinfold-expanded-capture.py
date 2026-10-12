"""Resumable, native per-locale captures; only task-owned simulators and isolated binary."""
import argparse,hashlib,json,os,subprocess,time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--platform',required=True,choices=['iphone','ipad','vision','mac']);p.add_argument('--app',required=True);p.add_argument('--locales');p.add_argument('--device');a=p.parse_args()
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/marketing/october-2026/kinfold-expanded';APP=Path(a.app).resolve();BUNDLE='com.magiclabsolutions.FamilyVault.marketingcapture';assert 'kinfold-store-20261011' in str(APP)
locales=json.loads((OUT/'languages.json').read_text())['locales'];locales=a.locales.split(',') if a.locales else locales
views=[('1-vault',{'FV_DEBUG_TAB':'vault'}),('2-document',{'FV_DEBUG_TAB':'vault','FV_DEBUG_OPEN_FIRST_DOC':'1'}),('3-trip',{'FV_DEBUG_TAB':'trips','FV_DEBUG_OPEN_TRIP':'1'}),('4-packing',{'FV_DEBUG_TAB':'trips','FV_DEBUG_OPEN_TRIP':'1','FV_DEBUG_SCROLL':'packing'}),('5-schedule',{'FV_DEBUG_TAB':'schedule'}),('6-search',{'FV_DEBUG_TAB':'search','FV_DEBUG_SEARCH':'Lucas'}),('aux-smartcopy',{'FV_DEBUG_TAB':'vault','FV_DEBUG_OPEN_FIRST_DOC':'1','FV_DEBUG_SMARTCOPY':'1'})]
def run(*cmd,env=None,check=True):return subprocess.run(cmd,env=env,check=check,capture_output=True,text=True)
def digest(f):return hashlib.sha256(f.read_bytes()).hexdigest()
binfiles=[APP/'Contents/MacOS/FamilyVault',APP/'Contents/MacOS/FamilyVault.debug.dylib'] if a.platform=='mac' else [APP/'FamilyVault',APP/'FamilyVault.debug.dylib'];binary={str(x.relative_to(APP)):digest(x) for x in binfiles if x.exists()};assert binary
if a.platform!='mac':
 assert a.device in ['EDB927B4-19EC-431F-B9DE-DAA29851A14D','3E17B79B-75F5-4575-9A84-9AF8A5CAE794','12409210-A7F6-47B6-9163-B349E81CAC18']
 run('xcrun','simctl','install',a.device,str(APP));run('xcrun','simctl','ui',a.device,'appearance','dark')
 if a.platform!='vision':
  run('xcrun','simctl','ui',a.device,'content_size','extra-extra-extra-large' if a.platform=='ipad' else 'large');run('xcrun','simctl','status_bar',a.device,'override','--time','9:41','--dataNetwork','wifi','--wifiMode','active','--wifiBars','3','--batteryState','charged','--batteryLevel','100')
for locale in locales:
 folder=OUT/'native'/locale/a.platform;folder.mkdir(parents=True,exist_ok=True);proof=folder/'provenance.json'
 if proof.exists():
  old=json.loads(proof.read_text())
  if old.get('binary')==binary and all((folder/f'{n}.png').exists() and digest(folder/f'{n}.png')==old['images'].get(f'{n}.png') for n,h in views):print('CACHED',a.platform,locale,flush=True);continue
 if locale=='en-US' and a.platform in ['iphone','ipad']:
  import shutil
  for n,h in views:shutil.copy2(ROOT/'docs/marketing/october-2026/kinfold-store/native/en-US'/a.platform/f'{n}.png',folder/f'{n}.png')
  record={'locale':locale,'platform':a.platform,'binary':binary,'source':'Owner-approved English pilot retained exactly; source provenance in kinfold-store/capture-'+a.platform+'.json'}
 else:
  for n,h in views:
   file=folder/f'{n}.png';env={**os.environ,'FV_DEBUG_INMEMORY':'1','FV_DEBUG_SEED':'1','FV_DEBUG_SKIP_ONBOARDING':'1','XCTestConfigurationFilePath':'/tmp/kinfold-marketing-capture',**h}
   if a.platform=='mac':
    with (folder/(n+'.log')).open('w') as log:r=subprocess.run([str(binfiles[0]),'-marketingLocale',locale,'-marketingOut',str(file),'-AppleLanguages',f'({locale})','-AppleLocale',locale.replace('-','_')],env=env,stdout=log,stderr=subprocess.STDOUT,timeout=40)
    assert r.returncode==0,(locale,n,r.returncode)
   else:
    run('xcrun','simctl','terminate',a.device,BUNDLE,check=False);childenv={**os.environ,**{'SIMCTL_CHILD_'+k:v for k,v in env.items() if k.startswith('FV_') or k=='XCTestConfigurationFilePath'}}
    r=run('xcrun','simctl','launch',a.device,BUNDLE,'-AppleLanguages',f'({locale})','-AppleLocale',locale.replace('-','_'),env=childenv);pid=int(r.stdout.strip().rsplit(':',1)[1]);time.sleep(5 if n=='4-packing' or a.platform=='vision' else 3);os.kill(pid,0);run('xcrun','simctl','io',a.device,'screenshot',str(file))
   assert file.exists() and file.stat().st_size>20000,(locale,n,'Invalid capture')
  record={'locale':locale,'platform':a.platform,'binary':binary,'sourceCommit':'57a9c8b1b7dabae56ba71cb873160c863d4b8d64','isolation':'Native production views; in-memory synthetic family; task-owned capture bundle','device':a.device,'launchHooks':views}
 assert binary=={str(x.relative_to(APP)):digest(x) for x in binfiles if x.exists()},'Binary changed mid-batch'
 record['images']={f'{n}.png':digest(folder/f'{n}.png') for n,h in views};proof.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n');print('CAPTURED',a.platform,locale,flush=True)
