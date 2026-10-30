// M45 B02 — 122 item SR x 2 teams, executed GOLDEN only by Node.
// No new gameplay; this is a frozen-source oracle for future Rust parity.
// node docs/m45_rust_wasm/inputs/items/golden_b02_catalog.test.mjs --write
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';
import {Arena,catalog,checksumV40,officialSaleValueV453Dev60} from '../../../../engine.mjs';

const read=name=>JSON.parse(readFileSync(new URL('../../../../data/'+name,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const shop=read('riot_reference/sr_shop_26_21_dev49.json');
const SOURCE_COMMIT='182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d';
const SOURCE_ENGINE_BLOB_SHA='e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d';
const SOURCE_SHOP_BLOB_SHA='3779aee3f9981a043a917824c0ddfbf3fbefaecb';
const sourceLock=assertFrozenSourcesB03({shop:true});
const entries=Object.values(shop.rows).filter(r=>r.status==='engine_playable');
assert.equal(shop.counts.normalPlayable,122);
assert.equal(entries.length,122);
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const digestUnit=u=>({id:u.id,team:u.team,role:u.role,gold:u.gold,items:[...u.items],
  hp:u.hp,maxHp:u.maxHp,mana:u.mana,maxMana:u.maxMana,ap:u.ap,ad:u.ad,
  armor:u.armor,mr:u.mr,attackSpeedPct:u.attackSpeedPct,
  flatMoveSpeed:u.flatMoveSpeed,percentMoveSpeed:u.percentMoveSpeed,
  trinket:u.trinket??'stealth',wardCharges:u.wardCharges??0,
  trinketNextChargeAt:u.trinketNextChargeAt??0,
  undoRevoked:u.shopUndoRevokedV453Dev61??false,
  undoDepth:u.shopUndoV453Dev61?.length??0});
const results=[],errors=[];
for(const entry of entries){
  const item=catalog.find(it=>it.id===entry.localId);
  assert.ok(item,'catalog entry missing for '+entry.id);
  assert.equal(item.cost,entry.price,'source shop price mismatch '+entry.id);
  assert.equal(officialSaleValueV453Dev60(item.id)!==null,true,'source sale value missing '+item.id);
  for(const team of ['blue','red']){
    // Isolated deterministic RNG and fresh state per Riot item and team.
    const seed=400000+(Number(entry.id)*2)+(team==='red'?1:0);
    const arena=new Arena(map,mask,{seed,mode:'pvp'});
    const role=item.roleLock==='JG'?'JG':item.roleLock==='SUP'?'SUP':'MID';
    const unit=arena.units.find(u=>u.id===team+'_'+role);
    assert.ok(unit,'team/role not found '+team+'/'+role);
    const origin=arena.map.objects.find(o=>o.id===team+'_spawn_shop');
    assert.ok(origin);
    unit.x=origin.x;unit.y=origin.y;unit.items=[];unit.gold=50000;
    // These are test-only reset conditions, NOT an allowed gameplay action.
    if(role==='JG'){unit.junglePet=null;unit.junglePetStage=0;}
    if(role==='SUP'){unit.supportQuestStage=0;}
    const before=digestUnit(unit);
    const id='M45-B02-SR'+entry.id+'-'+team;
    // Trinkets are engine_playable catalog entries, NOT six-slot purchases.
    // canBuy() deliberately rejects them; only setTrinket() is authoritative.
    if(item.tags.includes('trinket')){
      assert.equal(item.cost,0,id+' trinket price');
      assert.equal(arena.canBuy(team,unit.id,item.id).ok,false,id+' regular purchase must reject trinket');
      const first=unit.trinket??'stealth';
      const target=item.id==='trinket_oracle'?'oracle':'stealth';
      const actions=[];
      if(target===first){
        const swap=arena.setTrinket(team,unit.id,'oracle');
        assert.equal(swap.ok,true,id+' toggle to oracle');
        actions.push({kind:'trinket.switch',trinket:'oracle',ok:swap.ok});
      }
      const receipt=arena.setTrinket(team,unit.id,target);
      assert.equal(receipt.ok,true,id+' switch to '+target);
      actions.push({kind:'trinket.switch',trinket:target,ok:receipt.ok});
      assert.equal(unit.trinket,target,id+' trinket state');
      assert.equal(unit.gold,before.gold,id+' no trinket gold debit');
      assert.deepEqual(unit.items,before.items,id+' no inventory consumption');
      const record={id,seed,team,actor:unit.id,item_id:item.id,riot_id:entry.id,
        source_commit:SOURCE_COMMIT,source_engine_blob_sha:SOURCE_ENGINE_BLOB_SHA,
        source_shop_blob_sha:SOURCE_SHOP_BLOB_SHA,action_sequence:actions,
        before,official_sell_value:officialSaleValueV453Dev60(item.id),
        after_switch:digestUnit(unit),after_switch_hash_v40:checksumV40(arena.snapshotV40()),
        outcome:'EXECUTED_PASS',subdomain:'trinket_not_shop_item',receipt};
      results.push({...record,fixture_sha256:hash(record)});
      continue;
    }
    const pre=arena.canBuy(team,unit.id,item.id);
    if(!pre.ok){
      errors.push({id,reason:pre.reason,category:'PRECONDITION_REJECTED'});
      results.push({id,seed,team,actor:unit.id,item_id:item.id,riot_id:entry.id,
        before,preflight:pre,outcome:'BLOCKED_BY_JS_SOURCE',after:digestUnit(unit)});
      continue;
    }
    const price=arena.itemPurchaseCost(unit,item.id);
    const eventCount=arena.events.length;
    const bought=arena.buy(team,unit.id,item.id);
    assert.equal(bought,true,id+' buy');
    assert.equal(unit.gold,before.gold-price,id+' economic debit');
    assert.ok(unit.items.includes(item.id),id+' inventory');
    const afterPurchase=digestUnit(unit),afterPurchaseHash=checksumV40(arena.snapshotV40());
    const purchaseEvents=arena.events.slice(0,Math.max(0,arena.events.length-eventCount))
      .map(x=>({kind:x.kind,team:x.team,unitId:x.unitId,time:x.time,text:x.text}));
    const canUndo=arena.canUndoShopV453Dev61(team,unit.id);
    if(!canUndo.ok){
      errors.push({id,reason:canUndo.reason,category:'UNDO_PRECONDITION_REJECTED'});
      results.push({id,seed,team,actor:unit.id,item_id:item.id,riot_id:entry.id,
        before,price,after_purchase:afterPurchase,after_purchase_hash_v40:afterPurchaseHash,
        purchase_events:purchaseEvents,undo_preflight:canUndo,outcome:'BLOCKED_BY_JS_SOURCE'});
      continue;
    }
    const undo=arena.undoShopV453Dev61(team,unit.id);
    assert.equal(undo.ok,true,id+' undo');
    assert.equal(unit.gold,before.gold,id+' undo gold');
    assert.deepEqual(unit.items,before.items,id+' undo inventory');
    const afterUndo=digestUnit(unit);
    const record={id,seed,team,actor:unit.id,item_id:item.id,riot_id:entry.id,
      source_commit:SOURCE_COMMIT,source_engine_blob_sha:SOURCE_ENGINE_BLOB_SHA,
      source_shop_blob_sha:SOURCE_SHOP_BLOB_SHA,
      action_sequence:[{kind:'item.buy',itemId:item.id},{kind:'item.undo'}],
      before,price,official_sell_value:officialSaleValueV453Dev60(item.id),
      after_purchase:afterPurchase,after_purchase_hash_v40:afterPurchaseHash,
      purchase_events:purchaseEvents,undo_receipt:undo,after_undo:afterUndo,
      after_undo_hash_v40:checksumV40(arena.snapshotV40()),outcome:'EXECUTED_PASS'};
    results.push({...record,fixture_sha256:hash(record)});
  }
}
const result={schema:'coachlol.m45.items.golden.catalog.b02.v1',
  source_commit:SOURCE_COMMIT,source_engine_blob_sha:SOURCE_ENGINE_BLOB_SHA,
  source_shop_blob_sha:SOURCE_SHOP_BLOB_SHA,source_lock:sourceLock,seed_rule:'400000 + RiotItemID*2 + red(1)',
  case_count:results.length,pass_count:results.filter(x=>x.outcome==='EXECUTED_PASS').length,
  ordinary_purchase_cases:results.filter(x=>x.subdomain!=='trinket_not_shop_item').length,
  trinket_switch_cases:results.filter(x=>x.subdomain==='trinket_not_shop_item').length,
  blocked_count:errors.length,errors,cases:results,execution:'EXECUTED'};
console.log(JSON.stringify({cases:results.length,pass:result.pass_count,blocked:result.blocked_count,
  status:errors.length?'FAIL':'PASS',digest:hash(result)},null,2));
assert.equal(errors.length,0,'Catalog preconditions need reconciliation before Rust golden promotion');
assert.equal(result.pass_count,244,'Expected 122 SR entries x 2 teams');
assert.equal(result.ordinary_purchase_cases,240,'Expected 120 actual purchases x 2 teams');
assert.equal(result.trinket_switch_cases,4,'Expected 2 zero-cost trinket exchanges x 2 teams');
if(process.argv.includes('--write')){
  writeFileSync(new URL('./GOLDEN_B02_CATALOG_EXECUTED.json',import.meta.url),
    JSON.stringify(result,null,2)+'\n');
}

