/** Integrate approved native store captures into clean website stages and galleries. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {materializeComponent} from './native-component-assets.mjs';
const root=process.cwd(),source=process.env.MAGICLAB_CREATIVE_SOURCE||root,base='docs/marketing/october-2026';
const req=createRequire(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),sharp=req('sharp');
const read=async f=>JSON.parse(await fs.readFile(path.join(root,f),'utf8')),original=async f=>JSON.parse(await fs.readFile(path.join(source,f),'utf8'));
const save=async(f,v)=>{await fs.mkdir(path.dirname(path.join(root,f)),{recursive:true});await fs.writeFile(path.join(root,f),JSON.stringify(v,null,2)+'\n');};
const launches=await read('_data/product_launch.json'),localized=await read('_data/product_launch_localized.json'),catalog=await read('_data/portfolio.json'),evidence=await read('docs/portfolio/apple-release-platforms-2026-10-12.json'),records=[],cache=new Map();
const hash=b=>createHash('sha256').update(b).digest('hex'),plain=s=>s.replaceAll('\n',' ');
async function asset(file,slug,locale,kind,name,crop=null){
 const key=[file,slug,locale,kind,name,JSON.stringify(crop)].join('|');if(cache.has(key))return cache.get(key);
 const bytes=await fs.readFile(path.join(source,file)),native=await sharp(bytes).metadata();let pipeline=sharp(bytes);
 if(crop){const [l,t,r,b]=crop;assert(l>=0&&t>=0&&r<=native.width&&b<=native.height);pipeline=pipeline.extract({left:l,top:t,width:r-l,height:b-t});}
 const target=`images/products-localized/${slug}/${locale}/${kind}/${name}.webp`;
 await fs.mkdir(path.dirname(target),{recursive:true});await pipeline.resize({width:kind==='iphone'?840:kind==='ipad'?1100:1440,withoutEnlargement:true}).webp({quality:85,effort:4}).toFile(target);
 const m=await sharp(target).metadata();const image={src:'/'+target,width:m.width,height:m.height};const result={image,source_sha256:hash(bytes),nativeSize:[native.width,native.height],file,crop};
 records.push({source:file,output:image.src,source_sha256:result.source_sha256,output_sha256:hash(await fs.readFile(target)),nativeDimensions:result.nativeSize,outputDimensions:[m.width,m.height],crop,kind:'actual native capture; no store background or baked headline'});cache.set(key,result);return result;
}
const macMetadata=await original(base+'/kinfold-expanded/mac-frame.json');
const frameFile=macMetadata.asset;const frameOut='images/products/hardware/macbook-pro-m5-16-black.webp';
await sharp(path.join(source,frameFile)).resize({width:1600}).webp({quality:91}).toFile(frameOut);const frameSize=await sharp(frameOut).metadata();
const macFrame={...macMetadata,src:'/'+frameOut,width:frameSize.width,height:frameSize.height};delete macFrame.asset;
const frames=(await original(base+'/kinfold-store/frames.json')).map(f=>({...f,src:'/images/products/hardware/'+f.hardware+'.webp',width:f.dimensions[0],height:f.dimensions[1]}));
function device(a,kind,template=null){let frame=kind==='vision'?null:kind==='mac'?structuredClone(macFrame):structuredClone(template?.frame||frames.find(f=>f.hardware===kind));
 if(frame&&kind==='mac'){const [x,y,w,h]=macMetadata.screen;frame.backplate=[x,y,w,h];const safeTop=64,scale=Math.min(w/a.image.width,(h-safeTop)/a.image.height),iw=a.image.width*scale,ih=a.image.height*scale;frame.screen=[x+(w-iw)/2,y+safeTop+(h-safeTop-ih)/2,iw,ih];}
 return {image:a.image,frame,kind,ratio:frame?frame.dimensions[0]/frame.dimensions[1]:a.image.width/a.image.height,source_sha256:a.source_sha256};}
async function component(a,rect){if(!rect)return null;const scale=a.image.width/a.nativeSize[0];const [l,t,r,b]=rect.map(x=>x*scale),w=r-l,h=b-t;
 return materializeComponent({image:a.image,ratio:w/h,width:a.image.width/w*100,left:-l/w*100,top:-t/h*100,radius:3,angle:-2},root);}
function replaceFleet(d,kind,items){d.fleet=d.fleet.filter(x=>x.device.kind!==kind);d.fleet.push({label:kind==='vision'?'Apple Vision Pro':kind==='mac'?'Mac':kind==='ipad'?'iPad':'iPhone',device:items[0].device});d.platform_galleries??=[];d.platform_galleries=d.platform_galleries.filter(x=>x.kind!==kind);d.platform_galleries.push({label:kind==='vision'?'Apple Vision Pro':kind==='mac'?'Mac':kind==='ipad'?'iPad':'iPhone',kind,preview:d.slug==='memories'&&kind==='mac',items});}
const kcopy=await original(base+'/kinfold-expanded/copy.json');localized.kinfold={};
for(const [locale,c]of Object.entries(kcopy)){
 const d={slug:'kinfold',palette:['#F7F5EF','#242043','#6356CF'],demo:'family',props:[],hero_cutout:null,features:[],fleet:[],platforms:['iPhone','iPad','Mac','Apple Vision Pro'],capture_locale:locale,direction:c.direction,localized_copy:{headline:plain(c.panels[0].headline),description:plain(c.panels[0].description),features:c.panels.map(x=>plain(x.headline))}};
 for(const kind of ['iphone','ipad','mac','vision']){const rr=await original(`${base}/kinfold-expanded/records/${locale}/${kind}.json`),items=[];
  for(const [i,r]of rr.entries()){const a=await asset(r.capture,'kinfold',locale,kind,'native-'+r.number,kind==='vision'?r.nativeCrop:null);assert.equal(a.source_sha256,r.captureSha256);const v=device(a,kind);const item={label:plain(c.panels[i].headline),title:plain(c.panels[i].headline),description:plain(c.panels[i].description),device:v,cutout:null};
   if(kind==='iphone'&&r.detail){const detail=await asset(r.detail.nativeFile,'kinfold',locale,kind,'detail-'+r.number);item.cutout=await component(detail,r.detail.rect);}
   items.push(item);
  }
  if(kind==='iphone'){d.hero=items[0].device;d.features=items;d.fleet.push({label:'iPhone',device:d.hero});}else replaceFleet(d,kind,items);
 }
 localized.kinfold[locale]=d;
}
const importCopy=(await original(base+'/brainfold-1.2.1/import-copy.json')).locales;
const bookSrc=base+'/brainfold-import-pilot/assets/scan-schoolbook-sticker-v2.png';const bookTarget='images/products/brainfold/schoolbook-scan.webp';await sharp(path.join(source,bookSrc)).resize({width:850}).webp({quality:89}).toFile(bookTarget);const bookMeta=await sharp(bookTarget).metadata();const book={src:'/'+bookTarget,width:bookMeta.width,height:bookMeta.height};records.push({source:bookSrc,output:book.src,source_sha256:hash(await fs.readFile(path.join(source,bookSrc))),kind:'previously approved AI schoolbook illustration; not an app capture'});
const annualCopy=(await original(base+'/memories-1.1.1/copy.json')).locales||await original(base+'/memories-1.1.1/copy.json');
for(const [locale,d]of Object.entries(localized.brainfold)){
 if(!d.features.some(f=>f.schoolbook_import)){const c=importCopy[locale];assert(c);const item={label:plain(c.headline),title:plain(c.headline),description:plain(c.iosDescription),device:structuredClone(d.features[1].device),cutout:null,photo_cutout:book,schoolbook_import:true};d.features.splice(1,0,item);}
}
for(const [locale,d]of Object.entries(localized.memories)){
 const c=annualCopy[locale];assert(c);const vv=await original(`${base}/memories-1.1.1/validation/${locale}.json`);
 d.features=d.features.slice(0,4);
 for(const [i,p]of c.panels.entries()){const n=i+5,r=vv.images.find(x=>x.format==='iphone'&&x.number===n);const a=await asset(r.capture,'memories',locale,'iphone','revision-native-'+n);d.features.push({label:plain(p[0]),title:plain(p[0]),description:plain(p[1]),device:device(a,'iphone',d.hero),cutout:n===6?await component(a,r.rect):null});}
 d.platforms=['iPhone','iPad','Mac'];
}
const macPackages={giftly:'giftly-macos',brainfold:'brainfold-1.2.1',memories:'memories-macos-1.1.1',myrenewals:'myrenewals-macos-1.2.7',soooon:'localized'};
for(const [slug,pkg]of Object.entries(macPackages))for(const [locale,d]of Object.entries(localized[slug])){
 d.slug=slug;if(['memories','myrenewals'].includes(slug))d.platforms=['iPhone','iPad','Mac'];const count=slug==='soooon'?(await fs.readdir(path.join(source,base,'localized/native/soooon',locale,'mac'))).filter(x=>/^native-\d+\.png$/.test(x)).length:slug==='brainfold'?7:slug==='giftly'?4:6,items=[];
 for(let n=1;n<=count;n++){let file;if(slug==='giftly')file=`${base}/${pkg}/native/${locale}/${['today','upcoming','people','calendar'][n-1]}.png`;else if(slug==='soooon')file=`${base}/localized/native/soooon/${locale}/mac/native-${n}.png`;else file=`${base}/${pkg}/native/${locale}/native-${slug==='brainfold'?(n===2?2:n===1?1:n-1):n}.png`;
  const a=await asset(file,slug,locale,'mac','native-'+n),feature=d.features[n-1];assert(feature,`${slug} ${n} missing feature`);items.push({label:feature.label,title:feature.title,description:feature.description,device:device(a,'mac'),...(slug==='brainfold'&&n===2?{photo_cutout:book}:{})});
 }
 replaceFleet(d,'mac',items);
}
// Existing optimized tablet and Android captures stay traceable; add static platform galleries.
for(const [slug,variants]of Object.entries(localized))for(const [locale,d]of Object.entries(variants)){
 for(const fleet of d.fleet){const kind=fleet.device.kind;if(!['ipad','android'].includes(kind)||d.platform_galleries?.some(x=>x.kind===kind))continue;const items=[];
  for(let i=0;i<d.features.length;i++){const feature=d.features[i],n=slug==='brainfold'?(i===1?2:i===0?1:i):i+1;let v;
   if(slug==='memories'&&i>=4){const file=`${base}/memories-1.1.1/native/${locale}/ipad/native-${i+1}.png`;v=device(await asset(file,slug,locale,'ipad','revision-native-'+(i+1)),'ipad',fleet.device);}
   else{const file=fleet.device.image.src.replace(/native-1\.webp$/,'native-'+n+'.webp');const bytes=await fs.readFile(path.join(root,file));const m=await sharp(bytes).metadata();v={...structuredClone(fleet.device),image:{src:file,width:m.width,height:m.height},source_sha256:hash(bytes),source_hash_kind:'existing optimized public capture'};}
   items.push({label:feature.label,title:feature.title,description:feature.description,device:v,...(slug==='brainfold'&&i===1?{photo_cutout:book}:{})});
  }
  d.platform_galleries??=[];d.platform_galleries.push({label:fleet.label,kind,items});
 }
 if(!d.platform_galleries)d.platform_galleries=[];
}
const previews={en:'Mac preview is in App Review. iPhone and iPad are available now.','pt-BR':'A versão para Mac está em revisão na App Store. iPhone e iPad já estão disponíveis.',de:'Die Mac-Version wird im App Store geprüft. iPhone und iPad sind bereits verfügbar.',es:'La versión para Mac está en revisión en el App Store. iPhone y iPad ya están disponibles.',fr:'La version Mac est en cours de validation sur l’App Store. iPhone et iPad sont déjà disponibles.',ja:'Mac版はApp Storeで審査中です。iPhone・iPad版は公開されています。',ko:'Mac 버전은 App Store 심사 중입니다. iPhone과 iPad 버전은 현재 사용할 수 있습니다。','zh-Hans':'Mac 版本正在 App Store 审核中。iPhone 和 iPad 版本现已上线。'};
for(const p of catalog){const e=evidence.records.find(x=>x.slug===p.slug);if(!e)continue;p.checked_at=evidence.checkedAt.slice(0,10);p.release_platforms=e.versions.filter(v=>v.state==='READY_FOR_DISTRIBUTION').filter((v,i,a)=>a.findIndex(x=>x.platform===v.platform)===i).map(x=>({platform:x.platform,version:x.version}));
 if(e.publicListings.length&&p.release_platforms.length){p.status='released';p.store_url='https://apps.apple.com/app/id'+e.appId;if(p.slug==='poof')delete p.availability_note;}
 if(['memories','myrenewals'].includes(p.slug))p.platform='iPhone · iPad · Mac';if(p.slug==='memories')p.availability_note=previews;
 if(p.slug==='starwake')p.platform='iPhone · iPad · Mac · Apple TV';
 if(localized[p.slug]?.['en-US']){launches[p.slug]={...structuredClone(localized[p.slug]['en-US']),legacy_details:launches[p.slug]?.legacy_details};p.marketing_updated_at=evidence.checkedAt.slice(0,10);}
}
launches.kinfold.legacy_details='kinfold';
const legal=await read('_data/launch_legal.json');legal.kinfold={support:'/contact/',privacy:'/privacy-policy/',terms:'/terms-of-use/'};
const coverage=[];for(const [slug,variants]of Object.entries(localized))for(const [locale,d]of Object.entries(variants))coverage.push({slug,locale,features:d.features.length,platforms:d.platforms,galleries:d.platform_galleries.map(x=>({label:x.label,kind:x.kind,images:x.items.length,preview:!!x.preview})),fleet:d.fleet.map(x=>x.label)});
await save('_data/product_launch.json',launches);await save('_data/product_launch_localized.json',localized);await save('_data/portfolio.json',catalog);await save('_data/launch_legal.json',legal);await save('_data/product_platform_media.json',coverage);await save('docs/portfolio/platform-media-sources-2026-10-12.json',{preparedAt:new Date().toISOString(),records});console.log(JSON.stringify({newAssets:records.length,appLanguagePages:coverage.length,products:Object.keys(localized).length}));
