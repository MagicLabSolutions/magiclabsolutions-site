/** Check native mouth beats, keyboard/reduced motion, locales and unclipped layouts. */
import {createRequire}from'node:module';import path from'node:path';import {homedir}from'node:os';import fs from'node:fs/promises';import assert from'node:assert/strict';
const{chromium}=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES||path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node'),'package.json'))('playwright');
const base=process.env.MAGICLAB_SITE_URL||'http://127.0.0.1:8785',out=path.join(process.cwd(),'docs/portfolio/work/tumtum-dinosaur');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const results=[];try{
 for(const[locale,width]of[['',1440],['',390],['',320],['pt-BR',390],['ja',390],['zh-Hans',390],['fr',390],['de',390],['ko',390],['es',390]]){
 await page.setViewportSize({width,height:1000});await page.goto(base+'/'+(locale?locale+'/':'')+'apps/tumtum/');await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('[data-trex-roar]').count(),2);assert.equal(await page.locator('svg mask').count(),2);
 const assets=await page.locator('.l-trex-art image').evaluateAll(es=>es.map(e=>e.getAttribute('href')));for(const url of new Set(assets)){const r=await page.request.get(base+url);assert.equal(r.status(),200,url);}
 const hero=page.locator('[data-trex-roar]').first();const b=await hero.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await hero.click();await page.waitForTimeout(500);assert.equal(await hero.locator('svg').getAttribute('data-mouth'),'wide');await page.waitForTimeout(1450);assert.equal(await hero.locator('svg').getAttribute('data-mouth'),'rest');
 const dino=page.locator('[data-trex-roar]').last();await dino.scrollIntoViewIfNeeded();await dino.focus();await page.keyboard.press('Enter');
 const sequence=await page.evaluate(()=>new Promise(resolve=>{const e=document.querySelector('.l-demo [data-trex-roar] svg'),states=[];const start=performance.now();function sample(){const s=e.dataset.mouth;if(s!==states.at(-1))states.push(s);if(performance.now()-start<1950)requestAnimationFrame(sample);else resolve(states);}sample();}));assert.equal(sequence.filter(s=>s==='wide').length,3,JSON.stringify(sequence));assert.equal(sequence.at(-1),'rest');
 await dino.click();await page.waitForTimeout(400);await dino.click();await page.waitForTimeout(1900);assert.equal(await dino.locator('svg').getAttribute('data-mouth'),'rest');
 await page.emulateMedia({reducedMotion:'reduce'});await dino.click();await page.waitForTimeout(400);assert.equal(await dino.locator('svg').getAttribute('data-mouth'),'wide');await page.waitForTimeout(1250);assert.equal(await dino.locator('svg').getAttribute('data-mouth'),'rest');await page.emulateMedia({reducedMotion:'no-preference'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'overflow');assert.equal(await page.evaluate(()=>{const d=document.querySelector('.l-demo').getBoundingClientRect();return [...document.querySelectorAll('.l-demo-grid>div')].some(e=>{const r=e.getBoundingClientRect();return r.right>d.right+1||r.left<d.left-1;});}),false,'demo content clipped');
 if(locale===''&&width!==320){await dino.scrollIntoViewIfNeeded();await dino.blur();await page.locator('.l-demo').screenshot({path:path.join(out,'demo-'+width+'.png')});}
 results.push({locale:locale||'en',width,keyboard:true,wideBeats:3,reducedMotion:true,cleanNativeMask:true});console.log(locale||'en',width,'passed');
 }assert.deepEqual(errors,[]);await fs.writeFile(path.join(process.cwd(),'docs/portfolio/tumtum-dinosaur-validation.json'),JSON.stringify({passed:true,results,errors},null,2));
}finally{await browser.close();}
