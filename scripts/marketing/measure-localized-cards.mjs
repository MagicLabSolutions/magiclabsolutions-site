/** Measure actual flat card components in each native capture. Never paints UI. */
import fs from'node:fs/promises';import path from'node:path';import{createRequire}from'node:module';
const require=createRequire('/Users/fabio.hoffmann/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');const sharp=require('sharp');sharp.cache(false);
const base='docs/marketing/october-2026',out=base+'/localized',inventory=JSON.parse(await fs.readFile(out+'/languages.json'));
async function components(file,mode="white"){const meta=await sharp(file).metadata(),step=4,{data,info}=await sharp(file).resize({width:Math.round(meta.width/step),kernel:'nearest'}).removeAlpha().raw().toBuffer({resolveWithObject:true}),{width:W,height:H,channels:C}=info;const mask=new Uint8Array(W*H),queue=new Int32Array(W*H);for(let i=0;i<mask.length;i++)mask[i]=(mode==='blue'?(data[i*C+2]>data[i*C]*1.2&&data[i*C+2]>data[i*C+1]*1.1&&data[i*C+2]>100&&data[i*C]<180&&data[i*C+1]<180):Math.min(data[i*C],data[i*C+1],data[i*C+2])>253)?1:0;const result=[];for(let start=0;start<mask.length;start++){if(!mask[start])continue;let first=0,last=1,minX=W,minY=H,maxX=0,maxY=0;queue[0]=start;mask[start]=0;while(first<last){const id=queue[first++],x=id%W,y=Math.floor(id/W);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);for(const n of [x? id-1:-1,x<W-1?id+1:-1,y?id-W:-1,y<H-1?id+W:-1])if(n>=0&&mask[n]){mask[n]=0;queue[last++]=n}}const w=maxX-minX+1,h=maxY-minY+1;if(w>W*.2&&h>H*.025&&last/(w*h)>.64&&minY>H*.12)result.push({rect:[minX*step,minY*step,(maxX+1)*step,(maxY+1)*step],area:last*16})}return result.sort((a,b)=>b.area-a.area)}
for(const slug of process.argv.slice(2)){for(const locale of inventory[slug].locales)for(const platform of ['iphone','ipad']){const folder=`${out}/native/${slug}/${locale}/${platform}`,panels=Array.from({length:slug==='memories'?4:6},()=>[]);try{await fs.access(folder)}catch{continue}if(slug==='brainfold'){
 const file=folder+'/native-2.png';const cards=await components(file);if(cards[0])panels[1]=[{source:'/'+file,rect:cards[0].rect,left:.055,top:.525,width:.89,radius:50,angle:-2,measurement:'pure-white connected native card component'}];
 const quiz=folder+'/native-3.png',answers=(await components(quiz)).filter(c=>c.rect[3]-c.rect[1]< (platform==='ipad'?2752:2868)*.2).sort((a,b)=>a.rect[1]-b.rect[1]);
 panels[2]=answers.slice(0,2).map((c,i)=>({source:'/'+quiz,rect:c.rect,left:i?.045:.03,top:i?.75:.62,width:i?.92:.94,radius:30,angle:i?2:-2,measurement:'complete native answer card component'}));
 const tutor=folder+'/native-4.png',questions=await components(tutor,'blue');
 if(questions[0])panels[3]=[{source:'/'+tutor,rect:questions[0].rect,left:.08,top:.6,width:.87,radius:28,angle:-2,measurement:'complete native blue chat bubble component'}];

}else if(slug==='myrenewals'){
 for(const [index,target]of [[1,platform==='ipad'?340:600],[3,platform==='ipad'?506:825],[4,platform==='ipad'?687:1122]]){
  const file=folder+`/native-${index+1}.png`,meta=await sharp(file).metadata(),cards=(await components(file)).filter(c=>c.rect[2]-c.rect[0]>meta.width*.5&&c.rect[3]-c.rect[1]<meta.height*.25).sort((a,b)=>Math.abs((a.rect[1]+a.rect[3])/2-target)-Math.abs((b.rect[1]+b.rect[3])/2-target));
  if(cards[0])panels[index]=[{source:'/'+file,rect:cards[0].rect,left:.025,top:.66,width:.95,radius:45,angle:-2,measurement:'complete connected native subscription card'}];
 }
}else if(slug==='zuzu'){
 const file=folder+'/native-2.png',meta=await sharp(file).metadata();
 const target=meta.height*(platform==='iphone'?.63:.65);
 const cards=(await components(file)).filter(c=>c.rect[2]-c.rect[0]>meta.width*.6 && c.rect[3]-c.rect[1]<meta.height*.16 && c.rect[1]>meta.height*.45 && c.rect[3]<meta.height*.89).sort((a,b)=>Math.abs((a.rect[1]+a.rect[3])/2-target)-Math.abs((b.rect[1]+b.rect[3])/2-target));
 if(cards[0])panels[1]=[{source:'/'+file,rect:cards[0].rect,left:.025,top:.64,width:.95,radius:48,angle:-2,measurement:'complete connected native timeline card, remeasured for each locale'}];
}else if(slug==='memories'){
 const file=folder+'/native-4.png',cards=await components(file);const candidates=cards.filter(c=>(c.rect[2]-c.rect[0])< (platform==='ipad'?2064:1320)*.57).sort((a,b)=>a.rect[1]-b.rect[1]);
 // Pick complete soundtrack cards near the second row, then the neighboring choice.
 const target=platform==='ipad'?780:1250;const sorted=candidates.sort((a,b)=>Math.abs((a.rect[1]+a.rect[3])/2-target)-Math.abs((b.rect[1]+b.rect[3])/2-target));
 panels[3]=sorted.slice(0,2).map((c,i)=>({source:'/'+file,rect:c.rect,left:i?.43:.02,top:i?.8:.65,width:platform==='ipad'?.78:.54,radius:55,angle:i?3:-3,measurement:'pure-white connected native soundtrack card component'}));
}
if(panels.some(p=>p.length)){const dest=`${out}/card-bounds/${slug}/${locale}/${platform}.json`;await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,JSON.stringify(panels,null,2)+'\n')}
console.log(slug,locale,platform,panels.reduce((n,p)=>n+p.length,0),'measured');}}
