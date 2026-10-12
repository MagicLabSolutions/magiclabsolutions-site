/** Read-only final audit. It rejects partial delivery before making any Apple requests. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {api as raw, useAccount} from './asc-current-account.mjs';
useAccount('MagicLabSolutions');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const base=path.join(root,'docs/marketing/october-2026');
const read=async f=>JSON.parse(await fs.readFile(f,'utf8'));
const save=async(f,data)=>fs.writeFile(f,JSON.stringify(data,null,2)+'\n');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function api(url) {
 const start=Date.now();let failures=0;
 for(;;)try{return await raw(url)}catch(e){
  if(e.status===429&&Date.now()-start<90*60*1000){console.log('Audit waiting for Apple request allowance');await pause(Math.max(60000,e.retryAfterMs||0));continue}
  if(!e.status&&failures++<4){await pause(5000);continue}throw e;
 }
}
async function collection(url) {
 const data=[],included=new Map();
 do{const r=await api(url);data.push(...r.data);for(const x of r.included||[])included.set(x.type+':'+x.id,x);
  url=r.links?.next?new URL(r.links.next).pathname+new URL(r.links.next).search:null;
 }while(url);
 return {data,included};
}
const k=await read(path.join(base,'kinfold-expanded/validation.json'));
const c=await read(path.join(base,'store-placements/validation.json'));
assert.equal(k.masters,1320);assert.equal(c.masters,1008);
const creative=[];
for(const r of c.records) {
 const delivered=await read(path.join(base,'store-placements/audit/delivery',r.slug,r.locale+'-'+r.placement+'.json'));
 assert(delivered.verified&&delivered.sha256===r.sha256,'Missing current creative: '+r.slug+' '+r.locale+' '+r.placement);
 creative.push({...delivered,bytes:(await fs.stat(path.join(root,r.file))).size});
}
const checkpoints=path.join(base,'kinfold-expanded/audit/upload/work/results');
const masterHashes=new Map(k.records.map(x=>[x.file,x.sha256]));
const galleries=[];
for(const name of await fs.readdir(checkpoints)) {
 const r=await read(path.join(checkpoints,name));
 for(const image of r.screenshots){const bytes=await fs.readFile(path.join(root,image.file));assert.equal(createHash('md5').update(bytes).digest('hex'),image.md5,'Stale gallery: '+name);assert.equal(createHash('sha256').update(bytes).digest('hex'),masterHashes.get(image.file))}
 assert.equal(r.screenshots.length,6);galleries.push(r);
}
assert.equal(galleries.length,200,'All 200 Apple screenshot galleries must be delivered first');
for(const [platform,count]of [['IOS',100],['MAC_OS',50],['VISION_OS',50]])assert.equal(galleries.filter(x=>x.platform===platform).length,count);
const variants=await read(path.join(base,'kinfold-expanded/audit/library-variants-summary.json'));assert.equal(variants.images.length,144);
for(const image of variants.images){assert(image.verified);assert.equal(image.sha256,masterHashes.get(image.file));assert.equal(createHash('sha256').update(await fs.readFile(path.join(root,image.file))).digest('hex'),image.sha256)}
const deliveredFiles=new Set([...galleries.flatMap(x=>x.screenshots.map(y=>y.file)),...variants.images.map(x=>x.file)]);assert.equal(deliveredFiles.size,1320,'Every native-language master must be represented in Apple');
const versions=new Map(),libraries=new Map(),placementImages=new Map(),creativeReadback=[];
for(const slug of c.apps) {
 const items=creative.filter(x=>x.slug===slug);
 const images=await collection('/v1/appAssetLibraries/'+items[0].appId+'/images?include=placements&limit[placements]=50&limit=200');
 libraries.set(slug,new Map(images.data.map(x=>[x.id,x])));
 for(const image of images.data)for(const p of image.relationships?.placements?.data||[])placementImages.set(p.id,image.id);
 for(const item of items) {
  const image=libraries.get(slug).get(item.imageId);assert(image,'Missing image '+item.imageId);
  assert.equal(image.attributes.fileName,`ml-${slug}-${item.locale}-${item.placement}-${item.sha256.slice(0,14)}.png`);
  assert.equal(image.attributes.fileSize,item.bytes);assert.equal(image.attributes.specId,item.specId);
  assert(['COMPLETE','PREPARE_FOR_SUBMISSION','READY_FOR_REVIEW','WAITING_FOR_REVIEW','IN_REVIEW','APPROVED','ACCEPTED'].includes(image.attributes.state));
  creativeReadback.push({slug,locale:item.locale,placement:item.placement,imageId:image.id,state:image.attributes.state,sha256:item.sha256,specId:image.attributes.specId,versionId:item.versionId});
 }
 console.log('AUDITED LIBRARY',slug,items.length);
}
for(const item of variants.images){const image=libraries.get('kinfold').get(item.imageId);assert(image);assert.equal(image.attributes.category,'APP_SCREENSHOTS_AND_PREVIEWS');assert.equal(image.attributes.fileName,item.fileName);assert.equal(image.attributes.fileSize,(await fs.stat(path.join(root,item.file))).size);assert(['COMPLETE','PREPARE_FOR_SUBMISSION','READY_FOR_REVIEW','WAITING_FOR_REVIEW','IN_REVIEW','APPROVED','ACCEPTED'].includes(image.attributes.state));assert.equal(image.attributes.specId,item.specId)}
const nativeReadback=[];
for(const r of galleries) {
 if(!versions.has(r.versionId))versions.set(r.versionId,(await api('/v1/appStoreVersions/'+r.versionId)).data);
 const response=await api('/v1/appScreenshotSets/'+r.setId+'?include=appScreenshots&limit[appScreenshots]=50');
 assert.equal(response.data.attributes.screenshotDisplayType,r.type);
 const ids=response.data.relationships.appScreenshots.data.map(x=>x.id),images=new Map((response.included||[]).filter(x=>x.type==='appScreenshots').map(x=>[x.id,x]));
 assert.deepEqual(ids,r.screenshots.map(x=>x.id));
 for(const item of r.screenshots){const remote=images.get(item.id);assert(remote);assert.equal(remote.attributes.sourceFileChecksum,item.md5);assert.equal(remote.attributes.assetDeliveryState.state,'COMPLETE')}
 nativeReadback.push({...r,verifiedAt:new Date().toISOString()});
 console.log('AUDITED GALLERY',r.platform,r.locale,r.type);
}
const placements=[],metadataMissing=[];
for(const slug of c.apps) {
 const items=creative.filter(x=>x.slug===slug),versionId=items.find(x=>x.versionId)?.versionId;
 if(!versionId)continue;
 if(!versions.has(versionId))versions.set(versionId,(await api('/v1/appStoreVersions/'+versionId)).data);
 const localizations=await collection('/v1/appStoreVersions/'+versionId+'/appStoreVersionLocalizations?include=placements&limit[placements]=50&limit=200');
 const dir=path.join(base,'store-placements/audit/localized-placements',slug);
 const expected=await fs.readdir(dir);
 for(const file of expected) {
  const plan=await read(path.join(dir,file)),loc=localizations.data.find(x=>x.attributes.locale===plan.locale);assert(loc);
  for(const target of plan.placements) {
   assert(loc.relationships.placements.data.some(x=>x.id===target.id));
   const placed=localizations.included.get('appAssetLibraryPlacements:'+target.id);assert(placed);
   assert.equal(placed.attributes.placementType,target.type);assert.equal(placed.attributes.placementGroup,'DEFAULT_PROFILE');
   let imageId=placementImages.get(placed.id)||placed.relationships?.image?.data?.id;
   if(!imageId)imageId=(await api('/v1/appAssetLibraryPlacements/'+placed.id+'?include=image')).data.relationships.image.data.id;
   assert.equal(imageId,target.imageId);
   placements.push({slug,versionId,locale:plan.locale,sourceLocale:plan.sourceLocale,placementId:placed.id,type:target.type,imageId,state:placed.attributes.state});
  }
  const fields=['description','supportUrl','keywords'].filter(x=>!loc.attributes[x]);
  if(fields.length)metadataMissing.push({slug,versionId,locale:plan.locale,fields});
 }
 console.log('AUDITED PLACEMENTS',slug,expected.length);
}
const original=await read(path.join(base,'app-store-connect/sundust-preview-order.json')),previews=[];
for(const set of original.orderedPreviewSets) {
 const response=await collection('/v1/appPreviewSets/'+set.setId+'/appPreviews?limit=200');
 assert.deepEqual(response.data.map(x=>x.id),set.previews.map(x=>x.id));
 for(const [i,p]of response.data.entries()){assert.equal(p.attributes.sourceFileChecksum,set.previews[i].checksum);assert.equal(p.attributes.assetDeliveryState.state,'COMPLETE')}
 previews.push({setId:set.setId,type:set.type,previews:set.previews});
}
const libraryOnlyApps=c.apps.filter(s=>!creative.some(x=>x.slug===s&&x.versionId)),libraryOnlyVersions=[];
for(const slug of libraryOnlyApps){const item=creative.find(x=>x.slug===slug);const current=await collection('/v1/apps/'+item.appId+'/appStoreVersions?limit=200');libraryOnlyVersions.push({slug,versions:current.data.map(x=>({id:x.id,platform:x.attributes.platform,version:x.attributes.versionString,state:x.attributes.appVersionState??x.attributes.appStoreState}))})}
const versionStates=[...versions.values()].map(x=>({id:x.id,platform:x.attributes.platform,version:x.attributes.versionString,state:x.attributes.appVersionState??x.attributes.appStoreState}));
const report={verifiedAt:new Date().toISOString(),readOnly:true,kinfold:{masters:1320,nativeLanguages:55,appleListingLocales:50,galleries:nativeReadback.length,uploadedGalleryImages:nativeReadback.reduce((n,x)=>n+x.screenshots.length,0),additionalLibraryVariants:variants.images.length,allNativeMastersRepresented:deliveredFiles.size},creative:{apps:c.apps,masters:1008,libraryImages:creativeReadback.length,linkedPlacements:placements.length,libraryOnlyApps},versionStates,libraryOnlyVersions,metadataMissing,sundustPreviewsRetained:previews,reviewSubmitted:false,binarySubmitted:false};
await save(path.join(base,'kinfold-expanded/audit/delivery-verified.json'),nativeReadback);
await save(path.join(base,'store-placements/audit/library-verified.json'),creativeReadback);
await save(path.join(base,'store-placements/audit/placements-verified.json'),placements);
await save(path.join(base,'store-placements/audit/final-verification.json'),report);
console.log(JSON.stringify({...report,metadataMissing:report.metadataMissing.length}));
