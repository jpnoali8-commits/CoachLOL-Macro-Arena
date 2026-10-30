// M45 Chat 3 — golden JS ORACLE, not new gameplay.
// Execute only in a checkout of dev69/m45-audit-items (source baseline 182e592...).
// node docs/m45_rust_wasm/inputs/items/golden_b01.test.mjs
// Use --write only to persist executed results; never fabricate a fixture.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Arena,checksumV40,ITEM_FAMILY_RULES_V453_DEV69,ITEM_EFFECTS_V43} from '../../../../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../../../../multiplayer/room_v453_dev47.mjs';

const data=file=>JSON.parse(readFileSync(new URL('../../../../data/'+file,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),masks=data('masks_128.json'),manifest=data('rift_user_manifest_v452d4.json');
const SOURCE_COMMIT='182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d';
const SOURCE_ENGINE_BLOB='e06cfe0c18ded3d21f7a1d9bc62909543ccbbb6d';
const cases=[];
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const arena=(seed=45001)=>new Arena(map,masks,{seed,mode:'pvp'});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.id===team+'_'+role);
function prep(u,gold=1200){u.items=[];u.gold=gold;return u;}
function view(u){return {id:u.id,team:u.team,gold:u.gold,items:[...u.items],x:u.x,y:u.y,revoked:!!u.shopUndoRevokedV453Dev61,undoDepth:u.shopUndoV453Dev61?.length||0};}
function capture(id,seed,team,a,actor,before,action,extra={}){
  const out={id,source_commit:SOURCE_COMMIT,source_engine_blob_sha:SOURCE_ENGINE_BLOB,seed,team,actor_id:actor.id,
   input:action,before,after:view(actor),round:a.round,game_time:a.gameTime,
   snapshot_checksum_v40:checksumV40(a.snapshotV40()),...extra};
  cases.push({...out,fixture_sha256:digest(out)});
}
for (const team of ['blue','red']){
 const seed=45001+(team==='red'?1:0);
 const a=arena(seed),u=prep(hero(a,team),1200),before=view(u);
 assert.equal(a.buy(team,u.id,'boots'),true);
 assert.equal(u.gold,900);assert.deepEqual(u.items,['boots']);
 capture('M45-B01-BUY-'+team,seed,team,a,u,before,{kind:'item.buy',itemId:'boots'});
 const preUndo=view(u);
 assert.equal(a.undoShopV453Dev61(team,u.id).ok,true);
 assert.equal(u.gold,1200);assert.deepEqual(u.items,[]);
 capture('M45-B01-UNDO-'+team,seed,team,a,u,preUndo,{kind:'item.undo'});
}
{
 const seed=45003,a=arena(seed),u=prep(hero(a,'blue'),1200);
 assert.equal(a.buy('blue',u.id,'boots'),true);
 const before=view(u),refund=a.sellItemV43('blue',u.id,0);
 assert.equal(refund.ok,true);assert.equal(refund.refund,210);assert.equal(u.gold,1110);
 assert.deepEqual(u.items,[]);
 capture('M45-B01-SELL-blue',seed,'blue',a,u,before,{kind:'item.sell',index:0},{receipt:refund});
}
{
 const seed=45004,a=arena(seed),u=prep(hero(a,'blue'),1200);
 assert.equal(a.buy('blue',u.id,'boots'),true);
 const shop=a.map.objects.find(o=>o.id==='blue_spawn_shop');
 const outside={x:shop.x+.1,y:shop.y};
 const before=view(u);
 assert.ok(a.walkable(outside.x,outside.y));
 assert.ok(a.moveAlong(u,{path:[outside],point:outside,action:'move'},1500)>1125);
 assert.equal(u.shopUndoRevokedV453Dev61,true);assert.equal(u.shopUndoV453Dev61.length,0);
 assert.ok(a.moveAlong(u,{path:[{x:shop.x,y:shop.y}],point:shop,action:'move'},1500)>1125);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,false);
 capture('M45-B01-LEAVE-RETURN-blue',seed,'blue',a,u,before,{kind:'move.departs_then_returns',oldUndoAttempt:true});
 const snap=a.snapshotV40(),loaded=Arena.fromSnapshotV40(map,masks,snap),restored=hero(loaded);
 assert.equal(loaded.canUndoShopV453Dev61('blue',u.id).ok,false);
 capture('M45-B01-RECONNECT-blue',seed,'blue',loaded,restored,view(u),{kind:'restore.fromSnapshotV40'},
    {restored_checksum_matches:checksumV40(loaded.snapshotV40())===checksumV40(snap)});
 const newVisitBefore=view(u);
 assert.equal(a.buy('blue',u.id,'long_sword'),true);
 assert.equal(a.undoShopV453Dev61('blue',u.id).ok,true);
 assert.deepEqual(u.items,['boots']);assert.equal(u.gold,900);
 capture('M45-B01-NEW-VISIT-blue',seed,'blue',a,u,newVisitBefore,{kind:'item.buyThenUndoNewVisit',itemId:'long_sword'});
}
{
 const reg=new PvPRoomRegistryV453Dev47({map,mask:masks,manifest});
 const blue=reg.create(),room=blue.room,red=room.join();
 const seed=room.arena.seed??null;
 for(const [player,team,role] of [[blue.player,'blue','TOP'],[red.player,'red','SUP']]){
  const u=prep(hero(room.arena,team,role),1200),before=view(u);
  assert.equal(room.command(player,{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}}).ok,true);
  assert.equal(room.command(player,{sequence:2,unitId:u.id,kind:'item.undo',payload:{}}).ok,true);
  assert.equal(u.gold,1200);assert.deepEqual(u.items,[]);
  capture('M45-B01-PVP-'+team,seed,team,room.arena,u,before,{kind:'room.commands',sequence:[1,2],actions:['item.buy','item.undo']});
 }
 const victim=hero(room.arena,'blue','TOP'),before=view(victim);
 assert.equal(room.command(red.player,{sequence:3,unitId:victim.id,kind:'item.buy',payload:{itemId:'boots'}}).ok,false);
 capture('M45-B01-ACL-red-denied',seed,'red',room.arena,victim,before,{kind:'item.buy',as:'red',target:victim.id},{denied:true});
}
assert.ok(ITEM_FAMILY_RULES_V453_DEV69.maw_of_malmortius);
assert.ok(ITEM_EFFECTS_V43.banshees_veil);
const result={schema:'coachlol.m45.items.golden.oracle.v1',oracle:'JS SOURCE BRANCH ONLY',source_commit:SOURCE_COMMIT,
 source_engine_blob_sha:SOURCE_ENGINE_BLOB,execution:'EXECUTED',cases,case_count:cases.length};
if(process.argv.includes('--write')){
 const dest=new URL('./GOLDEN_B01_EXECUTED.json',import.meta.url);
 writeFileSync(dest,JSON.stringify(result,null,2)+'\n');
 console.log('Golden source fixture written at',dest.pathname);
}
console.log(JSON.stringify({case_count:cases.length,ids:cases.map(x=>x.id),hash:digest(result),status:'PASS'},null,2));
