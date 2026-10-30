#!/usr/bin/env node
/* Deterministic source-only S04/S05 QA. This NEVER labels PvP gameplay or Rust as PASS. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../');
const source=readFileSync(resolve(root,'engine.mjs'));
const gitBlob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const matrix=JSON.parse(readFileSync(resolve(here,'inventory_slots.json'),'utf8'));
const audit=JSON.parse(readFileSync(resolve(here,'precedence_overlaps.json'),'utf8'));
const plan=JSON.parse(readFileSync(resolve(here,'golden_plan.json'),'utf8'));
assert.equal(gitBlob(source),'41679f7328a42e379fdfb8de5b92006e1bfb529f');
assert.equal(matrix.meta.source_commit,'f0b1147ac46e585a1d5374a178b1ea462f5dc278');
assert.equal(matrix.rows.length,865);assert.equal(new Set(matrix.rows.map(r=>r.feature_id)).size,865);
assert.equal(matrix.stats.registry_duplicate_slots_s04,27);
assert.equal(matrix.rows.filter(r=>r.variants.length>1).length,50);
assert.equal(matrix.stats.s05_new_v42_entries,5);
assert.equal(matrix.stats.s05_routing_handlers,25);
assert.equal(matrix.stats.s05_promoted_from_reference_or_absent,22);
assert.equal(matrix.stats.synthetic_scan_duplicates_removed,29);
assert.deepEqual(audit.counts,{source_matrix_overlap_slots:56,synthetic_duplicates:29,
 form_conditional:16,v42_overlap:10,v382_overlap:1,other_active:0});
const src=source.toString('utf8');
const chunk=src.slice(src.indexOf('export function m44B14DOriginalBoardRuleV453'),
 src.indexOf('export function abilityRule'));
assert.ok(chunk.includes('m16.m16OnlyHuman'));
assert.ok(chunk.includes("champ==='Gnar'&&gnarMega?M44_B09_GNAR_MEGA_V453[slot]"));
const order=[...chunk.matchAll(/([A-Z][A-Z0-9_]+)\[champ\]\?\.\[slot\]/g)].map(x=>x[1]);
const expected=audit.rules.source_lookup_order.filter(x=>x!=='M44_B09_GNAR_MEGA_V453'&&
 x!=='FORM_KITS_V453_M14'&&x!=='CHAMPION_KITS_V42'&&x!=='CHAMPION_SPELL_RULES_V382');
assert.deepEqual(order,expected);
const legacy=src.slice(src.indexOf('export function abilityRule'),src.indexOf('export function abilityCost'));
assert.ok(legacy.indexOf('kitSpellV42(u.champ,slot)')<legacy.indexOf('CHAMPION_SPELL_RULES_V382[u.champ]'));
for(const c of audit.cases){
 const row=matrix.rows.find(r=>r.feature_id===c.feature_id);
 assert.ok(row,c.feature_id);
 assert.equal(new Set(row.variants.map(v=>v.symbol)).size,row.variants.length,c.feature_id);
 if(c.category==='STATIC_SCAN_DUPLICATE')assert.equal(row.variants.length,1,c.feature_id);
 else assert.ok(row.variants.length>=2,c.feature_id);
}
const routes=JSON.parse(readFileSync(resolve(here,'S05_V42_HANDLER_RECONCILIATION.json'),'utf8'));
assert.equal(routes.corrected_v42_registry.entries.length,35);
assert.equal(routes.handler_candidates.entries.length,25);
for(const entry of routes.corrected_v42_registry.entries){
 const row=matrix.rows.find(r=>r.feature_id===entry.feature_id);
 assert.ok(row.variants.some(v=>v.symbol===entry.catalog_symbol),entry.feature_id);
}
for(const entry of routes.handler_candidates.entries){
 const row=matrix.rows.find(r=>r.feature_id===entry.feature_id);
 assert.ok(row.variants.some(v=>v.marker_references?.[0]===entry.source_symbols[0]),entry.feature_id);
 for(const symbol of entry.source_symbols)assert.ok(src.includes(symbol+'('),symbol);
}
assert.equal(plan.suites.length,19);
for(const t of plan.suites){
 assert.equal(gitBlob(readFileSync(resolve(root,t.test_path))),t.test_git_blob_sha,
  'fixture provenance '+t.id);
}
console.log('M45_SKILLS_S05_STATIC_PASS slots=865 historical_overlaps=56 synthetic=29 original_registry_multivariants=27 total_source_evidence_multivariants=50 pinned_suites=19');
console.log('NOTE: verifies provenance/precedence descriptors only; executable blue/red golden and Rust are NOT_RUN.');
