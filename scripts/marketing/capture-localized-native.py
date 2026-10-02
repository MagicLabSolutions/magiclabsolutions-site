"""Capture existing offline marketing binaries on this task's dedicated simulators.

Does not build/change app repositories, access accounts, or mutate user simulators.
Resume files by locale/scene. Simulator IDs are explicit command-line arguments.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'docs/marketing/october-2026/localized'
OLD = {'iphone': '8BA967B0-0E64-4135-9E9E-5DF5335E9079',
       'ipad': '7E98BBE3-6DA5-439F-BCC3-63A9C9F2480C'}
LIBRARY = Path.home()/'Library/Developer/CoreSimulator/Devices'
SCENES = {
    'zuzu': ['overview','timeline','insights','growth','pregnancy','nap'],
    'soooon': ['home','detail','calendar','personality','holidays','wardrobe'],
    'brainfold': ['study','flashcards','quiz','tutor','summary','battle'],
    'myrenewals': ['home', 'import', 'renewals', 'profiles', 'detail', 'plans'],
    'memories': ['home', 'film', 'highlights', 'soundtrack'],
    'sundust': [['-demo','saturn','-photo','-autothrust'], ['-demo','eva','-photo'],
                ['-demo','pad','-panel','build'], ['-demo','map','-photo'],
                ['-demo','eva','-sight','cow'], ['-demo','veygift','-photo']],
}
def run(*args, check=True):
    return subprocess.run(['xcrun','simctl',*args], check=check,
                          capture_output=True, text=True).stdout.strip()

def main():
    slug, platform, simulator = sys.argv[1:4]
    locales = sys.argv[4:] or json.loads((OUT/'languages.json').read_text())[slug]['locales']
    run('boot', simulator, check=False)
    run('bootstatus', simulator, '-b')
    bundle = {'zuzu':'com.magiclabsolutions.zuzu','soooon':'com.magiclabsolutions.soooon','brainfold':'com.magiclabsolutions.brain.fold','myrenewals':'com.magiclabsolutions.subscriptionmanager',
              'memories':'com.magiclabsolutions.memories.marketing' if platform=='ipad' else 'com.magiclabsolutions.memories',
              'sundust':'com.magiclabsolutions.sundust'}[slug]
    import plistlib
    apps = LIBRARY/OLD[platform]/'data/Containers/Bundle/Application'
    app = Path(os.environ['MAGICLAB_CAPTURE_APP']) if os.environ.get('MAGICLAB_CAPTURE_APP') else next(p.parent for p in apps.glob('*/*.app/Info.plist')
               if plistlib.loads(p.read_bytes()).get('CFBundleIdentifier') == bundle)
    run('install', simulator, str(app))
    run('ui', simulator, 'appearance', 'light')
    run('status_bar', simulator, 'override', '--time','9:41', '--batteryState','charged',
        '--batteryLevel','100','--wifiMode','active','--wifiBars','3')
    if slug == 'memories':
        old_data = LIBRARY/OLD[platform]/'data/Containers/Data/Application'
        original = next(p for p in old_data.glob('*/Library/Caches/marketing-stock')
                        if len(list(p.glob('*'))) > 0)
        target = Path(run('get_app_container', simulator, bundle, 'data'))/'Library/Caches/marketing-stock'
        shutil.copytree(original, target, dirs_exist_ok=True)
    records = []
    try:
        for locale in locales:
            folder = OUT/'native'/slug/locale/platform
            folder.mkdir(parents=True, exist_ok=True)
            for i, scene in enumerate(SCENES[slug], 1):
                file = folder/f'native-{i}.png'
                if not file.exists():
                    args = ['-AppleLanguages',f'({locale})','-AppleLocale',locale.replace('-','_')]
                    args += ['-nogc',*scene] if slug=='sundust' else ['-marketing-screen',scene]
                    if slug=='memories': args += ['-screenshots']
                    if slug=='zuzu':
                        args += ['-SCREENSHOT_MODE','-com.apple.TipKit.HideAllTips','1','-UIViewAnimationsDisabled','YES']
                        if scene=='pregnancy': args += ['-SCREENSHOT_EXPECTING']
                    if slug=='brainfold': args += ['-SCREENSHOT_MODE','-UIViewAnimationsDisabled','YES']
                    log = folder/f'native-{i}.log'
                    with log.open('w') as stream:
                        child_env = dict(os.environ)
                        if slug=='zuzu': child_env['SIMCTL_CHILD_TZ']='Etc/GMT-5'
                        if slug=='soooon': child_env.update(SIMCTL_CHILD_SOOOON_DEMO='1',SIMCTL_CHILD_SOOOON_NOW='2026-11-12T08:41:00Z',SIMCTL_CHILD_SOOOON_CALENDAR='allowed')
                        process = subprocess.Popen(['xcrun','simctl','launch','--console-pty',
                            '--terminate-running-process',simulator,bundle,*args], stdout=stream, stderr=subprocess.STDOUT, env=child_env)
                        try:
                            if slug=='memories':
                                for _ in range(90):
                                    time.sleep(.5)
                                    s = log.read_text(errors='replace')
                                    if 'Terminating app due to' in s: raise RuntimeError(f'{slug}/{locale}/{scene}: native crash')
                                    if '[ScreenshotSeed] done in' in s: break
                                else: raise RuntimeError(f'{slug}/{locale}/{scene}: fixture not ready')
                            if slug=='zuzu':
                                for _ in range(40):
                                    time.sleep(.25)
                                    if '[MarketingCapture] scene ready' in log.read_text(errors='replace'): break
                                else: raise RuntimeError(f'{slug}/{locale}/{scene}: fixture not ready')
                                if scene in ['growth','timeline']: time.sleep(2.5)
                            time.sleep(4 if slug=='sundust' and i in [1,6] else 2)
                            run('io', simulator, 'screenshot', str(file))
                        finally:
                            run('terminate',simulator,bundle,check=False)
                            try: process.wait(timeout=1)
                            except subprocess.TimeoutExpired: process.terminate()
                records.append({'locale':locale, 'platform':platform, 'panel':i,
                    'source':str(file.relative_to(ROOT)), 'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
            print(slug, platform, locale, 'captured', flush=True)
            (OUT/f'capture-{slug}-{platform}.json').write_text(json.dumps({'bundle':bundle,
                'binary_sha256':hashlib.sha256((app/app.stem).read_bytes()).hexdigest(),
                'simulator':simulator,'capture_timezone':'Etc/GMT-5 (app process only)' if slug=='zuzu' else 'device default','method':'Existing isolated offline capture binary, real native views, per-locale launch arguments',
                'records':records}, indent=2)+'\n')
    finally:
        run('terminate',simulator,bundle,check=False)
        run('shutdown',simulator,check=False)

if __name__=='__main__': main()
