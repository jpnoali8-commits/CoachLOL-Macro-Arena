// M45 Chat 3 B02B-ITEMS B11 — frozen Node ESM room/gateway oracle.
// node docs/m45_rust_wasm/inputs/items/golden_b11_pvp_replay_boundary.test.mjs [--write]
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Arena,checksumV40} from '../../../../engine.mjs';
import {AuthoritativeActionsV453Dev47 as Gateway} from '../../../../multiplayer/authoritative_actions_v453_dev47.mjs';
import {PvPRoomV453Dev47 as Room} from '../../../../multiplayer/room_v453_dev47.mjs';
import {assertFrozenSourcesB03} from './oracle_source_lock_b03.mjs';
import {runPvPReplayBoundaryB11} from './pvp_replay_boundary_b11_cases.mjs';
const source_lock=assertFrozenSourcesB03({server:true});
const data=n=>JSON.parse(readFileSync(new URL('../../../../data/'+n,import.meta.url),'utf8'));
const args={Arena,Gateway,Room,map:data('coachlol_map_v6.json'),mask:data('masks_128.json'),checksumV40};
const first=runPvPReplayBoundaryB11(args),second=runPvPReplayBoundaryB11(args);
assert.equal(first.summary.scenarios,19);assert.equal(first.summary.planned,38);
assert.equal(first.summary.passed,38,JSON.stringify(first.cases.filter(x=>x.status!=='PASS')));
assert.equal(first.summary.gateway_cases,24);assert.equal(first.summary.room_cases,14);
assert.equal(first.cases.filter(x=>x.team==='blue').length,19);
assert.equal(first.cases.filter(x=>x.team==='red').length,19);
assert.deepEqual(first.cases,second.cases,'38 deterministic PvP room/gateway source checks');
const output={schema:'coachlol.m45.items.pvp_replay_boundary.golden.b11.v1',execution:'EXECUTED_NODE_ESM',
 source_lock,summary:first.summary,cases:first.cases,deterministic_repeat:true,
 warning:'Room/gateway class logic only; network HTTP/SSE, crypto strength, disk checkpoint, Rust, WASM and G8 not certified'};
const sha256=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
if(process.argv.includes('--write'))writeFileSync(new URL('./GOLDEN_B11_PVP_REPLAY_BOUNDARY_EXECUTED.json',import.meta.url),JSON.stringify({...output,sha256:sha256(output)},null,2)+'\n');
console.log(JSON.stringify({status:'PASS_LEGACY_NODE_ESM_ONLY',cases:38,sha256:sha256(output)}));
