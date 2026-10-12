/** Exercise current product pages at phone and desktop sizes, including RTL galleries. */
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const req=createRequire(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {chromium}=req('playwright');
const origin=process.env.MAGICLAB_QA_URL||'http://127.0.0.1:8785';
const launches=JSON.parse(await fs.readFile('_data/product_launch.json','utf8'));
const browser=await chromium.launch({headless:true,channel:'chrome'});
const out='/private/tmp/magiclab-platform-web-qa-20261012';await fs.mkdir(out,{recursive:true});
const results=[];const cases=Object.keys(launches).flatMap(slug=>[390,1440].map(width=>({slug,width,locale:'en'})));
for(const slug of ['kinfold','brainfold','memories','myrenewals','giftly','soooon'])for(const locale of ['ar','pt-BR'])cases.push({slug,locale,width:390});
try{
 for(const c of cases){
  const page=await browser.newPage({viewport:{width:c.width,height:900},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const route=`${c.locale==='en'?'':'/'+c.locale}/apps/${c.slug}/`;
  const response=await page.goto(origin+route);assert.equal(response.status(),200,route);
  await page.locator('[data-demo] h3').waitFor();
  await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>null)));});
  const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),videos:document.querySelectorAll('video').length,fleet:[...document.querySelectorAll('.l-fleet-device')].map(e=>({kind:e.querySelector('[data-native-device]').dataset.nativeDevice,width:e.getBoundingClientRect().width})),galleries:document.querySelectorAll('[data-platform-gallery]').length,expand:document.querySelectorAll('[data-enlarge],.l-lightbox').length}));
  assert(!metrics.overflow,route+' document overflow');assert.deepEqual(metrics.broken,[],route+' broken images');assert(!metrics.videos&&!metrics.expand,route+' video/lightbox policy');assert(metrics.fleet.every(x=>x.width>40),route+' missing platform device');
  for(const gallery of await page.locator('[data-platform-gallery]').all()){
   const track=gallery.locator('.l-gallery-track'),forward=gallery.locator('[data-gallery-forward]');
   await track.scrollIntoViewIfNeeded();const before=await track.evaluate(e=>Math.abs(e.scrollLeft));
   if(await forward.isEnabled()){
    await forward.click();await page.waitForTimeout(100);const after=await track.evaluate(e=>Math.abs(e.scrollLeft));assert(after>before+20,route+' gallery forward');
    await gallery.locator('[data-gallery-back]').click();await page.waitForTimeout(100);assert(await track.evaluate(e=>Math.abs(e.scrollLeft))<after,route+' gallery back');
   }
   const size=await forward.boundingBox();assert(size.width>=44&&size.height>=44,route+' touch target');
  }
  if(c.slug==='kinfold'){
   await page.locator('[data-family-date]').fill('2029-05-20');await page.locator('[data-action="1"]').click();assert.equal(await page.locator('[data-family-output]').textContent(),'2029-05-20');
  }
  await page.locator('.l-languages summary').click();const menu=await page.locator('.l-languages nav').evaluate(e=>({height:e.clientHeight,scroll:e.scrollHeight}));assert(menu.height<=480,route+' language menu');await page.locator('.l-languages summary').click();
  assert.deepEqual(errors,[],route+' JS errors');
  if(['kinfold','memories','brainfold','myrenewals'].includes(c.slug)&&c.locale==='en'){
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/${c.slug}-${c.width}-hero.png`});
   await page.locator('.l-fleet').scrollIntoViewIfNeeded();await page.locator('.l-fleet').screenshot({path:`${out}/${c.slug}-${c.width}-fleet.png`});
   if(c.width===1440){const feature=page.locator(c.slug==='brainfold'?'#feature-2':c.slug==='memories'?'#feature-5':'#feature-2');await feature.scrollIntoViewIfNeeded();await feature.screenshot({path:`${out}/${c.slug}-feature.png`});}
  }
  results.push({...c,...metrics,jsErrors:errors});await page.close();
 }
}finally{await browser.close();}
await fs.writeFile('docs/portfolio/platform-web-qa-2026-10-12.json',JSON.stringify({checkedAt:new Date().toISOString(),origin,cases:results},null,2)+'\n');console.log('PASS',results.length,'mobile/desktop/RTL product checks');
