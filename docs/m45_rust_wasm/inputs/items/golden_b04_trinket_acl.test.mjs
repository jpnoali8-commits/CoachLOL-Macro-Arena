// M45 B02B-04 — trinket lifecycle, 3 kinds x 2 seats; source-only oracle.
// Run in checkout of dev69/m45-audit-items:
// node docs/m45_rust_wasm/inputs/items/golden_b04_trinket_acl.test.mjs --write
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {Arena,checksumV40,WARD_RULES_2026} from '../../../../engine.mjs';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';
const sourceLock=assertFrozenSourcesB03();
const read=f=>JSON.parse(readFileSync(new URL('../../../../data/'+f,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const entries=[['trinket_stealth','stealth'],['trinket_oracle','oracle'],['trinket_farsight','farsight']];
const cases=[];
for(const [i,[id,target]] of entries.entries()){
 for(const team of ['blue','red']){
  const seed=452100+i*2+(team==='red'?1:0);
  const a=new Arena(map,mask,{seed,mode:'pvp'});
  const u=a.units.find(x=>x.id===team+'_MID');
  const enemy=team==='blue'?'red':'blue';
  const shop=a.map.objects.find(o=>o.id===team+'_spawn_shop');
  assert.ok(u&&shop);u.x=shop.x;u.y=shop.y;
  const initialGold=u.gold,initialInventory=[...u.items];
  const nextCharge=a.gameTime+40;
  u.trinketNextChargeAt=nextCharge;
  const input={itemId:id,team,unitId:u.id,target};
  assert.equal(a.canBuy(team,u.id,id).ok,false,'trinkets reject 6-slot item.buy');
  assert.equal(a.queuePurchase(team,u.id,id).ok,false,'trinkets reject queued purchase');
  assert.equal(a.setTrinket(enemy,u.id,target).ok,false,'opponent cannot switch your trinket');
  assert.equal(a.purchaseOrPlan(enemy,u.id,id).ok,false,'enemy cannot switch through public dispatch');
  assert.equal(u.gold,initialGold,'ACL does not spend gold');
  const actions=[];
  if((u.trinket??'stealth')===target){
   const pre=a.purchaseOrPlan(team,u.id,'trinket_oracle');
   assert.equal(pre.ok,true,'switch away before testing stealth');
   actions.push({itemId:'trinket_oracle',kind:'shop.trinket',receipt:pre});
  }
  const prior={trinket:u.trinket??'stealth',nextCharge:u.trinketNextChargeAt,
   itemSlots:[...u.items],gold:u.gold,checksum:checksumV40(a.snapshotV40())};
  const result=a.purchaseOrPlan(team,u.id,id);
  assert.equal(result.ok,true,'owner trinket swap');
  assert.equal(u.trinket,target);
  assert.deepEqual(u.items,initialInventory,'trinkets do not occupy inventory slots');
  assert.equal(u.gold,initialGold,'trinkets cost zero');
  assert.ok(u.trinketNextChargeAt>=nextCharge,'no recharge bypass');
  assert.equal(a.canUndoShopV453Dev61(team,u.id).ok,false,'trinket swap is not a shop Undo transaction');
  const snap=a.snapshotV40();
  const restored=Arena.fromSnapshotV40(map,mask,snap);
  const ur=restored.units.find(x=>x.id===u.id);
  assert.equal(ur.trinket,target);assert.equal(ur.gold,initialGold);
  assert.equal(ur.trinketNextChargeAt,u.trinketNextChargeAt);
  assert.deepEqual(ur.items,initialInventory);
  assert.equal(checksumV40(restored.snapshotV40()),checksumV40(snap),'snapshot parity');
  actions.push({kind:'shop.trinket',itemId:id,receipt:result});
  const record={case_id:'M45-B04-'+id+'-'+team,input,seed,team,
   actions,prior,after:{trinket:u.trinket,gold:u.gold,inventory:[...u.items],
    nextCharge:u.trinketNextChargeAt,checksum:checksumV40(snap)},
   replay_checksum:checksumV40(restored.snapshotV40()),
   expected:{enemy_denied:true,ordinary_purchase_denied:true,queued_denied:true,
    swap_no_gold:true,swap_no_six_slot:true,charge_cannot_decrease:true,
    snapshot_equal:true},sourceLock};
  cases.push({...record,fixture_sha256:hash(record)});
 }
}
assert.equal(cases.length,6);
const output={schema:'coachlol.m45.items.trinkets.b04.v1',
 source_lock:sourceLock,cases,case_count:6,execution:'EXECUTED'};
if(process.argv.includes('--write'))
 writeFileSync(new URL('./GOLDEN_B04_TRINKET_EXECUTED.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',cases:cases.length,sha256:hash(output)}));
