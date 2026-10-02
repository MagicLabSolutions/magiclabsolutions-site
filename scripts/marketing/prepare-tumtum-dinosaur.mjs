/** Export the game's registered paper rig, preserving its native atlas pixels. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
const root=process.cwd(),game=path.resolve(root,'../TumTum');
const sharp=createRequire(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'))('sharp');
const atlas=JSON.parse(await fs.readFile(path.join(game,'TumTumKit/Sources/DesignSystem/PaperManifests/paper-atlas.json')));
const rig=JSON.parse(await fs.readFile(path.join(game,'TumTumKit/Sources/DesignSystem/PaperAssets/rigs/dinosaurs-rig.json'))).trex;
const output=path.join(root,'images/products/tumtum');await fs.mkdir(output,{recursive:true});
const records=[];
async function cut(id){
 const region=atlas.regions[id],file=path.join(game,'TumTumKit/Sources/DesignSystem/PaperAssets',atlas.files[region.file].path),source=await fs.readFile(file);
 const [left,top,width,height]=region.rect,bytes=await sharp(source).extract({left,top,width,height}).webp({lossless:true}).toBuffer();
 const name=`${id.replaceAll('.','-')}-${createHash('sha256').update(bytes).digest('hex').slice(0,12)}.webp`;await fs.writeFile(path.join(output,name),bytes);
 records.push({id,source:path.relative(game,file),source_sha256:createHash('sha256').update(source).digest('hex'),rect:region.rect,output:'/images/products/tumtum/'+name});
 return {src:'/images/products/tumtum/'+name,width,height,bytes,png:await sharp(bytes).png().toBuffer()};
}
const body=await cut('dinosaur.trex'),heads={};for(const state of ['rest','open','wide'])heads[state]=await cut('dinosaur.trex-head-'+state);
const geometry={width:520,height:444,body:[20,70,480,480/rig.aspect],head:[20+480*.47,70-(480/rig.aspect)*.09,480*.55,480*.55/(700/640)]};
const [x,y,w,h]=geometry.body;
geometry.headMask=[[.55,-.2],[1.2,-.2],[1.2,.4],[.70,.4],[.55,.17]].map(([px,py])=>[x+px*w,y+py*h]);
geometry.exclusions=rig.exclusions.map(([px,py,pw,ph])=>[x+px*w,y+py*h,pw*w,ph*h]);
const motionPath='TumTumKit/Sources/Models/AnimalMouthMotion.swift',motionSource=await fs.readFile(path.join(game,motionPath),'utf8');
const keyText=motionSource.match(/let keys: \[\(Double, Double\)\] = \[([\s\S]*?)\n        \]/)[1];
const keys=[...keyText.matchAll(/\(([\d.]+), ([\d.]+)\)/g)].map(m=>[Number(m[1]),Number(m[2])]);
const png=a=>`data:image/png;base64,${a.png.toString('base64')}`;
const box=a=>`x="${a[0]}" y="${a[1]}" width="${a[2]}" height="${a[3]}"`;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="520" height="444" viewBox="0 0 520 444"><defs><mask id="body"><rect width="520" height="444" fill="white"/><polygon points="${geometry.headMask.map(p=>p.join(',')).join(' ')}" fill="black"/>${geometry.exclusions.map(r=>`<rect ${box(r)} fill="black"/>`).join('')}</mask></defs><image href="${png(body)}" ${box(geometry.body)} mask="url(#body)"/><image href="${png(heads.rest)}" ${box(geometry.head)}/></svg>`;
const staticBytes=await sharp(Buffer.from(svg)).webp({lossless:true}).toBuffer(),name=`trex-rest-${createHash('sha256').update(staticBytes).digest('hex').slice(0,12)}.webp`;await fs.writeFile(path.join(output,name),staticBytes);
const visual={src:'/images/products/tumtum/'+name,width:520,height:444};
const labels={en:'Make the dinosaur roar','en-US':'Make the dinosaur roar','pt-BR':'Fazer o dinossauro rugir',es:'Haz rugir al dinosaurio',fr:'Faire rugir le dinosaure',de:'Den Dinosaurier brüllen lassen',ja:'恐竜をほえさせる',ko:'공룡이 포효하게 하기','zh-Hans':'让恐龙咆哮'};
const json=a=>({src:a.src,width:a.width,height:a.height});
await fs.writeFile(path.join(root,'_data/tumtum_dinosaur.json'),JSON.stringify({body:json(body),heads:Object.fromEntries(Object.entries(heads).map(([k,v])=>[k,json(v)])),geometry,duration:1800,keys,thresholds:[.28,.82],labels,static:visual},null,2)+'\n');
for(const file of ['_data/product_launch.json','_data/product_launch_localized.json']){const data=JSON.parse(await fs.readFile(file));const entries=file.includes('localized')?Object.values(data.tumtum):[data.tumtum];for(const entry of entries)entry.props[0]=visual;await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');}
await fs.writeFile(path.join(root,'docs/portfolio/tumtum-dinosaur-rig.json'),JSON.stringify({sources:records,motion:{source:motionPath,source_sha256:createHash('sha256').update(motionSource).digest('hex'),duration:1800,keys,thresholds:[.28,.82]},registration:'PaperAnimalHead.frame/mask and dinosaurs-rig.json exclusions; same body and fixed head frame in every state',static:visual},null,2)+'\n');
console.log('Exported native T-Rex body and three registered heads. Removed the neighboring atlas fragment using the game’s exclusion mask.');
