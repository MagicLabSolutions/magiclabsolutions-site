"""Verify creative dimensions, metadata limits, captions, video streams and calendar assets."""
import csv,json,subprocess
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[2];out=root/'docs/marketing/october-2026'
p=json.loads((out/'campaign.json').read_text())['products'];counts={'store':0,'social':0,'carousel':0,'video':0}
for product in p:
    folder=out/'exports/en-US'/product['slug']
    assert len(product['title'])<=30 and len(product['subtitle'])<=30
    if product['device']!='web':assert len(product['keywords'])<=100
    for kind in ['store','social','carousel']:
        if kind=='store' and product.get('preserve_store'):assert not list(folder.glob('store-*.png'));continue
        expected=(1080,1350) if kind!='store' else (2880,1800) if product['device']=='mac' else (2400,1500) if product['device']=='web' else (2868,1320) if product['device']=='landscape' else (1320,2868)
        for n in range(1,(len(product['panels']) if kind=='store' else 4)+1):
            with Image.open(folder/f'{kind}-{n}.png') as im:assert im.size==expected,(product['slug'],kind,n,im.size)
            counts[kind]+=1
    if product.get('play_store'):
        for n in range(1,len(product['play_store']['panels'])+1):
            with Image.open(folder/f'play-store-{n}.png') as im:assert im.size==(1080,1920)
            assert (folder/f'play-store-{n}.png').stat().st_size<8*1024*1024
            counts.setdefault('play_store',0);counts['play_store']+=1
    if product.get('ipad_store'):
        for n in range(1,len(product['ipad_store']['panels'])+1):
            with Image.open(folder/f'ipad-store-{n}.png') as im:assert im.size==(2064,2752)
            counts.setdefault('ipad_store',0);counts['ipad_store']+=1
    for n in [1,2]:
        video=folder/f'reel-{n}.mp4';meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_type,codec_name,width,height:format=duration','-of','json',str(video)],text=True))
        stream=next(s for s in meta['streams'] if s['codec_type']=='video');assert (stream['width'],stream['height'])==(1080,1920);assert stream['codec_name']=='h264'
        assert any(s['codec_type']=='audio' for s in meta['streams']);assert float(meta['format']['duration'])>=10
        assert '-->' in (folder/f'reel-{n}.srt').read_text();assert (folder/f'reel-{n}.vtt').read_text().startswith('WEBVTT')
        counts['video']+=1
rows=list(csv.DictReader((out/'calendar.csv').open()));assert len(rows)==96
for row in rows:
    assert row['date'].startswith('2026-10-')
    for name in row['asset_files'].split(';'):assert (out/name).is_file(),name
assert len(list(csv.DictReader((out/'studio-calendar.csv').open())))==12
(out/'creative-validation.json').write_text(json.dumps({'passed':True,'counts':counts,'product_slots':96,'studio_slots':12,'voice_plan_recordings':len(json.loads((out/'audio-plan.json').read_text())['recordings'])},indent=2)+'\n')
print('PASS',counts,'96 product slots, 12 studio posts, caption tracks and prepared narration plan.')
