/** M45 A02 strict red-team, source 374d87d5f49b52514ec68bbe666df086363c1ec5.
 * The legacy projection's permissive anonymous-event rule may FAIL this test.
 * An artificial event does not prove a real gameplay information leak.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const reg=new PvPRoomRegistryV453Dev47({map:load('coachlol_map_v6.json'),mask:load('masks_128.json'),manifest:load('rift_user_manifest_v452d4.json')});
const a=reg.create(2),red=a.room.join();
const marker='M45_A02_PRIVATE_UNCLASSIFIED_EVENT';
const saved=a.room.arena.events;
try{
 a.room.arena.events=[{kind:'redteam_fault_injection',private:true,text:marker}];
 const visible=JSON.stringify(a.room.view(red.player));
 assert.equal(visible.includes(marker),false,'LEGACY_GAP: unclassified private event must be default-denied in Rust');
 console.log('PASS default-deny of unclassified event');
}finally{a.room.arena.events=saved;}
