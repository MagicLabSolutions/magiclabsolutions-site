/** Materialize measured native UI rectangles so clipping cannot delay image loading. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const sharp=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES||'/Users/fabio.hoffmann/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','package.json'))('sharp');
const cache=new Map();
export async function materializeComponent(crop,root=process.cwd()) {
  if(!crop?.image?.src)return null;
  const source=path.join(root,crop.image.src.replace(/^\//,''));
  const bytes=await fs.readFile(source),metadata=await sharp(bytes).metadata();
  const width=Number(crop.width),ratio=Number(crop.ratio);
  if(!(width>0&&ratio>0))return null;
  const scale=metadata.width*100/width;
  const left=Math.round(-Number(crop.left)*scale/100);
  const top=Math.round(-Number(crop.top)*scale/ratio/100);
  const rect={left,top,width:Math.round(scale),height:Math.round(scale/ratio)};
  if(!Object.values(rect).every(Number.isFinite)||left<0||top<0||rect.width<1||rect.height<1||left+rect.width>metadata.width||top+rect.height>metadata.height)return null;
  const sourceHash=crypto.createHash('sha256').update(bytes).digest('hex');
  const hash=crypto.createHash('sha256').update(sourceHash+JSON.stringify(rect)).digest('hex').slice(0,16);
  const target=`/images/native-components/${hash}.webp`;
  if(!cache.has(hash)){
    const pixels=sharp(bytes).extract(rect);
    const stats=await pixels.clone().stats();
    // A uniformly empty source region is not an interface highlight.
    if(stats.channels.slice(0,3).every(channel=>channel.stdev<2))return null;
    await fs.mkdir(path.join(root,'images/native-components'),{recursive:true});
    await pixels.webp({quality:92,effort:5}).toFile(path.join(root,target.slice(1)));
    cache.set(hash,true);
  }
  return {...crop,rendered:{src:target,width:rect.width,height:rect.height,source:crop.image.src,source_sha256:sourceHash,rect}};
}
