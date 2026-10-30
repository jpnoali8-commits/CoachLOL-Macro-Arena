// M45 platform golden regression — SOURCE ONLY until executed in a full checkout.
// Provenance: dev69/integration 374d87d5f49b52514ec68bbe666df086363c1ec5.
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checksumV40} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';

const load = name => JSON.parse(readFileSync(new URL('../data/'+name, import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),manifest=load('rift_user_manifest_v452d4.json');
const dir=mkdtempSync(join(tmpdir(),'coachlol-m45-platform-'));
try {
 const make=()=>new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir});
 const registry=make(), first=registry.create(2), room=first.room, second=room.join();
 assert.equal(room.players.length,2);
 assert.deepEqual([...room.gateway.seats.get('p1').unitIds].sort(),['blue_MID','blue_TOP','blue_JG','blue_ADC','blue_SUP'].sort());
 assert.deepEqual([...room.gateway.seats.get('p2').unitIds].sort(),['red_MID','red_TOP','red_JG','red_ADC','red_SUP'].sort());
 assert.equal(room.authenticate(first.token)?.seatId,'p1');
 assert.equal(room.authenticate(second.token)?.seatId,'p2');
 const before=checksumV40(room.arena.snapshotV40());
 const forgery=room.command(first.player,{sequence:1,kind:'order.stop',unitId:'red_TOP',payload:{}});
 assert.equal(forgery.ok,false);
 assert.equal(room.gateway.seats.get('p1').lastSequence,0);
 assert.equal(checksumV40(room.arena.snapshotV40()),before);
 const blue={sequence:1,kind:'order.stop',unitId:'blue_TOP',payload:{}};
 const red={sequence:1,kind:'order.stop',unitId:'red_TOP',payload:{}};
 const ack=room.command(first.player,blue);
 assert.ok(ack.ok,JSON.stringify(ack));
 assert.ok(room.command(second.player,red).ok);
 const after=checksumV40(room.arena.snapshotV40());
 assert.deepEqual(room.command(first.player,blue),ack);
 assert.equal(checksumV40(room.arena.snapshotV40()),after);
 assert.equal(room.command(first.player,{...blue,kind:'order.recall'}).ok,false);
 assert.equal(checksumV40(room.arena.snapshotV40()),after);
 room.arena.visible=(team,unit)=>unit.team===team;
 const bv=room.view(first.player),rv=room.view(second.player);
 assert.equal(bv.projection.units.some(u=>u.id==='red_TOP'),false);
 assert.equal(rv.projection.units.some(u=>u.id==='blue_TOP'),false);
 for(const v of [bv,rv]) {
   assert.equal(Object.hasOwn(v,'rngState'),false);
   assert.equal(Object.hasOwn(v,'arena'),false);
   assert.equal(Object.hasOwn(v,'state'),false);
 }
 assert.ok(room.confirm(first.player).ok);
 assert.notEqual(room.arena.phase,'executing');
 assert.ok(room.confirm(second.player).ok);
 assert.equal(room.arena.phase,'executing');
 const reloaded=make().get(room.id);
 assert.ok(reloaded,'checkpoint room restored');
 const restoredBlue=reloaded.authenticate(first.token);
 const restoredRed=reloaded.authenticate(second.token);
 assert.equal(restoredBlue?.seatId,'p1');
 assert.equal(restoredRed?.seatId,'p2');
 assert.equal(reloaded.view(restoredBlue).nextSequence,2);
 const stateBeforeReplay=checksumV40(reloaded.arena.snapshotV40());
 assert.deepEqual(reloaded.command(restoredBlue,blue),ack);
 assert.equal(checksumV40(reloaded.arena.snapshotV40()),stateBeforeReplay);
 console.log('M45 PLATFORM LEGACY GOLDEN PASS (two seats, ownership, receipt replay, fog and checkpoint)');
} finally {rmSync(dir,{recursive:true,force:true});}
