/** Replace only the fictional cat photograph with its approved empty-room plate.
 * Archival native captures and UI pixels outside the photograph stay unchanged.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES||'/Users/fabio.hoffmann/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','package.json'));
const sharp=require('sharp');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const platePath='docs/marketing/october-2026/assets/memories/cat-room-empty.png';
let reference;
async function photograph(bytes){
 const {data,info}=await sharp(bytes).removeAlpha().raw().toBuffer({resolveWithObject:true}),{width:w,height:h,channels:c}=info;
 const mask=new Uint8Array(w*h),queue=new Int32Array(w*h);let largest=null;
 for(let y=Math.floor(h*.2);y<h*.79;y++)for(let x=Math.floor(w*.12);x<w*.88;x++){
  const i=y*w+x,j=i*c;if(Math.max(data[j],data[j+1],data[j+2])>92)mask[i]=1;
 }
 for(let i=0;i<mask.length;i++)if(mask[i]){
  let head=0,tail=1,minX=w,maxX=0,minY=h,maxY=0;queue[0]=i;mask[i]=0;
  while(head<tail){const n=queue[head++],x=n%w,y=Math.floor(n/w);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   for(const next of [n-1,n+1,n-w,n+w])if(next>=0&&next<mask.length&&mask[next]){mask[next]=0;queue[tail++]=next;}
  }
  if(!largest||tail>largest.area)largest={area:tail,left:minX,top:minY,width:maxX-minX+1,height:maxY-minY+1};
 }
 if(!largest||largest.width<w*.2||largest.height<h*.25)throw Error('Memories sample photograph bounds not found');
 const {area,...rect}=largest;return rect;
}
async function signature(bytes,rect){return sharp(bytes).extract(rect).resize(96,170,{fit:'fill'}).removeAlpha().raw().toBuffer()}
export async function memoriesPhotoPlate(bytes){
 const rect=await photograph(bytes);
 if(!reference){const original=await fs.readFile(path.join(process.cwd(),'docs/marketing/october-2026/sources/memories/native-2.png'));reference=await signature(original,await photograph(original));}
 const sig=await signature(bytes,rect);let squared=0;for(let i=0;i<sig.length;i++)squared+=(sig[i]-reference[i])**2;
 const rms=Math.sqrt(squared/sig.length);
 // Localized tablet highlight captures show a landscape rather than the cat.
 if(rms>32)return {buffer:bytes,edit:null};
 const plate=await fs.readFile(platePath),radius=Math.round(rect.width*.087);
 const mask=Buffer.from(`<svg width="${rect.width}" height="${rect.height}"><rect width="100%" height="100%" rx="${radius}" fill="white"/></svg>`);
 const replacement=await sharp(plate).resize(rect.width,rect.height,{fit:'cover'}).ensureAlpha().composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
 const buffer=await sharp(bytes).composite([{input:replacement,left:rect.left,top:rect.top}]).png().toBuffer();
 const before=await sharp(bytes).removeAlpha().raw().toBuffer({resolveWithObject:true}),after=await sharp(buffer).removeAlpha().raw().toBuffer();
 const {width,height,channels}=before.info;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(x<rect.left||x>=rect.left+rect.width||y<rect.top||y>=rect.top+rect.height){const i=(y*width+x)*channels;for(let n=0;n<channels;n++)if(before.data[i+n]!==after[i+n])throw Error('Photo edit changed native UI pixels');}
 return {buffer,edit:{kind:'fictional sample photo only; cat removed from background behind transparent foreground cutout',rect,source_sha256:hash(bytes),plate:platePath,plate_sha256:hash(plate),ui_outside_photo:'pixel-identical',reference_rms:rms}};
}
