// M45 B02B-04: adversarial PvP trinket route: frozen legacy intentionally denies it.
// This is a gap / regression oracle, NOT a passing functional trinket PvP feature.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {PvPRoomRegistryV453Dev47} from '../../../../multiplayer/room_v453_dev47.mjs';
import {checksumV40} from '../../../../engine.mjs';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';
const sourceLock=assertFrozenSourcesB03({server:true});
const read=file=>JSON.parse(readFileSync(new URL('../../../../data/'+file,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest});
let first;
const original=Math.random;
try {Math.random=()=>0.271828;first=reg.create();}
finally {Math.random=original;}
const room=first.room,second=room.join();
assert.equal(room.arena.seed,271828);
const records=[];
for(const [player,team] of [[first.player,'blue'],[second.player,'red']]){
 const unit=room.arena.units.find(u=>u.id===team+'_MID');
 assert.ok(unit);
 const before={trinket:unit.trinket??'stealth',gold:unit.gold,items:[...unit.items],
  snapshot_checksum_v40:checksumV40(room.arena.snapshotV40())};
 const requests=[
  {sequence:1,kind:'item.buy',unitId:unit.id,payload:{itemId:'trinket_oracle'}},
  {sequence:1,kind:'item.queue',unitId:unit.id,payload:{itemId:'trinket_oracle'}},
  {sequence:1,kind:'item.trinket',unitId:unit.id,payload:{itemId:'trinket_oracle'}}
 ];
 const receipts=requests.map(cmd=>({kind:cmd.kind,receipt:room.command(player,cmd)}));
 for(const r of receipts)assert.equal(r.receipt.ok,false,'legacy PvP must refuse '+r.kind);
 assert.equal(unit.trinket??'stealth',before.trinket,'denied packet cannot switch');
 assert.equal(unit.gold,before.gold,'denied packet cannot charge gold');
 assert.deepEqual(unit.items,before.items,'denied packet cannot mutate inventory');
 assert.equal(checksumV40(room.arena.snapshotV40()),before.snapshot_checksum_v40,
  'denied packet is idempotent for game state');
 const record={case_id:'M45-B04-PVP-GAP-'+team,sourceLock,team,seed:room.arena.seed,
   requests:requests.map(({sequence,kind,unitId,payload})=>({sequence,kind,unitId,payload})),
   receipts, before, after:{trinket:unit.trinket??'stealth',gold:unit.gold,items:[...unit.items]},
   finding:"LEGACY_PVP_TRINKET_ROUTE_MISSING",finding_status:"GAP_NOT_FIX"};
 records.push({...record,fixture_sha256:hash(record)});
}
assert.equal(records.length,2);
const fixture={schema:'coachlol.m45.items.pvp.trinket_gap.b04.v1',
 sourceLock,execution:'EXECUTED',meaning:'expected rejections prove legacy gap, NOT trinket feature availability',
 cases:records};
if(process.argv.includes('--write'))
 writeFileSync(new URL('./GOLDEN_B04_PVP_GAP_EXECUTED.json',import.meta.url),JSON.stringify(fixture,null,2)+'\n');
console.log(JSON.stringify({status:'LEGACY_GAP_CONFIRMED',cases:records.length,sha256:hash(fixture)}));
