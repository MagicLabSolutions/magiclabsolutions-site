/** Reuse the existing local ASC credential configuration; never persist or print credentials. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const standard=path.join(os.homedir(),'Development/Certificates/MagicLabSolutions');
if(!fs.existsSync(standard) && !process.env.ASC_ISSUER_ID){
 const config=fs.readFileSync(path.join(os.homedir(),'Development/Tools/asc.mjs'),'utf8');
 const key=config.match(/keyID\s*=\s*['"]([A-Z0-9]+)['"]/)?.[1];
 const issuer=config.match(/issuer\s*=\s*['"]([0-9a-f-]+)['"]/)?.[1];
 if(!key||!issuer)throw new Error('Existing ASC credential configuration unavailable');
 process.env.ASC_KEY_ID=key;process.env.ASC_ISSUER_ID=issuer;
 process.env.ASC_KEY_PATH=path.join(os.homedir(),'.appstoreconnect/private_keys',`AuthKey_${key}.p8`);
}
export {api,all,maybe,appFor,useAccount} from '../../../Skills/app-store-products/scripts/asc.mjs';
