"""Capture actual Kinfold views in isolated simulators with in-memory demo data."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
PACKAGE = ROOT / 'docs/marketing/october-2026/kinfold-store'
APP = Path('/private/tmp/kinfold-store-20261011/dd/Build/Products/Debug-iphonesimulator/FamilyVault.app')
BUNDLE = 'com.magiclabsolutions.FamilyVault.marketingcapture'
DEVICES = {
    'iphone': 'EDB927B4-19EC-431F-B9DE-DAA29851A14D',
    'ipad': '3E17B79B-75F5-4575-9A84-9AF8A5CAE794',
}
VIEWS = [
    ('1-vault', {'FV_DEBUG_TAB': 'vault'}),
    ('2-document', {'FV_DEBUG_TAB': 'vault', 'FV_DEBUG_OPEN_FIRST_DOC': '1'}),
    ('3-trip', {'FV_DEBUG_TAB': 'trips', 'FV_DEBUG_OPEN_TRIP': '1'}),
    ('4-packing', {'FV_DEBUG_TAB': 'trips', 'FV_DEBUG_OPEN_TRIP': '1', 'FV_DEBUG_SCROLL': 'packing'}),
    ('5-schedule', {'FV_DEBUG_TAB': 'schedule'}),
    ('6-search', {'FV_DEBUG_TAB': 'search', 'FV_DEBUG_SEARCH': 'passport'}),
    ('aux-smartcopy', {'FV_DEBUG_TAB': 'vault', 'FV_DEBUG_OPEN_FIRST_DOC': '1', 'FV_DEBUG_SMARTCOPY': '1'}),
]

def run(*args, env=None, check=True):
    return subprocess.run(args, env=env, check=check, capture_output=True, text=True)

def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()

if __name__ == '__main__':
    import sys
    platform = sys.argv[1]
    device = DEVICES[platform]
    folder = PACKAGE / 'native/en-US' / platform
    folder.mkdir(parents=True, exist_ok=True)
    run('xcrun', 'simctl', 'install', device, str(APP))
    run('xcrun', 'simctl', 'ui', device, 'appearance', 'dark')
    text_size = 'extra-extra-extra-large' if platform == 'ipad' else 'large'
    run('xcrun', 'simctl', 'ui', device, 'content_size', text_size)
    run('xcrun', 'simctl', 'status_bar', device, 'override', '--time', '9:41', '--dataNetwork', 'wifi', '--wifiMode', 'active', '--wifiBars', '3', '--batteryState', 'charged', '--batteryLevel', '100')
    binary_before = {name: digest(APP / name) for name in ['FamilyVault', 'FamilyVault.debug.dylib']}
    records = []
    for name, hooks in VIEWS:
        run('xcrun', 'simctl', 'terminate', device, BUNDLE, check=False)
        # Existing test-host guard disables live CloudKit publishing in an unsigned simulator.
        launch = {'FV_DEBUG_INMEMORY': '1', 'FV_DEBUG_SEED': '1', 'FV_DEBUG_SKIP_ONBOARDING': '1', 'XCTestConfigurationFilePath': '/tmp/kinfold-marketing-capture', **hooks}
        env = {**os.environ, **{'SIMCTL_CHILD_' + key: value for key, value in launch.items()}}
        process = run('xcrun', 'simctl', 'launch', device, BUNDLE, '-AppleLanguages', '(en)', '-AppleLocale', 'en_US', env=env)
        pid = int(process.stdout.strip().rsplit(':', 1)[1])
        time.sleep(9)
        os.kill(pid, 0)  # Reject an exited app rather than exporting the home screen.
        file = folder / (name + '.png')
        run('xcrun', 'simctl', 'io', device, 'screenshot', str(file))
        records.append({'view': name, 'file': str(file.relative_to(ROOT)), 'sha256': digest(file), 'launchEnvironment': launch})
        print(platform, name, 'captured', flush=True)
    assert binary_before == {name: digest(APP / name) for name in binary_before}, 'Capture binary changed during batch'
    proof = {'sourceCommit': '57a9c8b1b7dabae56ba71cb873160c863d4b8d64', 'platform': platform, 'simulator': device, 'runtime': 'iOS 26.5', 'locale': 'en-US', 'contentSize': text_size, 'bundleIdentifier': BUNDLE, 'isolation': 'Task-owned simulator and bundle; in-memory SwiftData, fictional sample data', 'binary': binary_before, 'records': records}
    (PACKAGE / ('capture-' + platform + '.json')).write_text(json.dumps(proof, indent=2) + '\n')
