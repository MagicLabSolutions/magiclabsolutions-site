"""Compose social product tours from inspected captures and real recorded gameplay.

All videos are English drafts for review. No external upload is implemented.
"""
import json,math,shutil,subprocess,wave
from pathlib import Path
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/marketing/october-2026'
STUDIO=ROOT.parent
FPS=30

def run(args):subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*args],check=True)
def duration(path):return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(path)],text=True))
def stamp(t,vtt=False):
    ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}{"." if vtt else ","}{ms%1000:03}'

def music(path,kind):
    """Original, restrained draft beds. Synthesized here; no stock-music rights needed."""
    sr=44100;seconds=24;t=np.arange(sr*seconds)/sr;signal=np.zeros_like(t)
    notes=[48,55,60,64,55,60,62,67] if kind=='warm' else [45,52,57,60,52,57,64,60]
    interval=.75 if kind=='warm' else 1.25
    for k,start in enumerate(np.arange(0,seconds-1,interval)):
        f=440*2**((notes[k%len(notes)]-69)/12);dt=t-start
        env=np.where(dt>=0,(1-np.exp(-np.maximum(0,dt)*65))*np.exp(-np.maximum(0,dt)*2.4),0)
        signal+=.035*env*(np.sin(2*np.pi*f*dt)+.23*np.sin(2*np.pi*2*f*dt)+.08*np.sin(2*np.pi*3*f*dt))
    signal*=np.minimum(t/1,1)*np.minimum((seconds-t)/2,1)
    stereo=np.stack([signal,signal*.96],axis=1)
    with wave.open(str(path),'wb') as file:file.setnchannels(2);file.setsampwidth(2);file.setframerate(sr);file.writeframes((np.clip(stereo,-1,1)*32767).astype('<i2').tobytes())

