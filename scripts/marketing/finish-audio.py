"""Record prepared narration, then refresh videos, captions, review and site assets.
Default mode has no network activity or paid generation. --record is intentional.
"""
import argparse,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--record',action='store_true');args=p.parse_args()
subprocess.run([sys.executable,str(root/'scripts/marketing/voice.py'),*(['--record'] if args.record else [])],cwd=root,check=True)
if args.record:
    for script in ['video.py','package.py','document.py','locales.py']:
        subprocess.run([sys.executable,str(root/'scripts/marketing'/script)],cwd=root,check=True)
    print('Narrated creative is ready for review. Rebuild Jekyll to inspect the updated local site. No publishing was performed.')
else:print('Ready to add narration later: run this same command with --record after replenishing ElevenLabs credit.')
