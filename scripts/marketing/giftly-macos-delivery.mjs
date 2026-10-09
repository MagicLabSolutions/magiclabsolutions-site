/** Read live Giftly Mac draft/published galleries and verify exact local masters. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const {api,all,useAccount,maybe}=await import(path.join(root,'../Skills/app-store-products/scripts/asc.mjs'));
useAccount('MagicLabSolutions');
const audit=path.join(root,'docs/marketing/october-2026/app-store-connect/giftly-macos-1.2.1');
const save=async(name,data)=>{await fs.mkdir(audit,{recursive:true});await fs.writeFile(path.join(audit,name),JSON.stringify(data,null,2)+'\n');};
const read=async name=>JSON.parse(await fs.readFile(path.join(audit,name),'utf8'));
async function mapLimit(rows,fn,n=4){const result=new Array(rows.length);let i=0;await Promise.all(Array.from({length:Math.min(n,rows.length)},async()=>{while(i<rows.length){const j=i++;result[j]=await fn(rows[j]);}}));return result;}
async function snapshot(version){
 const [build,locs]=await Promise.all([maybe(`/v1/appStoreVersions/${version.id}/build`),all(`/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`)]);
 const localizations=await mapLimit(locs,async loc=>{
  const [sets,previewSets]=await Promise.all([all(`/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets?limit=200`),all(`/v1/appStoreVersionLocalizations/${loc.id}/appPreviewSets?limit=200`)]);
  return {id:loc.id,attributes:loc.attributes,
   sets:await mapLimit(sets,async set=>({id:set.id,type:set.attributes.screenshotDisplayType,
    screenshots:(await all(`/v1/appScreenshotSets/${set.id}/appScreenshots?limit=200`)).map(s=>({id:s.id,fileName:s.attributes.fileName,md5:s.attributes.sourceFileChecksum,state:s.attributes.assetDeliveryState?.state,width:s.attributes.imageAsset?.width,height:s.attributes.imageAsset?.height}))})),
   previewSets:await mapLimit(previewSets,async set=>({id:set.id,type:set.attributes.previewType,previews:(await all(`/v1/appPreviewSets/${set.id}/appPreviews?limit=200`)).map(p=>({id:p.id,md5:p.attributes.sourceFileChecksum,state:p.attributes.assetDeliveryState?.state}))}))};
 });
 return {id:version.id,attributes:version.attributes,build:build?{id:build.id,attributes:build.attributes}:null,localizations};
}
const versions=await all('/v1/apps/6802913010/appStoreVersions?limit=200');
const draft=versions.find(v=>v.attributes.platform==='MAC_OS'&&v.attributes.versionString==='1.2.1');
const published=versions.find(v=>v.attributes.platform==='MAC_OS'&&v.attributes.versionString==='1.2.0');
const ios=versions.find(v=>v.attributes.platform==='IOS'&&v.attributes.versionString==='1.2.1');
assert(draft&&published&&ios);assert.equal(draft.attributes.appVersionState??draft.attributes.appStoreState,'PREPARE_FOR_SUBMISSION');
const plannedKeywords='anniversary,reminder,occasion,wishlist,present,people,calendar,planner,holiday,family';
if(process.argv.includes('--before')){
 const data={checkedAt:new Date().toISOString(),draft:await snapshot(draft),published:await snapshot(published),ios:await snapshot(ios)};
 const publishedIds=new Set(data.published.localizations.flatMap(l=>l.sets.map(s=>s.id)));
 assert(data.draft.localizations.every(l=>l.sets.every(s=>!publishedIds.has(s.id))),'Draft shares published gallery IDs');
 await save('before.json',data);console.log(`Independent Mac draft ${draft.id}: ${data.draft.localizations.length} locales; baseline saved`);
}else if(process.argv.includes('--keywords')){
 const locs=await all(`/v1/appStoreVersions/${draft.id}/appStoreVersionLocalizations?limit=200`),records=[];
 for(const locale of ['en-US','en-AU','en-GB','en-CA']){
  const loc=locs.find(l=>l.attributes.locale===locale);assert(loc,`Missing ${locale}`);
  if(loc.attributes.keywords!==plannedKeywords)await api(`/v1/appStoreVersionLocalizations/${loc.id}`,'PATCH',{data:{type:'appStoreVersionLocalizations',id:loc.id,attributes:{keywords:plannedKeywords}}});
  const verified=(await api(`/v1/appStoreVersionLocalizations/${loc.id}`)).data;assert.equal(verified.attributes.keywords,plannedKeywords);
  records.push({locale,id:loc.id,before:loc.attributes.keywords,after:verified.attributes.keywords});
 }
 await save('keywords-verification.json',{checkedAt:new Date().toISOString(),versionId:draft.id,plannedKeywords,records});console.log('Verified planned Mac keywords in four English regions');
}else if(process.argv.includes('--complete-new-locale')){
 const before=await read('before.json');assert(!before.draft.localizations.some(l=>l.attributes.locale==='en-CA'),'Only complete the locale created by this upload');
 const locs=await all(`/v1/appStoreVersions/${draft.id}/appStoreVersionLocalizations?limit=200`);
 const source=locs.find(l=>l.attributes.locale==='en-US'),target=locs.find(l=>l.attributes.locale==='en-CA');assert(source&&target);
 const attributes=Object.fromEntries(['description','supportUrl','whatsNew','marketingUrl'].filter(f=>!target.attributes[f]&&source.attributes[f]).map(f=>[f,source.attributes[f]]));
 if(Object.keys(attributes).length)await api(`/v1/appStoreVersionLocalizations/${target.id}`,'PATCH',{data:{type:'appStoreVersionLocalizations',id:target.id,attributes}});
 const verified=(await api(`/v1/appStoreVersionLocalizations/${target.id}`)).data;
 for(const [field,value] of Object.entries(attributes))assert.equal(verified.attributes[field],value);
 assert(verified.attributes.description&&verified.attributes.supportUrl&&verified.attributes.whatsNew);
 await save('new-localization-metadata.json',{checkedAt:new Date().toISOString(),versionId:draft.id,locale:'en-CA',sourceLocale:'en-US',sourceLocalizationId:source.id,targetLocalizationId:target.id,before:target.attributes,copiedFields:Object.keys(attributes),after:verified.attributes});
 console.log('New en-CA listing completed from existing English Mac version copy');
}else if(process.argv.includes('--verify')){
 const before=await read('before.json'),plan=await read('plan-applied.json');
 assert(plan.tasks.length&&plan.tasks.every(t=>t.platform==='MAC_OS'&&t.slug==='giftly'&&t.version==='1.2.1'));
 const after={checkedAt:new Date().toISOString(),draft:await snapshot(draft),published:await snapshot(published),ios:await snapshot(ios)};
 assert.deepEqual(after.published,before.published,'Published Mac version changed');
 assert.deepEqual(after.ios,before.ios,'iOS version changed');
 for(const key of ['releaseType','versionString','platform'])assert.equal(after.draft.attributes[key],before.draft.attributes[key]);
 assert.deepEqual(after.draft.build,before.draft.build,'Attached build changed');
 const keywordEvidence=await read('keywords-verification.json');assert.equal(keywordEvidence.versionId,draft.id);
 for(const old of before.draft.localizations){const current=after.draft.localizations.find(l=>l.id===old.id);assert(current);assert.deepEqual(current.previewSets,old.previewSets,'Preview changed');const expected={...old.attributes};if(expected.locale.startsWith('en-'))expected.keywords=plannedKeywords;assert.deepEqual(current.attributes,expected,'Existing listing metadata changed');}
 const added=after.draft.localizations.find(l=>l.attributes.locale==='en-CA');assert(added?.attributes.description&&added.attributes.supportUrl&&added.attributes.whatsNew,'New listing missing required text');
 const galleries=[];
 for(const task of plan.tasks){
  const loc=after.draft.localizations.find(l=>l.attributes.locale===task.locale);assert(loc);
  const set=loc.sets.find(s=>s.type===task.type);assert(set);assert.equal(set.screenshots.length,task.files.length);
  set.screenshots.forEach((s,i)=>{assert.equal(s.state,'COMPLETE');assert.equal(s.md5,task.files[i].md5);assert.equal(s.width,2880);assert.equal(s.height,1800);});
  galleries.push({locale:task.locale,sourceLocale:task.sourceLocale,setId:set.id,screenshots:set.screenshots});
 }
 await save('after.json',after);await save('delivered-galleries.json',{checkedAt:after.checkedAt,appId:'6802913010',platform:'MAC_OS',version:'1.2.1',versionId:draft.id,galleries});
 console.log(JSON.stringify({verified:true,galleries:galleries.length,images:galleries.reduce((n,g)=>n+g.screenshots.length,0),publishedVersionPreserved:true,iOSPreserved:true,buildReleaseAndPreviewsPreserved:true}));
}else throw new Error('Use --before, --keywords, --complete-new-locale or --verify');
