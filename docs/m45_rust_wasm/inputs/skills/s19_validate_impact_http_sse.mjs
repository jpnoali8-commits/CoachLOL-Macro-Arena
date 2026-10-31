/** Source-only static cross-pin receipt QA. Run with Node or V8 assert shim.
 * This does NOT execute original Node HTTP/TCP nor compile any Rust code.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export function validateS19({receipt,v8Test,nodeTest,rustSource,serverSource,
 roomSource,gatewaySource,s18Receipt,s17Receipt}){
 let n=0;
 const equal=(a,b,msg)=>{assert.deepEqual(a,b,msg);n++};
 const ok=(v,msg)=>{assert.ok(v,msg);n++};
 equal(receipt.source.head,'f0b1147ac46e585a1d5374a178b1ea462f5dc278','pinned immutable source');
 const expected={
  engine:'41679f7328a42e379fdfb8de5b92006e1bfb529f',
  map:'ad853bbb6f110c0d2b6b8b4995ac4e80169f7109',
  masks:'ecddcee76f3bce20a483ff7545ce2231696270e2',
  gateway_dev44:'4be23bdd9df6d9918a0c32b6ea699be8974bf9de',
  gateway_dev47:'adf6900a20b1b2c162ec9769b18bf1cc2c23867f',
  pvp_room_dev47:'d5d5c36c2f967ed294f6d5e9fcedcd32348eacb5',
  pvp_http_server_dev47:'61f9d941852b6378bccccf8956aa699e8761836d'
 };
 for(const [k,sha] of Object.entries(expected))equal(receipt.source.blobs[k],sha,'source blob: '+k);
 equal(receipt.files.v8_executed.git_blob_sha,'119199d51c0e327286e193fa20f454b8ae1ba19f','saved real source V8 fixture');
 equal(receipt.files.node_tcp_prepared.git_blob_sha,'65f9950d8bb2f3eb0b33563a3c4ab7c48e7c7688','unrun actual Node fixture');
 equal(receipt.files.rust_protocol_gate.git_blob_sha,'d8792129fc01cf1ac948ca828287d309195f6784','unrun Rust safety source');
 equal(receipt.runtime.test_kind,'ORIGINAL_SOURCE_MODULE_AND_HTTP_HANDLER_IN_ISOLATED_V8_WITH_SYNTHETIC_HTTP_TRANSPORT','transport clearly marked mocked');
 equal(receipt.runtime.assertions_executed,161,'actual V8 asserts executed');
 equal(receipt.runtime.assertions_passed,161,'source V8 asserts PASS');
 equal(receipt.runtime.cases,4,'four bilateral masked champion cases');
 equal(receipt.runtime.real_source_damage_reactions,4,'four real damage reactions');
 equal(receipt.runtime.real_source_damage_dealt_each,54,'authoritative resolved damage');
 equal(receipt.runtime.original_server_route_get_session_calls,20,'all real GET session handlers');
 equal(receipt.runtime.original_server_route_get_stream_subscriptions,12,'all original streaming route handlers');
 equal(receipt.runtime.original_server_route_post_action_calls,12,'all original POST action handlers');
 equal(receipt.runtime.source_snapshot_restored_rooms,4,'four restored source rooms');
 equal(receipt.runtime.leaked_stable_enemyId_in_session,4,'all session outcomes leak');
 equal(receipt.runtime.leaked_stable_enemyId_in_sse,4,'all SSE outputs leak');
 equal(receipt.runtime.leaks_after_real_hit_reveal_timeout,4,'reveal timeout respected');
 equal(receipt.runtime.leaks_after_room_checkpoint_restore,4,'room restore leaks');
 equal(receipt.runtime.forged_stable_target_rejections,4,'all forged IDs denied');
 equal(receipt.runtime.valid_appearance_alias_reaction_acks,4,'real alias authorizations success');
 equal(receipt.runtime.idempotent_same_sequence_retries,4,'no action replay');
 equal(receipt.runtime.anonymous_sessions_denied_401,4,'unauthenticated session denied');
 equal(receipt.runtime.other_team_private_pending_reaction_denied,4,'wrong seat view denied');
 equal(receipt.witnesses.length,4,'four source witnesses');
 const witness=[['blue','Neeko','red_TOP','appearance_1'],
  ['blue','Shaco','red_MID','appearance_3'],
  ['red','Neeko','blue_TOP','appearance_1'],
  ['red','Shaco','blue_MID','appearance_3']];
 for(let i=0;i<4;i++){
  equal(receipt.witnesses[i].defender,witness[i][0],'seat '+i);
  equal(receipt.witnesses[i].attacker_champ,witness[i][1],'champ '+i);
  equal(receipt.witnesses[i].server_enemy_id_leaked,witness[i][2],'ID '+i);
  equal(receipt.witnesses[i].visible_public_alias,witness[i][3],'alias '+i);
  equal(receipt.witnesses[i].actual_damage,54,'real damage '+i);
 }
 equal(receipt.runtime.actual_native_node_tcp_http,'NOT_RUN','no fake TCP PASS');
 equal(receipt.runtime.actual_crypto_token_hashing,'NOT_RUN','no fake crypto claim');
 equal(receipt.runtime.actual_rust,'NOT_RUN','no Rust native claim');
 equal(receipt.runtime.actual_wasm,'NOT_RUN','no Rust WASM claim');
 equal(receipt.rust_artifacts.native_executed,0,'no Rust native tests');
 equal(receipt.rust_artifacts.standalone_rust_reference_tests_prepared,5,'five data-spec Rust unit tests');
 equal(receipt.legacy_s10_frozen.v8_pass,22,'frozen S10 pass');
 equal(receipt.legacy_s10_frozen.v8_fail,2,'frozen S10 fail');
 equal(receipt.legacy_s10_frozen.v8_not_run,2,'frozen S10 not run');
 equal(receipt.previous_s18.v8_asserts,121,'S18 reproduced');
 equal(s18Receipt.v8_actual.assertions_passed,121,'S18 receipt matches');
 equal(s17Receipt.execution.assertions_pass,149,'S17 receipt matches');
 equal(receipt.gates.G8,'NOT_CERTIFIED','no premature certification');
 ok(v8Test.includes('arena.duelPermission(attacker,defender)'),'genuine duel');
 ok(v8Test.includes('arena.damage(defender,65,attacker'),'genuine damage');
 ok(v8Test.includes('arena.processAmbushResponses()'),'genuine reaction generation');
 ok(v8Test.includes('arena.gameTime=5; // actual hit gives 2s reveal'),'honor actual reveal expiration');
 ok(v8Test.includes('await exposed.server.handler(req,res)'),'unchanged original route handler');
 ok(v8Test.includes("transport(defenderTeam,'/api/session')"),'GET route exercised');
 ok(v8Test.includes("transport(defenderTeam,'/api/stream')"),'SSE route exercised');
 ok(v8Test.includes("transport(defenderTeam,'/api/action','POST'"),'POST route exercised');
 ok(v8Test.includes("eq(forged.status,409"),'forged stable ID rejected');
 ok(v8Test.includes("eq(allowed.status,200"),'valid alias reaction accepted');
 ok(v8Test.includes("same(idempotent.json,allowed.json"),'original retry idempotency');
 ok(v8Test.includes("const cp=room.checkpoint()"),'restore full checkpoint');
 ok(v8Test.includes("const loaded=Arena.fromSnapshotV40"),'restore Arena');
 ok(v8Test.includes("registry.currentRoom=resumed"),'restored registry used by server');
 ok(serverSource.includes("if(req.method==='GET'&&path==='/api/session')"),'original GET handler exists');
 ok(serverSource.includes("if(req.method==='GET'&&path==='/api/stream')"),'original SSE handler exists');
 ok(serverSource.includes("if(req.method==='POST'&&path==='/api/action')"),'original POST handler exists');
 ok(serverSource.includes("room.subscribe(player,projection=>res.write"),'SSE sends original room projection');
 ok(roomSource.includes('enemyId:this.arena.pendingDecision.enemyId'),'original privacy defect still present');
 ok(roomSource.includes('const data=this.started?this.gateway.view(p.seatId):null'),'original gateway view');
 ok(gatewaySource.includes("return fail('alvo_identidade_oculta')"),'stable masked ID denied by original gateway');
 ok(nodeTest.includes("await service.listen(0,'127.0.0.1')"),'native localhost future fixture');
 ok(nodeTest.includes("createHash('sha256')"),'future real SHA tokens');
 ok(nodeTest.includes("import test from 'node:test'"),'future Node test harness');
 ok(nodeTest.includes("test('S19 legacy real network P1 witness"),'four future native tests declared');
 ok(rustSource.includes('pub trait ActualRustHttpSseRunner'),'future real Rust trait');
 ok(rustSource.includes('pub fn validate_real_rust_http_sse'),'future real Rust acceptance');
 ok(rustSource.includes('pub fn project_reaction_to_seat'),'Rust public projection code');
 ok(rustSource.includes('pub const REQUIRED_NEGATIVE_TESTS: [&str; 10]'),'ten adversarial requirements');
 ok(rustSource.includes('!r.forged_stable_target_rejected'),'keep denied stable ID');
 ok(rustSource.includes('r.true_actor_id_exposed_in_any_external_json'),'no JSON raw id');
 equal([...rustSource.matchAll(/#\[test\]\s*fn\s+\w+/g)].length,5,'5 Rust tests source only');
 ok(receipt.no_manual_github_actions && receipt.no_merge && receipt.no_original_branch_edits,'branch safety');
 return {status:'V8_STATIC_INTEGRITY_PASS',checks:n,
  saved_V8_gameplay_and_route_asserts:161,actual_native_network:'NOT_RUN',
  rust_native:'NOT_RUN',rust_wasm:'NOT_RUN'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const root=new URL('./',import.meta.url);
 const json=n=>JSON.parse(readFileSync(new URL(n,root),'utf8'));
 const txt=n=>readFileSync(new URL(n,root),'utf8');
 const dir=new URL('../../../../',import.meta.url);
 console.log('M45_S19_STATIC '+JSON.stringify(validateS19({
  receipt:json('S19_REAL_IMPACT_HTTP_SSE_V8_RECEIPT.json'),
  v8Test:txt('s19_real_impact_server_route_sse_v8.mjs'),
  nodeTest:txt('s19_native_node_http_sse.test.mjs'),
  rustSource:txt('s19_http_sse_reaction_privacy_gate.rs'),
  serverSource:readFileSync(new URL('multiplayer/server_v453_dev47.mjs',dir),'utf8'),
  roomSource:readFileSync(new URL('multiplayer/room_v453_dev47.mjs',dir),'utf8'),
  gatewaySource:readFileSync(new URL('multiplayer/authoritative_actions_v453_dev44.mjs',dir),'utf8'),
  s18Receipt:json('S18_PVP_ROOM_IDENTITY_V8_RECEIPT.json'),
  s17Receipt:json('S17_EVENT_HISTORY_V8_RECEIPT.json')
 })));
}
