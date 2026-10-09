"""Prepare a source archive and compile the isolated capture-only Giftly Mac app."""
import argparse, io, subprocess, tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REVISION = '498473153fb492cbca2c6face9bad0853a4c079e'
parser = argparse.ArgumentParser()
parser.add_argument('--work', type=Path, required=True)
args = parser.parse_args()
work = args.work.resolve()
assert not (work / 'source').exists(), 'Use a fresh task-owned directory'
source = work / 'source'
source.mkdir(parents=True)
archive = subprocess.check_output(['git', '-C', str(ROOT.parent / 'Giftly'), 'archive', REVISION])
with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
    # git archive contains tracked files; validate paths for Python 3.9 compatibility.
    for member in tar.getmembers():
        assert not member.issym() and not member.islnk()
        assert (source / member.name).resolve().is_relative_to(source)
    tar.extractall(source)
(source / 'Giftly/App/GiftlyApp.swift').write_bytes((ROOT / 'docs/marketing/october-2026/giftly-macos/CaptureMain.swift').read_bytes())
project = source / 'project.yml'
project.write_text(project.read_text().replace('com.magiclabsolutions.giftly','com.magiclabsolutions.giftly.marketingcapture'))
subprocess.run(['xcodegen', 'generate'], cwd=source, check=True)
with (work / 'build.log').open('w') as log:
    subprocess.run(['xcodebuild','-project','Giftly.xcodeproj','-scheme','Giftly','-configuration','Debug',
        '-destination','platform=macOS,arch=arm64','-derivedDataPath',str(work / 'dd'),'CODE_SIGNING_ALLOWED=NO','build'],
        cwd=source, stdout=log, stderr=subprocess.STDOUT, check=True)
print(work / 'dd/Build/Products/Debug/Giftly.app/Contents/MacOS/Giftly')
