import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,ROLES} from '../engine.mjs';
const rd=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const drafts=rd('pacing_drafts_v452d4_dev24.json').profiles;
const map=rd('coachlol_map_v6.json'),mask=rd('masks_128.json');
let pass=0;function test(name,fn){fn();pass++;console.log('✓ DEV24 '+name);}
test('cinco composições distintas completas com papéis e jungler Smite',()=>{
 assert.equal(Object.keys(drafts).length,5);
 const fingerprints=new Set();
 for(const [profile,draft] of Object.entries(drafts)){
  const a=new Arena(map,mask,{seed:24,draft,mode:'bot',roundSeconds:10});
  const fingerprint=a.units.map(u=>u.champ).join('|');
  assert.ok(!fingerprints.has(fingerprint),profile);fingerprints.add(fingerprint);
  assert.equal(a.units.length,10);
  for(const side of ['blue','red'])for(const role of ROLES){
   const u=a.units.find(u=>u.team===side&&u.role===role);
   assert.equal(u.champ,draft[side][role]);
   if(role==='JG')assert.ok(u.summonerSlots.includes('smite'));
  }
 }
});
test('draft alternativo persiste por snapshot sem editar estado de combate',()=>{
 const draft=drafts.assassins,a=new Arena(map,mask,{seed:24,draft});
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.deepEqual(a.units.map(u=>[u.id,u.champ,u.summonerSlots]),b.units.map(u=>[u.id,u.champ,u.summonerSlots]));
 assert.deepEqual(a.structures.map(s=>s.hp),b.structures.map(s=>s.hp));
});
test('mecanismo de auditoria não concede vitórias e mantém orçamento de CPU separado do relógio do jogo',()=>{
 const source=readFileSync(new URL('../tools/pacing_match_v452d4_dev24.mjs',import.meta.url),'utf8');
 assert.match(source,/MAX_PROBE_MS/);assert.match(source,/stoppedForComputeBudget/);
 assert.doesNotMatch(source,/a\.ended\s*=\s*true/);
 assert.doesNotMatch(source,/\.hp\s*=\s*0/);
 assert.match(source,/a\.validateInvariants\(\)/);
});
test('auditoria separa 7 Nexus reais de 3 testes interrompidos',()=>{
 const p=JSON.parse(readFileSync(new URL('../docs/QA_EVIDENCE_V452D4_DEV24/pacing_audit.json',import.meta.url),'utf8'));
 assert.equal(p.sampleSize,10);assert.equal(p.completedNexus,7);assert.equal(p.stoppedForComputeBudget,3);
 assert.ok(p.meanSecondsCompleted>0&&p.meanSecondsCompleted<1800);
 assert.ok(p.results.every(r=>r.issues?.length===0));
});
test('os 5 perfis incluem campeões ainda não auditados; paridade não é certificada',()=>{
 assert.equal(drafts.baseline.blue.ADC,'Jinx');
 assert.equal(drafts.scaling.red.MID,'Veigar');
 assert.equal(drafts.assassins.blue.MID,'Zed');
 assert.ok(!('officialCertified' in drafts));
});
console.log(`DEV24 ${pass}/5 PASS`);
