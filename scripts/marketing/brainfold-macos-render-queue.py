"""Render completed native captures in source-locale order; wait only on own capture markers."""
import json,subprocess,time
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'docs/marketing/october-2026/brainfold-1.2.1';locales=json.loads((root/'docs/marketing/october-2026/localized/languages.json').read_text())['brainfold']['locales'];deadline=time.monotonic()+3600
for locale in locales:
 while not (out/'native'/locale/'provenance.json').exists():
  if time.monotonic()>deadline:raise RuntimeError('Capture deadline exceeded; completed work preserved')
  time.sleep(2)
 r=subprocess.run(['node','scripts/marketing/brainfold-store-render.mjs',f'--locales={locale}','--formats=mac'],cwd=root)
 if r.returncode:raise RuntimeError('Render failed: '+locale)
