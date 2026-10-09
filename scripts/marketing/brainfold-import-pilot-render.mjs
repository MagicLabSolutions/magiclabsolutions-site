/** English approval pilot; does not alter existing store galleries or publish. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const pilot=path.join(root,'docs/marketing/october-2026/brainfold-import-pilot');
const deps=process.env.MAGICLAB_NODE_MODULES||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const require=createRequire(path.join(deps,'../package.json'));
const {chromium}=require('playwright'),sharp=require('sharp');
const config=JSON.parse(await fs.readFile(path.join(pilot,'pilot.json'),'utf8'));
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:1320,height:2868},deviceScaleFactor:1});
 await page.goto(pathToFileURL(path.join(pilot,'art.html')).href);
 const metrics=await page.evaluate(c=>window.renderPilot(c),config);
 assert(metrics.card.x>=0&&metrics.card.x+metrics.card.width<=1320,'Flashcard clipped horizontally');
 assert(metrics.card.y>=metrics.copy.bottom&&metrics.card.y+metrics.card.height<=2868,'Flashcard clipped vertically');
 assert(metrics.device.y-metrics.copy.bottom<=1320*.06,'Text/device gap too large');
 assert(metrics.fonts.headline*320/1320>=32,'Headline too small at 320px');
 assert(metrics.fonts.description*320/1320>=15.4,'Description too small at 320px');
 const output=path.join(pilot,'exports/en-US/store-2-pilot.png');
 const screenshot=await page.locator('#art').screenshot();
 await sharp(screenshot).removeAlpha().png({compressionLevel:9}).toFile(output);
 const bytes=await fs.readFile(output),meta=await sharp(bytes).metadata();
 assert.equal(meta.width,1320);assert.equal(meta.height,2868);assert.equal(meta.hasAlpha,false);
 for(const width of [320,390])await sharp(bytes).resize({width}).jpeg({quality:94}).toFile(path.join(pilot,`preview-${width}.jpg`));
 const hash=async relative=>createHash('sha256').update(await fs.readFile(path.resolve(pilot,relative))).digest('hex');
 await fs.writeFile(path.join(pilot,'validation.json'),JSON.stringify({checkedAt:new Date().toISOString(),approval:config.approval,dimensions:[meta.width,meta.height],file:path.relative(root,output),sha256:createHash('sha256').update(bytes).digest('hex'),sources:{screen:{file:config.sourceScreenshot,sha256:await hash(config.sourceScreenshot)},hardware:{file:config.frame.asset,sha256:await hash(config.frame.asset)},photo:{file:config.photo.asset,sha256:await hash(config.photo.asset)}},photoTreatment:'Original AI photo with ivory contour; SVG silhouette clipping removes peripheral ambient haze in the layout. Native screenshot/hardware untouched.',metrics},null,2)+'\n');
 console.log('English Brainfold import pilot rendered: '+output);
}finally{await browser.close();}
