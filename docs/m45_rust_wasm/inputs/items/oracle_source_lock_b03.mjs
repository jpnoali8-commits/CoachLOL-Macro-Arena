// M45 B02B-03 — frozen legacy source verification, not new gameplay.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

export const SOURCE_COMMIT_B03='182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d';
export const SOURCE_BLOBS_B03=Object.freeze({
 'engine.mjs':'e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d',
 'data/coachlol_map_v6.json':'ad853bbb6f110c0d2b6b8b4995ac4e80169f7109',
 'data/masks_128.json':'ecddcee76f3bce20a483ff7545ce2231696270e2',
 'data/riot_reference/sr_shop_26_21_dev49.json':'3779aee3f9981a043a917824c0ddfbf3fbefaecb',
 'data/rift_user_manifest_v452d4.json':'698f86922a5bf8c8699a306bab097cd2ca3743e5',
 'multiplayer/room_v453_dev47.mjs':'3bdb8cd3b737d20e3700e994a8872943e53366ae',
 'multiplayer/authoritative_actions_v453_dev47.mjs':'adf6900a20b1b2c162ec9769b18bf1cc2c23867f'
});

export function gitBlobSha1(bytes){
 const content=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);
 return createHash('sha1').update(Buffer.from('blob '+content.length+'\0')).update(content).digest('hex');
}

export function assertFrozenSourcesB03({shop=false,server=false}={}){
 const files=['engine.mjs','data/coachlol_map_v6.json','data/masks_128.json'];
 if(shop)files.push('data/riot_reference/sr_shop_26_21_dev49.json');
 if(server)files.push('data/rift_user_manifest_v452d4.json',
  'multiplayer/room_v453_dev47.mjs','multiplayer/authoritative_actions_v453_dev47.mjs');
 const hashes={};
 for(const file of files){
  const raw=readFileSync(new URL('../../../../'+file,import.meta.url));
  const sha=gitBlobSha1(raw);
  assert.equal(sha,SOURCE_BLOBS_B03[file],
   'M45 source mismatch: '+file+'; no golden may be published from altered source');
  hashes[file]=sha;
 }
 return Object.freeze({source_commit:SOURCE_COMMIT_B03,checked_blobs:hashes});
}
