/** Prepare traceable native assets for product websites, independent of store compositions. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const root=process.cwd(),out=path.join(root,'images/products'),docs=path.join(root,'docs/portfolio');
const sharp=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES,'package.json'))('sharp');
const campaign=JSON.parse(await fs.readFile('docs/marketing/october-2026/campaign.json','utf8'));
const portfolio=JSON.parse(await fs.readFile('_data/portfolio.json','utf8'));
const records=[],cache=new Map(),products={};
await fs.mkdir(out,{recursive:true});await fs.mkdir(docs,{recursive:true});
async function asset(source,slug,name,maxWidth=1600){
  const file=source.startsWith('/Users/')?source:path.join(root,source.replace(/^\//,''));
  const key=file+'|'+maxWidth;if(cache.has(key))return cache.get(key);
  const bytes=await fs.readFile(file),svg=file.endsWith('.svg'),meta=svg?{}:await sharp(bytes).metadata();
  const target=path.join(out,slug,name+(svg?'.svg':'.webp'));await fs.mkdir(path.dirname(target),{recursive:true});
  if(svg)await fs.writeFile(target,bytes);else await sharp(bytes).resize({width:maxWidth,withoutEnlargement:true}).webp({quality:88,effort:5}).toFile(target);
  const data={src:'/'+path.relative(root,target),width:meta.width,height:meta.height};
  records.push({source:path.relative(root,file),output:data.src,source_sha256:crypto.createHash('sha256').update(bytes).digest('hex'),kind:svg?'existing vector asset':'native pixels or existing brand asset; optimized without content changes'});
  cache.set(key,data);return data;
}
async function frame(f){
  if(!f)return null;
  const {asset:source,...geometry}=f;
  return {...geometry,...await asset(source,'hardware',path.basename(source,'.png'),1600)};
}
async function device(source,f,kind,slug,name){
  const image=await asset(source,slug,name);
  return {image,frame:await frame(f),kind,ratio:f?f.dimensions[0]/f.dimensions[1]:image.width/image.height};
}
async function cutout(c,slug,name){
  const image=await asset(c.source,slug,name),[x,y,x2,y2]=c.rect,w=x2-x,h=y2-y;
  if(x<0||y<0||x2>image.width||y2>image.height)throw Error(slug+' invalid complete component crop');
  return {image,ratio:w/h,width:image.width/w*100,left:-x/w*100,top:-y/h*100,radius:c.radius/w*100,angle:c.angle||-2};
}
const demos={giftly:'gift',brainfold:'flashcard',zuzu:'baby',sundust:'orbit',memories:'memories',myrenewals:'renewals',toctoc:'knock',groundcontrol:'branches',poof:'clean',soooon:'countdown',hooray:'card',tumtum:'toys'};
for(const p of campaign.products){
  const product=portfolio.find(x=>x.slug===p.slug),cfg=p.studio_art||p.store_pilot||{},kind=p.frame?'iphone':p.slug==='hooray'?'browser':'mac';
  const primary=await Promise.all(p.screens.map((s,i)=>device(s,p.frame,kind,p.slug,'screen-'+(i+1))));
  const crops=cfg.primary?.cutouts||cfg.cutouts||[],features=[];
  for(let i=0;i<primary.length;i++){
    const copy=cfg.copy?.[i]||p.panels[i];
    features.push({title:copy[0].replaceAll('\n',' '),description:copy[1].replaceAll('\n',' '),label:p.panels[i][2],device:primary[i],cutout:crops[i]?.[0]?await cutout(crops[i][0],p.slug,'component-'+(i+1)):null});
  }
  const fleet=[{label:kind==='mac'?'Mac':kind==='browser'?'Web':'iPhone',device:primary[0]}];
  if(p.ipad_store)fleet.push({label:'iPad',device:await device(p.ipad_store.screens[0],p.ipad_store.frame,'ipad',p.slug,'ipad')});
  if(p.play_store)fleet.push({label:'Android',device:await device(p.play_store.screens[0],p.play_store.frame,'android',p.slug,'android')});
  if(p.slug==='toctoc')fleet.push({label:'iPhone',device:await device('/images/toctoc/en/iphone-today.jpg',campaign.products.find(x=>x.slug==='giftly').frame,'iphone',p.slug,'iphone')});
  const props=[];
  for(const [i,prop] of (cfg.props||[]).entries())if(!props.some(x=>x.source===prop.asset))props.push({source:prop.asset,...await asset(prop.asset,p.slug,'prop-'+(i+1),600)});
  if(p.slug==='giftly')props.push(await asset(cfg.gift,p.slug,'gift',600));
  if(p.slug==='tumtum'){
    // A native approved House capture, rather than the store's editorial iPad image.
    const source=path.join(root,'../TumTum/Tools/store/captures/ipad/en/house.png');
    const m=await sharp(source).metadata();
    const f=p.ipad_store?.frame||campaign.products.find(x=>x.slug==='giftly').ipad_store.frame;
    const landscape=m.width>m.height;
    const hardware=landscape?{...f,dimensions:[f.dimensions[1],f.dimensions[0]],screen:[f.dimensions[1]-f.screen[1]-f.screen[3],f.screen[0],f.screen[3],f.screen[2]],rotate:90}:f;
    fleet.push({label:'iPad',device:await device(source,hardware,'ipad',p.slug,'ipad-house')});
  }
  products[p.slug]={palette:p.palette,demo:demos[p.slug],hero:primary[0],hero_cutout:features.find(x=>x.cutout)?.cutout||null,features,props:props.slice(0,3).map(({source,...visual})=>visual),fleet,platforms:product.platform.split(' · '),legacy_details:['giftly','brainfold','myrenewals','toctoc','poof','tumtum'].includes(p.slug)?p.slug:null};
}
// Real fictional photo fixtures already approved in the Memories revision.
const photoDir=path.join(root,'docs/marketing/october-2026/assets/revision-2');
const photos=['family-beach.png','family-baking.png','family-birthday.png','baby-picnic.png','pet-cat.png','pet-garden.png','travel-lake.png','travel-city.png'];
products.memories.demo_photos=await Promise.all(photos.map((n,i)=>asset(path.join(photoDir,n),'memories','demo-photo-'+(i+1),700)));
await fs.writeFile('_data/product_launch.json',JSON.stringify(products,null,2)+'\n');
await fs.writeFile(path.join(docs,'product-launch-assets.json'),JSON.stringify({created:'2026-10-01',reference:'https://musicaistudio.app/',scope:campaign.products.map(p=>p.slug),policy:'Original native screens in code-composed hardware; complete component crops are CSS masks. No store backgrounds or store captions. Original store exports, TumTum and Soooon collections, and store videos untouched.',records},null,2)+'\n');
console.log('Prepared native website assets for',Object.keys(products).length,'products; source hashes recorded.');
