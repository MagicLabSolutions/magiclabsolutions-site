"""Record approved-scope English draft narration with the configured ElevenLabs account.

Outputs are cached by text and voice settings. Keys never enter the campaign files.
This script produces files only; it has no publishing capability.
"""
import argparse,base64,hashlib,json,os,re,subprocess,urllib.request,urllib.error
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/marketing/october-2026'
VOICES={'Maisie':'QtY3JBOUKEB5xzrRfOKc','George':'JBFqnCBsd6RMkjVDRZzb','Roger':'CwhRBWXzGAHq8TQ4Fs17','Alice':'Xb7hH8MSUJpSbSDYk0k2','Jessica':'cgSgspJ2msm6clMCkdW9','River':'SAz9YHcvj6GT2YYXdXww'}

def api_key():
    key=os.environ.get('ELEVENLABS_API_KEY')
    if key:return key
    path=Path.home()/'Development/Tools/ai.env'
    for line in path.read_text().splitlines():
        line=line.strip().removeprefix('export ').strip()
        if line.startswith('ELEVENLABS_API_KEY='):return line.split('=',1)[1].strip().strip('\"\'')
    raise RuntimeError('Configure ELEVENLABS_API_KEY locally before recording.')

def timestamp(seconds):
    ms=round(seconds*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'

def subtitles(alignment):
    chars=alignment['characters'];starts=alignment['character_start_times_seconds'];ends=alignment['character_end_times_seconds']
    full=''.join(chars);words=[]
    for match in re.finditer(r'\S+',full):words.append((match.group(),starts[match.start()],ends[match.end()-1]))
    groups=[];current=[]
    for word in words:
        if current and (len(' '.join(w[0] for w in current+[word]))>42 or word[2]-current[0][1]>3.0):groups.append(current);current=[]
        current.append(word)
        if word[0].endswith(('.', '?','!')):groups.append(current);current=[]
    if current:groups.append(current)
    return '\n\n'.join(f'{i+1}\n{timestamp(g[0][1]+.35)} --> {timestamp(g[-1][2]+.35)}\n'+ ' '.join(w[0] for w in g).replace('Tumtum','TumTum') for i,g in enumerate(groups))+'\n'

parser=argparse.ArgumentParser(description='Prepare or record English narration; no publishing.')
parser.add_argument('--record',action='store_true',help='Generate missing narration using account credit. Without this flag, write a plan only.')
parser.add_argument('--products',nargs='*',help='Optional product slugs to record.')
args=parser.parse_args()
products=[p for p in json.loads((OUT/'campaign.json').read_text())['products'] if p['slug']!='tumtum' and (not args.products or p['slug'] in args.products)]
plan=[]
for p in products:
    for i,text in enumerate(p['narration']):
        plan.append({'slug':p['slug'],'reel':i+1,'voice':p['voice'],'voice_id':VOICES[p['voice']],'model':'eleven_multilingual_v2','text':text,'characters':len(text),'path':f'audio/{p["slug"]}/reel-{i+1}.mp3'})
(OUT/'audio-plan.json').write_text(json.dumps({'mode':'prepared','reuse_approved_tumtum_audio':True,'recordings':plan,'estimated_text_characters':sum(r['characters'] for r in plan),'estimated_characters_are_not_a_billing_quote':True},indent=2)+'\n')
if not args.record:
    print(f'Prepared {len(plan)} narrations ({sum(r["characters"] for r in plan)} text characters). No API request. Use --record when credit is available.')
    raise SystemExit(0)
# A read-only credit check prevents partially spending a campaign budget by default.
key=api_key()
request=urllib.request.Request('https://api.elevenlabs.io/v1/user/subscription',headers={'xi-api-key':key})
with urllib.request.urlopen(request,timeout=30) as response:subscription=json.load(response)
remaining=max(0,subscription.get('character_limit',0)-subscription.get('character_count',0))
if remaining<sum(r['characters'] for r in plan):
    raise SystemExit(f'Not enough included ElevenLabs credit for this selection: {remaining} characters remain. No recording requested. Choose fewer --products or retry after replenishment.')
records=[]
for p in products:
    directory=OUT/'audio'/p['slug'];directory.mkdir(parents=True,exist_ok=True)
    for i,text in enumerate(p['narration']):
        settings={'stability':.46,'similarity_boost':.75,'style':.25,'use_speaker_boost':True,'speed':.96}
        body={'text':text,'model_id':'eleven_multilingual_v2','language_code':'en','voice_settings':settings}
        digest=hashlib.sha256(json.dumps([VOICES[p['voice']],body],sort_keys=True).encode()).hexdigest()
        target=directory/f'reel-{i+1}.mp3';meta=target.with_suffix('.json')
        if not(target.exists() and meta.exists() and json.loads(meta.read_text()).get('request_sha256')==digest):
            request=urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICES[p["voice"]]}/with-timestamps?output_format=mp3_44100_128',data=json.dumps(body).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
            try:
                with urllib.request.urlopen(request,timeout=90) as response:data=json.load(response)
            except urllib.error.HTTPError as exc:
                raise SystemExit(f'ElevenLabs refused recording (HTTP {exc.code}). Existing videos remain available; no API key was written to disk.') from None
            target.write_bytes(base64.b64decode(data['audio_base64']))
            alignment=data.get('normalized_alignment') or data['alignment']
            meta.write_text(json.dumps({'request_sha256':digest,'provider':'ElevenLabs','voice':p['voice'],'voice_id':VOICES[p['voice']],'model':body['model_id'],'text':text,'settings':settings,'alignment':alignment},indent=2)+'\n')
        data=json.loads(meta.read_text());(directory/f'reel-{i+1}.srt').write_text(subtitles(data['alignment']))
        seconds=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(target)],text=True))
        records.append({'slug':p['slug'],'reel':i+1,'voice':p['voice'],'duration':seconds,'audio_sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'path':str(target.relative_to(ROOT))})
        print(f'{p["name"]}: narration {i+1}, {seconds:.1f}s',flush=True)
(OUT/'audio-manifest.json').write_text(json.dumps(records,indent=2)+'\n')
