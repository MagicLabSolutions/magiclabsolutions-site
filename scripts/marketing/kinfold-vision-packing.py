"""Recapture the native packing scroll position with a capture-only ScrollViewReader hook."""
import json,hashlib,os,subprocess,time
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'docs/marketing/october-2026/kinfold-expanded';app=Path('/private/tmp/kinfold-store-20261011/vision-packing-dd/Build/Products/Debug-xrsimulator/FamilyVault.app');device='12409210-A7F6-47B6-9163-B349E81CAC18';bundle='com.magiclabsolutions.FamilyVault.marketingcapture';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();binary={x.name:sha(x) for x in [app/'FamilyVault',app/'FamilyVault.debug.dylib']};locales=json.loads((out/'languages.json').read_text())['locales']
def run(*c,env=None,check=True):return subprocess.run(c,capture_output=True,text=True,check=check,env=env)
# The full seven-view capture owns this simulator until every locale is complete.
while len(list((out/'native').glob('*/vision/provenance.json')))<55:time.sleep(15)
run('xcrun','simctl','install',device,str(app))
for locale in locales:
 folder=out/'native'/locale/'vision';proof=folder/'provenance.json';data=json.loads(proof.read_text());prior=data.get('captureOverrides',{}).get('4-packing');target=folder/'4-packing.png'
 if prior and prior.get('binary')==binary and prior['sha256']==sha(target):print('CACHED packing',locale,flush=True);continue
 env={**os.environ,**{'SIMCTL_CHILD_'+k:v for k,v in {'FV_DEBUG_INMEMORY':'1','FV_DEBUG_SEED':'1','FV_DEBUG_SKIP_ONBOARDING':'1','FV_DEBUG_TAB':'trips','FV_DEBUG_OPEN_TRIP':'1','FV_DEBUG_SCROLL':'packing','XCTestConfigurationFilePath':'/tmp/kinfold-marketing-capture'}.items()}}
 run('xcrun','simctl','terminate',device,bundle,check=False);r=run('xcrun','simctl','launch',device,bundle,'-AppleLanguages',f'({locale})','-AppleLocale',locale.replace('-','_'),env=env);pid=int(r.stdout.strip().rsplit(':',1)[1]);time.sleep(9);os.kill(pid,0);run('xcrun','simctl','io',device,'screenshot',str(target));digest=sha(target);data['images']['4-packing.png']=digest;data.setdefault('captureOverrides',{})['4-packing']={'binary':binary,'sha256':digest,'reason':'Native packing scroll; outer ScrollViewReader capture hook only','patch':'capture/vision-packing-scroll.patch'};proof.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print('CAPTURED packing',locale,flush=True)
