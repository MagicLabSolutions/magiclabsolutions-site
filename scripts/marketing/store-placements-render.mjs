/** Render native, localized Apple creative assets in their own horizontal formats. */
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),base=path.join(root,'docs/marketing/october-2026'),out=path.join(base,'store-placements');
const req=createRequire(path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'));const sharp=req('sharp'),{chromium}=req('playwright');
const read=async f=>JSON.parse(await fs.readFile(f,'utf8')),exists=async f=>fs.access(f).then(()=>true,()=>false),hash=async f=>createHash('sha256').update(await fs.readFile(f)).digest('hex');
const url=p=>pathToFileURL(path.join(root,p.replace(/^\//,''))).href;
const campaign=(await read(path.join(base,'campaign.json'))).products,portfolio=await read(path.join(root,'_data/portfolio.json')),launch=await read(path.join(root,'_data/product_launch.json')),local=await read(path.join(root,'_data/product_launch_localized.json')),frames=(await read(path.join(base,'device-framing.json'))).frames;
const args=process.argv.slice(2),selected=args.find(x=>x.startsWith('--apps='))?.slice(7).split(','),limited=args.find(x=>x.startsWith('--locales='))?.slice(10).split(',');const nativeLanguages=await read(path.join(base,'localized/languages.json')),overrides=await read(path.join(out,'copy-overrides.json'));
const products=campaign.filter(x=>x.slug!=='hooray').map(x=>({slug:x.slug,background:x.background}));products.push({slug:'kinfold',background:'/docs/marketing/october-2026/kinfold-store/assets/family-airport.png'});
const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage(),records=[];
try{for(const p of products.filter(x=>!selected||selected.includes(x.slug))){
 const info=portfolio.find(x=>x.slug===p.slug),langs=p.slug==='kinfold'?(await read(path.join(base,'kinfold-expanded/languages.json'))).locales:nativeLanguages[p.slug].locales;
 for(const locale of langs.filter(x=>!limited||limited.includes(x))){
  const recordfile=path.join(out,'records',p.slug,locale+'.json');
  if(await exists(recordfile)&&!args.includes('--force')){const old=await read(recordfile);if(await Promise.all(old.map(r=>exists(path.join(root,r.file)))).then(xs=>xs.every(Boolean))){records.push(...old);continue}}
  let design,headline,capture;
  if(p.slug==='kinfold'){
   const c=(await read(path.join(base,'kinfold-expanded/copy.json')))[locale];headline=c.panels[0].headline;capture=`/docs/marketing/october-2026/kinfold-expanded/native/${locale}/iphone/1-vault.png`;
   if(locale==='en-US')capture='/docs/marketing/october-2026/kinfold-store/native/en-US/iphone/1-vault.png';
   if(!await exists(path.join(root,capture.slice(1)))){console.log('Pending native Kinfold',locale);continue}
   design={palette:['#202B41','#FFFAF1','#96C5B1'],hero:{kind:'iphone',frame:frames.find(x=>x.hardware==='iphone')},props:[]};
  }else{
   design=local[p.slug]?.[locale]||(locale.startsWith('en')?launch[p.slug]:null);if(!design){console.log('Pending verified native source',p.slug,locale);continue}
   headline=design.features[0].title;if(p.slug==='toctoc'){const nativePhone=design.fleet?.find(x=>x.device.kind==='iphone')?.device;if(nativePhone)design={...design,hero:nativePhone};}capture=design.hero.image.src;
  }
  const frame=design.hero.frame?{asset:url(design.hero.frame.asset||design.hero.frame.src),dimensions:design.hero.frame.dimensions,screen:design.hero.frame.screen}:null;
  headline=overrides[p.slug]?.[locale]||headline;const original=path.join(root,capture.slice(1)),meta=await sharp(original).metadata();assert(meta.width>0&&meta.height>0);
  const config={locale,slug:p.slug,name:info.name,palette:design.palette,headline,direction:['ar','he','ur'].includes(locale)?'rtl':'ltr',icon:url(info.icon),background:url(p.background),prop:design.props?.[0]?.src?url(design.props[0].src):null,capture:url(capture),captureRatio:meta.width/meta.height,frame};
  const batch=[];
  for(const placement of ['header','search-results']){
   const [width,height]=placement==='header'?[3840,1646]:[3840,2560],folder=path.join(out,'exports',p.slug,locale);await fs.mkdir(folder,{recursive:true});const file=path.join(folder,placement+'.png');await page.setViewportSize({width,height});await page.goto(pathToFileURL(path.join(out,'art.html')).href);const metrics=await page.evaluate(c=>window.render(c),{...config,width,height,placement});assert(!metrics.overflow,`${p.slug} ${locale} copy overflow`);assert(metrics.copy.bottom<height*.95);assert(metrics.fonts.headline>=26.5);await sharp(await page.locator('#art').screenshot()).removeAlpha().png({compressionLevel:6}).toFile(file);const output=await sharp(file).metadata();assert(!output.hasAlpha);assert.equal(output.width,width);assert.equal(output.height,height);const preview=path.join(out,'previews',p.slug,locale);await fs.mkdir(preview,{recursive:true});await sharp(file).resize({width:390}).jpeg({quality:91}).toFile(path.join(preview,placement+'.jpg'));
   const r={slug:p.slug,locale,placement,width,height,file:path.relative(root,file),sha256:await hash(file),capture:capture.slice(1),captureSha256:await hash(original),headline,metrics,source:'Existing approved brand art and traceable localized native UI'};batch.push(r);records.push(r);
  }
  await fs.mkdir(path.dirname(recordfile),{recursive:true});await fs.writeFile(recordfile,JSON.stringify(batch,null,2)+'\n');console.log('RENDERED',p.slug,locale);
 }
}}finally{await browser.close()}
await fs.writeFile(path.join(out,'render-summary-'+(selected?.join('-')||'all')+'-'+(limited?.join('-')||'all')+'.json'),JSON.stringify({createdAt:new Date().toISOString(),records},null,2)+'\n');console.log('Prepared',records.length,'creative masters');