audio=OUT/'audio';audio.mkdir(exist_ok=True)
for kind in ['warm','space']:music(audio/f'original-{kind}-bed.wav',kind)
records=[]
products=json.loads((OUT/'campaign.json').read_text())['products']
for p in products:
    folder=OUT/'exports/en-US'/p['slug'];work=folder/'work';work.mkdir(exist_ok=True)
    for reel in [1,2]:
        if (audio/p['slug']/f'reel-{reel}.mp3').exists():
            for ext in ['mp4','srt','vtt']:
                old=folder/f'reel-{reel}.{ext}';backup=folder/f'reel-{reel}-music-only.{ext}'
                if old.exists() and not backup.exists():shutil.copy2(old,backup)
    if p['slug'] in ['tumtum','sundust']:
        for variant in range(2):
            target=folder/f'reel-{variant+1}.mp4'
            if p['slug']=='tumtum':
                source=STUDIO/'TumTum/fastlane/app-previews/en-US'/('tumtum-app-preview-iphone.mp4' if variant==0 else 'tumtum-parents-preview-iphone.mp4')
                run(['-i',str(source),'-vf','scale=-2:1920,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xFFF7E7','-c:v','libx264','-preset','fast','-crf','20','-threads','2','-c:a','copy','-movflags','+faststart',str(target)])
                for extension in ['srt','vtt']:shutil.copy2(source.with_suffix('.'+extension),folder/f'reel-{variant+1}.{extension}')
            else:
                shot='r02' if variant==0 else 'r05';source=STUDIO/f'Sundust/out/v2/{shot}.mp4';shutil.copy2(source,target)
                script=json.loads((STUDIO/f'Sundust/tools/shots/{shot}.json').read_text());cues=[]
                for cue in script['overlays']:
                    text=cue.get('text') or ' '.join(cue.get('lines',[])) or 'Sundust. Discover the game.'
                    cues.append((cue['in'],cue['out'],text))
                srt='\n\n'.join(f'{i+1}\n{stamp(a)} --> {stamp(b)}\n{text}' for i,(a,b,text) in enumerate(cues))+'\n'
                (folder/f'reel-{variant+1}.srt').write_text(srt);(folder/f'reel-{variant+1}.vtt').write_text('WEBVTT\n\n'+__import__('re').sub(r'(\d\d:\d\d:\d\d),(\d\d\d)',r'\1.\2',srt))
                narration=audio/p['slug']/f'reel-{variant+1}.mp3'
                if narration.exists():
                    seconds=max(duration(source),duration(narration)+1)
                    run(['-stream_loop','-1','-i',str(source),'-i',str(narration),'-filter_complex','[0:a]volume=0.2[bed];[1:a]adelay=350|350,loudnorm=I=-17:TP=-1.5:LRA=7[voice];[bed][voice]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=.84[a]','-map','0:v','-map','[a]','-t',str(seconds),'-c:v','copy','-c:a','aac','-b:a','160k','-movflags','+faststart',str(target)])
                    shutil.copy2(audio/p['slug']/f'reel-{variant+1}.srt',folder/f'reel-{variant+1}.srt')
                    srt=(folder/f'reel-{variant+1}.srt').read_text()
                    (folder/f'reel-{variant+1}.vtt').write_text('WEBVTT\n\n'+__import__('re').sub(r'(\d\d:\d\d:\d\d),(\d\d\d)',r'\1.\2',srt))

            run(['-ss','1','-i',str(target),'-frames:v','1','-update','1',str(folder/f'reel-{variant+1}-poster.jpg')])
            records.append({'slug':p['slug'],'reel':variant+1,'kind':'recorded-real-gameplay','seconds':duration(target),'dimensions':[1080,1920],'voice_recorded':p['slug']=='tumtum' or (audio/p['slug']/f'reel-{variant+1}.mp3').exists(),'source':str(source.relative_to(STUDIO)),'file':str(target.relative_to(ROOT))})
            print(f'{p["name"]}: real gameplay reel {variant+1} ready',flush=True)
        shutil.rmtree(work);continue
    for variant in range(2):
        narration=audio/p['slug']/f'reel-{variant+1}.mp3'
        seconds=max(21,math.ceil(duration(narration)+1.2)) if narration.exists() else 21
        segment_duration=seconds/3
        segments=[]
        for i in range(3):
            source=folder/f'reel-{variant+1}-frame-{i+1}.png';target=work/f'v{variant+1}-{i}.mp4'
            # Calm cuts; app pixels remain undistorted and UI text stays readable.
            run(['-loop','1','-framerate',str(FPS),'-i',str(source),'-t',str(segment_duration),'-vf','format=yuv420p','-c:v','libx264','-preset','fast','-crf','20','-threads','2','-an',str(target)])
            segments.append(target)
        concat=work/'concat.txt';concat.write_text('\n'.join("file '"+str(x).replace("'","'\\''")+"'" for x in segments)+'\n')
        silent=folder/f'reel-{variant+1}-silent.mp4';run(['-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(silent)])
        bed=STUDIO/'TumTum/Tools/store/video/audio/en-US/music.mp3' if p['slug']=='tumtum' else audio/('original-space-bed.wav' if p['slug'] in ['groundcontrol','sundust','poof','toctoc','brainfold','myrenewals'] else 'original-warm-bed.wav')
        target=folder/f'reel-{variant+1}.mp4'
        if narration.exists():
            run(['-i',str(silent),'-i',str(narration),'-stream_loop','-1','-i',str(bed),'-filter_complex',f'[1:a]adelay=350|350,loudnorm=I=-17:TP=-1.5:LRA=7[voice];[2:a]volume=0.4,afade=t=in:d=0.7,afade=t=out:st={seconds-2}:d=2[music];[voice][music]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=.84[a]','-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','160k','-t',str(seconds),'-movflags','+faststart',str(target)])
            shutil.copy2(audio/p['slug']/f'reel-{variant+1}.srt',folder/f'reel-{variant+1}.srt')
        else:
            run(['-i',str(silent),'-stream_loop','-1','-i',str(bed),'-map','0:v','-map','1:a','-af',f'volume={.3 if p["slug"]=="tumtum" else 1},afade=t=in:d=0.7,afade=t=out:st={seconds-2}:d=2','-c:v','copy','-c:a','aac','-b:a','128k','-t',str(seconds),'-movflags','+faststart',str(target)])
            lines=[p['hooks'][variant],*p['steps'][variant],p['cta']+'. '+p['name']+'.']
            times=[0,2.5,7,14,18.5,seconds]
            (folder/f'reel-{variant+1}.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(times[i])} --> {stamp(times[i+1])}\n{line}' for i,line in enumerate(lines))+'\n')
        srt=(folder/f'reel-{variant+1}.srt').read_text();(folder/f'reel-{variant+1}.vtt').write_text('WEBVTT\n\n'+__import__('re').sub(r'(\d\d:\d\d:\d\d),(\d\d\d)',r'\1.\2',srt))
        # The website uses user-controlled, captioned video with a lightweight poster.
        records.append({'slug':p['slug'],'reel':variant+1,'kind':'edited-screen-walkthrough','seconds':seconds,'dimensions':[1080,1920],'voice_recorded':narration.exists(),'soundtrack':'approved TumTum ElevenLabs instrumental' if p['slug']=='tumtum' else 'original procedural instrumental','file':str(target.relative_to(ROOT))})
        print(f'{p["name"]}: reel {variant+1} ready',flush=True)
    shutil.rmtree(work)
(OUT/'video-manifest.json').write_text(json.dumps(records,indent=2)+'\n')
