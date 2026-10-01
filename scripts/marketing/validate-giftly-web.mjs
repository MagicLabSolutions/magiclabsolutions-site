/** Check Giftly's approved artwork and native capture controls in the built site. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const {chromium}=createRequire(path.join(process.env.MAGICLAB_NODE_MODULES,'package.json'))('playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({reducedMotion:'reduce'});
const errors=[],results=[];
page.on('pageerror',error=>errors.push(error.message));
const base=process.env.MAGICLAB_SITE_URL||'http://127.0.0.1:8767';
try {
  for(const [route,width] of [['/apps/giftly/',1440],['/apps/giftly/',390],['/apps/giftly/',320],['/pt-BR/apps/giftly/',390]]) {
    await page.setViewportSize({width,height:1000});
    await page.goto(base+route);
    await page.evaluate(()=>document.querySelectorAll('img[loading="lazy"]').forEach(img=>img.loading='eager'));
    await page.waitForLoadState('networkidle');
    await page.evaluate(()=>document.fonts.ready);
    const metrics=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth+1,
      brokenImages:[...document.images].filter(i=>i.getAttribute('src')&&i.complete&&!i.naturalWidth).map(i=>i.src),
      distortedArt:[...document.querySelectorAll('.hero__art img,.giftly-stories img')].filter(i=>Math.abs(i.width/i.height-i.naturalWidth/i.naturalHeight)>.01).map(i=>i.src),
      smallText:[...document.querySelectorAll('p,a,button,figcaption,span,li,summary')].filter(e=>e.textContent.trim()&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&parseFloat(getComputedStyle(e).fontSize)<14).map(e=>e.textContent.trim().slice(0,70)),
      video:[...document.querySelectorAll('video')].map(v=>({autoplay:v.autoplay,controls:v.controls,captions:v.querySelectorAll('track[kind="captions"]').length})),
      mobileGallery:document.querySelector('.giftly-stories').scrollWidth>document.querySelector('.giftly-stories').clientWidth,
      primaryArt:document.querySelectorAll('.hero__art img,.giftly-stories img').length,
      tabletArt:document.querySelectorAll('.giftly-tablet-gallery img').length,
      fallbackLanguage:document.querySelector('.giftly-story').lang,
      primaryCTA:document.querySelector('.hero a.btn--solid').href
    }));
    assert.equal(metrics.overflow,false,route+' page overflow at '+width);
    assert.deepEqual(metrics.brokenImages,[]);
    assert.deepEqual(metrics.distortedArt,[]);
    assert.deepEqual(metrics.smallText,[]);
    assert.equal(metrics.primaryArt,4);
    assert.equal(metrics.tabletArt,4);
    assert.equal(metrics.mobileGallery,width<861);
    assert.equal(metrics.fallbackLanguage,'en');
    assert(metrics.primaryCTA.includes('/id6802913010'));
    assert(metrics.video.every(v=>v.controls&&!v.autoplay&&v.captions));
    const zoom=page.locator('.giftly-stories [data-p-image]').first();
    await zoom.focus();await page.keyboard.press('Enter');
    assert(await page.locator('.p-lightbox').evaluate(d=>d.open));
    assert.equal(await page.locator('.p-lightbox img').getAttribute('src'),await zoom.getAttribute('data-p-image'));
    await page.keyboard.press('Escape');
    assert(!await page.locator('.p-lightbox').evaluate(d=>d.open));
    assert(await zoom.evaluate(e=>e===document.activeElement));
    await page.locator('.giftly-ipad summary').click();
    const tablet=page.locator('.giftly-tablet-gallery [data-p-image]').last();
    await tablet.click();
    assert(await page.locator('.p-lightbox').evaluate(d=>d.open));
    await page.keyboard.press('Escape');
    const choices=page.locator('[data-tour-image]');
    assert.equal(await choices.count(),6);
    for(let i=0;i<await choices.count();i++) {
      await choices.nth(i).click();
      assert.equal(await choices.nth(i).getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('.p-tour-image img').getAttribute('src'),await choices.nth(i).getAttribute('data-tour-image'));
      await page.locator('.p-tour-image img').evaluate(i=>i.decode());
    }
    results.push({route,width,...metrics,keyboardZoom:true,escape:true,focusReturn:true,tabletZoom:true,nativeCaptureChoices:6});
  }
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:1000});await page.goto(base+'/apps/giftly/');
    await page.evaluate(()=>document.querySelectorAll('img[loading="lazy"]').forEach(i=>i.loading='eager'));
    await page.waitForLoadState('networkidle');
    await page.screenshot({path:path.join(root,`docs/marketing/october-2026/giftly-web-${width===1440?'desktop':'mobile'}.png`)});
    if(width===1440) {
      await page.locator('#giftly-highlights').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));
      await page.screenshot({path:path.join(root,'docs/marketing/october-2026/giftly-web-benefits.png')});
    }
  }
  assert.deepEqual(errors,[]);
  await fs.writeFile(path.join(root,'docs/marketing/october-2026/giftly-web-validation.json'),JSON.stringify({results,errors},null,2)+'\n');
  console.log(JSON.stringify({checked:results.length,errors,passed:true}));
} finally {await browser.close();}
