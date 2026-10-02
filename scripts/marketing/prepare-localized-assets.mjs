/** Build localized artwork jobs and native web data from verifiable captures.
 * Missing captures are reported, never substituted with an English screenshot.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {render,root,clearRenderCache} from './localized-art-canvas.mjs';
import {renderSoooonOriginal} from './soooon-original-art.mjs';
const require=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES||'/Users/fabio.hoffmann/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','package.json'));
const sharp=require('sharp');sharp.cache({memory:24,files:8,items:32});sharp.concurrency(2);
const base='docs/marketing/october-2026',out=base+'/localized';
const campaign=JSON.parse(await fs.readFile(base+'/campaign.json'));
const inventory=JSON.parse(await fs.readFile(out+'/languages.json'));
const launches=JSON.parse(await fs.readFile('_data/product_launch.json'));
const giftly=JSON.parse(await fs.readFile(base+'/giftly-localized/products.json'));
const shared=JSON.parse(await fs.readFile('_data/share_images.json'));
const localized={},coverage=[],metrics=[];
const wanted=process.argv.slice(2);
const localeFilter=(process.env.MAGICLAB_LOCALES||'').split(',').filter(Boolean);
async function exists(file){try{await fs.access(path.join(root,file));return true}catch{return false}}
function localPath(slug,locale,platform,i){return `/${out}/native/${slug}/${locale}/${platform}/native-${i+1}.png`}
async function captureSources(p,locale,platform){
 const slug=p.slug;
 if(slug==='giftly'){const q=giftly.find(x=>x.locale.trim()===locale);return platform==='ipad'?q?.ipad_store.screens:q?.screens}
 if(slug==='groundcontrol')return locale.startsWith('en')?p.screens:null;
 if(slug==='tumtum'){const language={'en-US':'en','pt-BR':'pt','zh-Hans':'zh'}[locale]||locale;return ['home','cooking','town','dinos','aquarium','parents'].map(n=>`../TumTum/Tools/store/captures/${platform}/${['home','parents'].includes(n)?language:'pt'}/${n}.png`)}
 if(slug==='toctoc'){const mapped={'de':'de-DE','es':'es-ES','fr':'fr-FR','nb':'no','ar':'ar-SA','nl':'nl-NL'}[locale]||locale,repo=`../TocToc/Tools/store/${platform==='iphone'?'captures-ios':'captures'}`;let dir=locale;if(!await exists(`${repo}/${dir}`))dir=mapped;return (platform==='iphone'?['today','alarm','settings']:['alert','menubar','settings']).map(n=>`${repo}/${dir}/${n}.png`)}
 const files=p.panels.map((_,i)=>localPath(slug,locale,platform,i));
 if(slug==='hooray')return files.map(f=>f.replace('.png','.jpg')); 
 if(await exists(files[0]))return files;
 if(locale.startsWith('en'))return platform==='ipad'?p.ipad_store?.screens:p.screens;
 // Neutral language content can serve regional variants, without cross-language fallback.
 const alias={'en-AU':'en-US','en-GB':'en-US','en-IN':'en-US','es-419':'es','es-US':'es','fr-CA':'fr','zh-HK':'zh-Hant'}[locale];
 if(alias)return captureSources(p,alias,platform);
 return null;
}
async function nativeImage(file,slug,locale,platform,index){
 const target=`images/products-localized/${slug}/${locale}/${platform}/native-${index+1}.webp`;
 await fs.mkdir(path.dirname(target),{recursive:true});
 const source=path.join(root,file),buffer=await fs.readFile(source),m=await sharp(buffer).metadata();
 await sharp(buffer).resize({width:platform==='ipad'?1100:platform==='mac'||platform==='browser'?1440:840,withoutEnlargement:true}).webp({quality:84}).toFile(target);
 const resized=await sharp(target).metadata();
 return {image:{src:'/'+target,width:resized.width,height:resized.height},source:file,source_sha256:crypto.createHash('sha256').update(buffer).digest('hex'),dimensions:[m.width,m.height]};
}
async function exportArt(p,index,format,size,file){if(process.env.MAGICLAB_REBUILD!=='1'&&await exists(file))return {locale:p.locale,format,index,method:'reuse existing localized export',source:file};return render(p,index,format,size,file)}
async function publicArt(file,target,width=660){await fs.mkdir(path.dirname(target),{recursive:true});await sharp(file).resize({width,withoutEnlargement:true}).webp({quality:86}).toFile(target)}
for(const original of campaign.products){
 if(wanted.length&&!wanted.includes(original.slug))continue;
 const slug=original.slug;localized[slug]={};
 for(const locale of inventory[slug].locales){
  if(localeFilter.length&&!localeFilter.includes(locale))continue;
  const copy=JSON.parse(await fs.readFile(`${out}/copy/${locale}.json`)).products[slug];
  const entry={slug,locale,status:'pending-native-captures',missing:[],formats:{}};
  try {
  const p=structuredClone(original);p.locale=locale;p.panels=copy.panels;p.cta=copy.cta;p.social_copy=copy.social_copy;
  const primary=p.device==='mac'?'mac':p.device==='web'?'browser':'iphone';
  const platforms=[...new Set([primary,...launches[slug].fleet.map(f=>f.device.kind==='iphone'?'iphone':f.device.kind)])];
  const natives={},cardRecords={};
  for(const platform of platforms){
   const sources=await captureSources(p,locale,platform);
   if(!sources||sources.length!==p.panels.length||!(await Promise.all(sources.map(exists))).every(Boolean)){entry.missing.push(platform);continue}
   natives[platform]=[];
   for(let i=0;i<sources.length;i++)natives[platform].push(await nativeImage(sources[i],slug,locale,platform,i));
   const variant=platform==='ipad'?{...p,...p.ipad_store}:platform==='android'?{...p,...p.play_store}:p;
   if(platform==='iphone'&&primary==='mac'){variant.device='phone';variant.frame={asset:'/docs/marketing/october-2026/.frames-cache/iphone.png',dimensions:[1470,3000],screen:[75,66,1320,2868]}}
   if(platform==='ipad'&&!p.ipad_store){variant.device='ipad';const f=launches[slug].fleet.find(x=>x.device.kind==='ipad').device.frame;variant.frame={asset:'/docs/marketing/october-2026/.frames-cache/ipad.png',dimensions:f.dimensions,screen:f.screen,rotate:f.rotate};}
   variant.locale=locale;variant.screens=sources;variant.panels=platform==='android'?copy.play_panels||copy.panels:copy.panels;variant.cta=copy.cta;
   variant.studio_art=structuredClone(p.studio_art||{});
   const cfg=variant.studio_art;
   if(slug==='giftly'){
    const pilot=giftly.find(x=>x.locale.trim()===locale).store_pilot;
    cfg.primary={cutouts:pilot.cutouts};cfg.ipad={cutouts:pilot.ipad_cutouts};
    cfg.props=[{asset:pilot.gift,width:.24,left:.77,bottom:.01,panels:[1,2,3]}];
   }else{
    // Remeasured card bounds belong to the locale. Unverified English crop
    // coordinates are deliberately absent; approved decorative props remain.
    const side=platform==='ipad'?'ipad':platform==='android'?'android':'primary';
    cfg[side]={...(cfg[side]||{}),cutouts:variant.panels.map(()=>[])};
    const measureFile=`${out}/card-bounds/${slug}/${locale}/${platform}.json`;
    if(await exists(measureFile))cfg[side].cutouts=JSON.parse(await fs.readFile(measureFile));
   }
   cardRecords[platform]=cfg[platform==='ipad'?'ipad':platform==='android'?'android':'primary']?.cutouts||[];
   const size=platform==='ipad'?[2064,2752]:platform==='android'?[1280,2856]:platform==='mac'||platform==='browser'?[2880,1800]:[1320,2868];
   const dir=`${out}/exports/${locale}/${slug}`;
   if(!['tumtum','soooon'].includes(slug)){
    for(let i=0;i<variant.panels.length;i++){
     const name=(platform===primary?'store':platform+'-store')+'-'+(i+1),file=`${dir}/${name}.png`;
     const approved=slug==='giftly'?`${base}/giftly-localized/exports/${locale}/${platform==='ipad'?'ipad-':''}store-${i+1}.png`:locale==='en-US'?`${base}/exports/en-US/${slug}/${name}.png`:null;
     if(approved&&await exists(approved)){await fs.mkdir(path.dirname(file),{recursive:true});await fs.copyFile(approved,file);metrics.push({locale,slug,platform,index:i,format:'store',method:'reuse approved original',source:approved});}else metrics.push(await exportArt(variant,i,'store',size,file));
     await publicArt(file,`images/campaign-localized/${slug}/${locale}/${name}.webp`);
    }
    entry.formats[platform+'-store']=variant.panels.length;
   }else if(slug==='tumtum'){
    const mapped={'de':'de-DE','es':'es-ES','fr':'fr-FR'}[locale]||locale,sourceDir=`../TumTum/fastlane/screenshots/${mapped}`;
    const files=(await fs.readdir(sourceDir)).filter(x=>x.startsWith(platform+'-')&&x.endsWith('.png')).sort();
    await fs.mkdir(dir,{recursive:true});
    for(let i=0;i<files.length;i++){const source=path.join(sourceDir,files[i]),file=`${dir}/${platform===primary?'store':platform+'-store'}-${i+1}.png`;await fs.copyFile(source,file);await publicArt(file,`images/campaign-localized/${slug}/${locale}/${platform===primary?'store':platform+'-store'}-${i+1}.webp`);}
    entry.formats[platform+'-store']=files.length;
   }else {const count=copy.original_store?.SLIDES.length||0;if(!count)throw Error('Original Soooon copy is missing');if(process.env.MAGICLAB_REBUILD==='1'||!await exists(dir+'/'+(platform==='ipad'?'ipad-':'')+'store-'+count+'.png'))await renderSoooonOriginal(locale,platform,copy.original_store,dir);for(let i=1;i<=count;i++)await publicArt(dir+'/'+(platform==='ipad'?'ipad-':'')+'store-'+i+'.png',`images/campaign-localized/${slug}/${locale}/${platform==='ipad'?'ipad-':''}store-${i}.webp`);entry.formats[platform+'-store']=count;}
   if(platform===primary){
    const socialNames=['carousel','post'];
    for(let i=0;i<variant.panels.length;i++)for(const name of socialNames){const file=`${dir}/${name}-${i+1}.png`,size=name==='post'?[1080,1350]:[1080,1920];metrics.push(await exportArt(variant,i,'social',size,file));await publicArt(file,`images/campaign-localized/${slug}/${locale}/${name}-${i+1}.webp`,540)}
    entry.formats.social=variant.panels.length*2;
    const shareFile=`${dir}/share.png`;metrics.push(await exportArt(variant,0,'share',[1200,630],shareFile));
    const shareBuffer=await sharp(shareFile).jpeg({quality:92,mozjpeg:true}).toBuffer(),hash=crypto.createHash('sha256').update(shareBuffer).digest('hex').slice(0,12),target=`images/share/${slug}-${locale}-${hash}.jpg`;
    await fs.writeFile(target,shareBuffer);shared.products[slug]||={};shared.products[slug][locale]={image:'/'+target,width:1200,height:630,alt:p.name+' — '+copy.panels[0][0].replaceAll('\n',' '),locale};if(locale==='en-US')shared.products[slug].en=shared.products[slug][locale];entry.formats.share=1;
   }
  }
  if(natives[primary]){
   if(slug==='soooon'){
 const dir=`${out}/exports/${locale}/${slug}`,files=Array.from({length:5},(_,i)=>`${out}/native/soooon/${locale}/mac/native-${i+1}.png`);
 if((await Promise.all(files.map(exists))).every(Boolean)){if(process.env.MAGICLAB_REBUILD==='1'||!await exists(dir+'/mac-store-5.png'))await renderSoooonOriginal(locale,'mac',copy.original_store,dir);for(let i=1;i<=5;i++)await publicArt(dir+`/mac-store-${i}.png`,`images/campaign-localized/${slug}/${locale}/mac-store-${i}.webp`);entry.formats['mac-store']=5;}else entry.missing.push('mac-original-store');
}
const launch=structuredClone(launches[slug]);launch.locale=locale;launch.localized_copy={headline:copy.panels[0][0].replaceAll('\n',' '),description:copy.panels[0][1].replaceAll('\n',' ')};launch.direction=['ar','he','ur'].includes(locale)?'rtl':'ltr';launch.capture_locale=locale;
   function swap(device,index,platform){const n=natives[platform]?.[index];if(!n)return null;return {...device,image:n.image,source_sha256:n.source_sha256}}
   function nativeCrop(index,platform){const card=cardRecords[platform]?.[index]?.[0];if(!card)return null;const normalize=v=>path.resolve(root,'.'+(v.startsWith('/')?v:'/'+v));const source=natives[platform]?.find(n=>normalize(n.source)===normalize(card.source));if(!source)return null;const [l,t,r,b]=card.rect,[w,h]=source.dimensions;if(l<0||t<0||r>w||b>h||r<=l||b<=t)return null;return {image:source.image,ratio:(r-l)/(b-t),width:w/(r-l)*100,left:-l/(r-l)*100,top:-t/(b-t)*100,radius:(card.radius||24)/(r-l)*100,angle:card.angle||0};}
   launch.hero=swap(launch.hero,0,primary);launch.hero_cutout=nativeCrop(0,primary);
   launch.features=launch.features.map((f,i)=>({...f,title:copy.panels[i][0],description:copy.panels[i][1],label:copy.panels[i][2],device:swap(f.device,i,primary),cutout:nativeCrop(i,primary)}));
   launch.fleet=launch.fleet.flatMap(f=>{const platform=f.device.kind==='iphone'?'iphone':f.device.kind==='ipad'?'ipad':f.device.kind==='android'?'android':f.device.kind==='browser'?'browser':'mac';const d=swap(f.device,0,platform);return d?[{...f,device:d}]:[]});
   localized[slug][locale]=launch;entry.status=entry.missing.length?'partially-captured':'rendered';
  }
  }catch(error){entry.status='render-error';entry.error=error.message;console.error(slug,locale,error.message)}
  clearRenderCache();coverage.push(entry);console.log(slug,locale,entry.status,entry.missing.join(','));
 }
}
// Serialize only the manifest update, so independent render jobs cannot overwrite
// each other's completed products or language variants.
const lock='_data/.localized-render.lock';let locked=false;
for(let attempt=0;attempt<200;attempt++){try{await fs.writeFile(lock,String(process.pid),{flag:'wx'});locked=true;break}catch(e){if(e.code!=='EEXIST')throw e;await new Promise(r=>setTimeout(r,100));}}
if(!locked)throw Error('Localized manifest update lock is busy');
try {
// A filtered run merges completed entries without removing other products.
let previous={};try{previous=JSON.parse(await fs.readFile('_data/product_launch_localized.json'))}catch{}
await fs.writeFile('_data/product_launch_localized.json',JSON.stringify(Object.fromEntries([...new Set([...Object.keys(previous),...Object.keys(localized)])].map(k=>[k,{...previous[k],...localized[k]}])),null,2)+'\n');
let oldCoverage=[];try{oldCoverage=JSON.parse(await fs.readFile('_data/localized_image_coverage.json'))}catch{}
const mergedCoverage=new Map(oldCoverage.map(e=>[e.slug+'/'+e.locale,e]));for(const e of coverage)mergedCoverage.set(e.slug+'/'+e.locale,e);
await fs.writeFile('_data/localized_image_coverage.json',JSON.stringify([...mergedCoverage.values()],null,2)+'\n');
const currentShared=JSON.parse(await fs.readFile('_data/share_images.json'));
for(const e of coverage){if(!e.formats.share)continue;currentShared.products[e.slug][e.locale]=shared.products[e.slug][e.locale];if(e.locale==='en-US')currentShared.products[e.slug].en=shared.products[e.slug].en;}
await fs.writeFile('_data/share_images.json',JSON.stringify(currentShared,null,2)+'\n');
await fs.writeFile(out+'/render-coverage'+(wanted.length?'-'+wanted.join('-'):'')+'.json',JSON.stringify(coverage,null,2)+'\n');
await fs.writeFile(out+'/render-metrics'+(wanted.length?'-'+wanted.join('-'):'')+'.json',JSON.stringify(metrics,null,2)+'\n');

}finally{await fs.unlink(lock)}
