import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,catalog} from '../engine.mjs';

const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const shop=data('riot_reference/sr_shop_26_21_dev49.json');
const normal=Object.values(shop.rows).filter(row=>row.status==='engine_playable');
const byId=new Map(catalog.map(item=>[item.id,item]));
assert.equal(normal.length,202);
const failures=[],blocked=[],bought=[];
for(const row of normal){
 const item=byId.get(row.localId);
 if(!item){failures.push(row.id+': missing local item '+row.localId);continue;}
 const a=new Arena(map,mask,{seed:692020,mode:'pvp'});
 const role=item.roleLock||'TOP',u=a.units.find(v=>v.team==='blue'&&v.role===role);
 if(!u){failures.push(row.id+': invalid role lock '+role);continue;}
 const spawn=a.map.objects.find(x=>x.id===u.team+'_spawn_shop');
 Object.assign(u,{x:spawn.x,y:spawn.y,level:18,gold:100000,items:[],awaitingShop:true,controlWardStock:0,
  supportQuest:0,b7MidQuestComplete:false,b7ArmguardEverUsed:false,junglePet:null});
 // T3 quest prizes, trinket swaps and consumed/cursed state are NOT
 // ordinary purchases even though their Riot IDs appear in the SR catalog.
 const nonShop=!!(item.tags?.includes('noxian')||item.tags?.includes('trinket')||item.notPurchasable||item.id==='shattered_armguard');
 const eligibility=a.canBuy('blue',u.id,item.id);
 if(nonShop){
  if(eligibility.ok)failures.push(row.id+': restricted mission/trinket purchase incorrectly allowed');
  blocked.push(row.id);
  continue;
 }
 if(!eligibility.ok){failures.push(row.id+': unexpectedly blocked: '+eligibility.reason);continue;}
 const before=u.gold,expected=a.itemPurchaseCost(u,item.id);
 if(!a.buy('blue',u.id,item.id)){failures.push(row.id+': buy() rejected after canBuy');continue;}
 if(!u.items.includes(item.id))failures.push(row.id+': purchased item missing from authoritative inventory');
 if(Math.abs(before-u.gold-expected)>1e-8)failures.push(row.id+': gold mismatch');
 const undo=a.undoShopV453Dev61('blue',u.id);
 if(!undo.ok){failures.push(row.id+': Undo refused in same fountain visit '+undo.reason);continue;}
 if(u.items.includes(item.id)||u.gold!==before)failures.push(row.id+': Undo did not restore inventory and gold');
 bought.push(row.id);
}
console.log('202 SR ITEM SHOP CONTRACT: '+bought.length+' buy/undo, '+blocked.length+' intentional mission/trinket locks');
if(failures.length)console.error('ITEM SHOP GATE FAILURES\n'+failures.join('\n'));
assert.equal(normal.length,bought.length+blocked.length,'unresolved normal rows');
assert.deepEqual(failures,[]);
console.log('202/202 normal SR entries accounted for PASS');
