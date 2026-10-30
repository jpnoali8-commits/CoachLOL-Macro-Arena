/** M45 B02 Skills S04: runtime precedence witness for both PvP seats.
 * Snapshot/dispatch only; does not certify champion gameplay or Rust parity.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453,abilityRule,
 M16_MECHANIC_KITS,FORM_KITS_V453_M14,M44_B07_KITS_V453,
 M44_B09_KITS_V453,M44_B09_GNAR_MEGA_V453,M44_B13B_KITS_V453,
 M44_B13A_KITS_V453,CHAMPION_SPELL_RULES_V382,kitSpellV42
} from '../../../../engine.mjs';
const load=x=>JSON.parse(readFileSync(new URL('../../../../data/'+x,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const slots=['Q','W','E','R'];
let seats=0,assertions=0;
const check=(a,b,msg)=>{assert.strictEqual(a,b,msg);assertions++};
for(const team of ['blue','red']){
 const opponent=team==='blue'?'red':'blue';
 const arena=new Arena(map,mask,{seed:450204,mode:'pvp',
   draft:{[team]:{MID:'Nidalee'},[opponent]:{MID:'Elise'}}});
 const own=arena.units.find(u=>u.id===team+'_MID');
 const enemy=arena.units.find(u=>u.id===opponent+'_MID');
 check(own.team,team,'own seat');check(enemy.team,opponent,'enemy seat');
 own.boardFormV453M14='human';
 check(m44B14DOriginalBoardRuleV453('Nidalee','W',own),
  M16_MECHANIC_KITS.Nidalee.W,'human bushwhack');
 own.boardFormV453M14='cougar';
 check(m44B14DOriginalBoardRuleV453('Nidalee','W',own),
  FORM_KITS_V453_M14.Nidalee.cougar.W,'cougar pounce (not trap)');
 for(const form of ['human','spider']){
  enemy.boardFormV453M14=form;
  for(const slot of slots)check(m44B14DOriginalBoardRuleV453('Elise',slot,enemy),
   FORM_KITS_V453_M14.Elise[form][slot], 'Elise '+form+' '+slot);
 }
 for(const form of ['human','dragon']){
  const unit={champ:'Shyvana',boardFormV453M14:form};
  check(m44B14DOriginalBoardRuleV453('Shyvana','E',unit),
   M44_B13B_KITS_V453.Shyvana.E,'Shyvana E owner branch '+form);
 }
 const gnar={champ:'Gnar'};
 for(const slot of slots){
  check(m44B14DOriginalBoardRuleV453('Gnar',slot,gnar,true),
   M44_B09_GNAR_MEGA_V453[slot],'Gnar Mega '+slot);
  const mini=slot==='Q'?M44_B07_KITS_V453.Gnar.Q:M44_B09_KITS_V453.Gnar[slot];
  check(m44B14DOriginalBoardRuleV453('Gnar',slot,gnar,false),
   mini,'Gnar Mini '+slot);
 }
 check(m44B14DOriginalBoardRuleV453('Nami','W'),
  M44_B13A_KITS_V453.Nami.W,'Nami authored rule beats legacy adapter');
 for(const slot of ['Q','E']){
  const u={champ:'Irelia',range:.025,skillRanks:{Q:5,E:5}};
  check(abilityRule(u,slot),kitSpellV42('Irelia',slot),
   'V42 precedes V382 in general abilityRule '+slot);
  assert.notStrictEqual(abilityRule(u,slot),CHAMPION_SPELL_RULES_V382.Irelia[slot]);
  assertions++;
 }
 const snap=arena.snapshotV40();
 check(checksumV40(snap),checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()),
   'PvP seat mirrored stable snapshot');
 seats++;
}
assert.equal(seats,2);
console.log('M45_SKILLS_PRECEDENCE '+seats+'/2 blue/red dispatch witnesses PASS; assertions='+assertions);
