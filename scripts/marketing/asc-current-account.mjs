/** Reuse the existing local ASC credential configuration; never persist or print credentials. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {AsyncLocalStorage} from 'node:async_hooks';
import {api as rawApi} from '../../../Skills/app-store-products/scripts/asc.mjs';
const standard=path.join(os.homedir(),'Development/Certificates/MagicLabSolutions');
if(!fs.existsSync(standard) && !process.env.ASC_ISSUER_ID){
 const config=fs.readFileSync(path.join(os.homedir(),'Development/Tools/asc.mjs'),'utf8');
 const key=config.match(/keyID\s*=\s*['"]([A-Z0-9]+)['"]/)?.[1];
 const issuer=config.match(/issuer\s*=\s*['"]([0-9a-f-]+)['"]/)?.[1];
 if(!key||!issuer)throw new Error('Existing ASC credential configuration unavailable');
 process.env.ASC_KEY_ID=key;process.env.ASC_ISSUER_ID=issuer;
 process.env.ASC_KEY_PATH=path.join(os.homedir(),'.appstoreconnect/private_keys',`AuthKey_${key}.p8`);
}
// Read only the public retry header; request headers and credentials never enter diagnostics.
const requestContext=new AsyncLocalStorage(),originalFetch=globalThis.fetch;
globalThis.fetch=async(...args)=>{
 const response=await originalFetch(...args),context=requestContext.getStore();
 if(context&&String(args[0]).startsWith('https://api.appstoreconnect.apple.com/')){
  const retry=response.headers.get('retry-after');
  context.retryAfterMs=retry?(/^\d+$/.test(retry)?Number(retry)*1000:Math.max(0,Date.parse(retry)-Date.now())):0;
 }
 return response;
};
export async function api(...args){const context={};try{return await requestContext.run(context,()=>rawApi(...args))}catch(error){if(error.status===429)error.retryAfterMs=context.retryAfterMs||60000;throw error}}
export {all,maybe,appFor,useAccount} from '../../../Skills/app-store-products/scripts/asc.mjs';
