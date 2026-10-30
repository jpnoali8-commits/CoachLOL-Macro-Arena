#!/usr/bin/env node
// M45 B02B: static receipt-integrity gate. Does NOT execute gameplay/Rust/WASM.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = new URL('../../docs/m45_rust_wasm/inputs/core/b02b/', import.meta.url);
const origin = Object.freeze({
  skills:'f0b1147ac46e585a1d5374a178b1ea462f5dc278',
  items:'182e592fc27cc9516cf6d52ef2fabc17ee1e1b7d',
  platform:'374d87d5f49b52514ec68bbe666df086363c1ec5',
});
const pinned = Object.freeze({
  skillsPlan:['skills_golden_plan.json','736c8f9367110e54b84bced9cc9aa8964b0adfe8'],
  itemsIndex:['items_v8_index.json','036a620ab7fd2e68f37e9790eb9c66208d8c38b0'],
  itemsCatalog:['items_v8_catalog.json','b98f3879fd5118f00aa85615fc4622dfb3d11333'],
  itemsEffects:['items_v8_effects.json','be04c91bd9bb77a97b060116644efe047e5a7235'],
  itemsEconomy:['items_v8_economy.json','b9ec4f1e3ef9bc83589b081fe454e5114d9cf164'],
  itemsTrinket:['items_v8_trinket.json','384d6c64f245cade000956555d256793536d44ff'],
  itemsReplay:['items_v8_determinism.json','a376eb7e4b6f771377d7feea3e427ab7cc3a2d74'],
  platform:['platform_a07_transport.json','4af0bd6e353a0b883f37ca9cf9ac11c1cf7169d3'],
});
const gitBlob = bytes => createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const a = {};
for(const [id,[file,sha]] of Object.entries(pinned)) {
  const bytes=readFileSync(new URL(file,root));
  assert.equal(gitBlob(bytes),sha,'Changed Git blob: '+file);
  a[id]=JSON.parse(bytes.toString('utf8'));
}
const tally=(rows,field)=>Object.fromEntries([...new Set(rows.map(field))].map(k=>[k,rows.filter(x=>field(x)===k).length]));
const caseKey=x=>x.item_id+'|'+x.team+'|'+x.seed;
const hash40=x=>typeof x==='string' && /^[a-f0-9]{8}$/.test(x);
test('pinned snapshots reflect source SHAs and unexecuted gates',()=>{
  assert.equal(a.skillsPlan.source_commit,origin.skills);
  assert.equal(a.skillsPlan.engine_git_blob_sha,'41679f7328a42e379fdfb8de5b92006e1bfb529f');
  assert.equal(a.skillsPlan.result_status,'NOT_RUN');
  assert.equal(a.itemsIndex.origin.items_commit,origin.items);
  assert.equal(a.itemsIndex.origin.integration_commit,origin.platform);
  assert.equal(a.platform.source.integration_sha,origin.platform);
  assert.equal(a.itemsIndex.gates.G8,'NOT_CERTIFIED');
  assert.equal(a.platform.qa.http_e2e,'NOT_RUN');
});
test('25 skills golden suite refs remain planned, unique and NOT_RUN',()=>{
  const rows=a.skillsPlan.suites;
  assert.equal(rows.length,25);
  assert.equal(new Set(rows.map(x=>x.id)).size,25);
  for(const x of rows){
    assert.equal(x.source_commit,origin.skills);
    assert.equal(x.engine_git_blob_sha,a.skillsPlan.engine_git_blob_sha);
    assert.match(x.test_git_blob_sha,/^[a-f0-9]{40}$/);
    assert.ok(x.test_path.startsWith('tests/')||x.test_path.startsWith('docs/m45_rust_wasm/inputs/skills/'));
    assert.equal(x.status,'SPEC_ONLY_NOT_RUN',x.id);
    assert.equal(x.run_result,null,x.id);
  }
  for(const n of ['s06_nami_q','s07_nami_routes','s08_nami_w_coqueued'])
    assert.ok(rows.some(x=>x.id===n),n);
});
test('244 catalog scenarios preserve both seats, purchase and trinket distinctions',()=>{
  const rows=a.itemsCatalog.cases;
  assert.equal(rows.length,244);
  assert.deepEqual(tally(rows,x=>x.team),{blue:122,red:122});
  assert.deepEqual(tally(rows,x=>x.command),{'item.buy+undo':240,'trinket.switch':4});
  assert.equal(new Set(rows.map(x=>x.case_id)).size,244);
  for(const c of rows){
    assert.equal(c.status,'PASS',c.case_id);
    assert.ok(hash40(c.before.checksum_v40),c.case_id);
    assert.equal(c.seed,400000+Number(c.riot_id)*2+(c.team==='red'?1:0),c.case_id);
    if(c.command==='item.buy+undo'){
      assert.ok(c.purchase.price>0);
      assert.equal(c.purchase.after_gold,c.before.gold-c.purchase.price,c.case_id);
      assert.equal(c.undo.receipt.ok,true,c.case_id);
      assert.equal(c.undo.after_gold,c.before.gold,c.case_id);
      assert.ok(hash40(c.purchase.checksum_v40)&&hash40(c.undo.checksum_v40));
    }else {
      assert.equal(c.after.gold,c.before.gold,c.case_id);
      assert.ok(hash40(c.after.checksum_v40));
    }
  }
});
test('244 replay records match exact catalog seed and stage hashes',()=>{
  const catalog=new Map(a.itemsCatalog.cases.map(x=>[caseKey(x),x]));
  const rows=a.itemsReplay.cases;
  assert.equal(rows.length,244);
  assert.equal(a.itemsReplay.matched,244);
  assert.equal(a.itemsReplay.diverged,0);
  assert.equal(a.itemsReplay.executions,488);
  assert.equal(new Set(rows.map(caseKey)).size,244);
  for(const x of rows){
    const c=catalog.get(caseKey(x));
    assert.ok(c,'Missing catalog: '+caseKey(x));
    assert.equal(x.repeat_equal,true,x.case_id);
    const expected=c.command==='item.buy+undo'
      ? [c.before.checksum_v40,c.purchase.checksum_v40,c.undo.checksum_v40]
      : [c.before.checksum_v40,c.after.checksum_v40];
    assert.deepEqual(x.hashes,expected,x.case_id);
  }
});
test('299 item V8 cases track 2 expected PvP trinket denials as open BUG, not success',()=>{
  const i=a.itemsIndex,e=a.itemsEconomy,f=a.itemsEffects,t=a.itemsTrinket;
  assert.equal(e.cases.length,11);
  assert.equal(f.cases.length,36);
  assert.equal(t.cases.length,8);
  assert.ok(e.cases.every(c=>c.status==='PASS'));
  assert.ok(f.cases.every(c=>c.status==='PASS'));
  const groups=tally(t.cases,x=>x.category);
  assert.equal(groups.ARENA_INTERNAL,6);
  assert.equal(groups.EXPECTED_PVP_REJECTIONS_OPEN_BUG,2);
  assert.ok(t.cases.filter(c=>c.category==='EXPECTED_PVP_REJECTIONS_OPEN_BUG').every(c=>
    c.status==='PASS_EXPECTED_REJECTION_NOT_FUNCTIONAL' &&
    c.observed.receipts.some(r=>r.kind==='item.trinket' && r.receipt.ok===false)
  ));
  assert.equal(i.results.observed,244+11+36+8);
  assert.equal(i.results.positive,297);
  assert.equal(i.results.expectedDenials,2);
  assert.equal(i.results.errors,0);
  assert.equal(i.results.gateway_gap.severity,'P1');
  assert.equal(i.results.deterministic_replay.checksum_matches,244);
  assert.equal(i.receipt_files.length,5);
  for(const r of i.receipt_files)assert.match(r.git_blob_sha,/^[a-f0-9]{40}$/);
});
test('12 platform contracts do not claim Rust/network/browser certification',()=>{
  const p=a.platform;
  assert.equal(p.matrix.length,12);
  assert.equal(new Set(p.matrix.map(x=>x.id)).size,12);
  assert.equal(p.qa.node_sse_decoder,'8/8_PASS');
  assert.equal(p.qa.full_engine_subscribe,'13/13_PASS_V8');
  for(const k of ['http_e2e','disk_io','rust','wasm','browser'])assert.equal(p.qa[k],'NOT_RUN');
  assert.ok(p.matrix.some(x=>x.severity==='P0'));
});
