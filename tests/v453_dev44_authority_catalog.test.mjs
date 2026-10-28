import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {AuthoritativeActionsV453Dev44,PLAYER_ACTION_KINDS_V453_DEV44} from '../multiplayer/authoritative_actions_v453_dev44.mjs';
const data=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const make=()=>{
 const a=new Arena(map,mask,{seed:44,draft:{blue:{ADC:'Ezreal',TOP:'Irelia'},red:{ADC:'Ezreal',TOP:'Irelia'}}});
 const seats=[{seatId:'alice',unitId:'blue_ADC'},{seatId:'bob',unitId:'red_ADC'},{seatId:'irene',unitId:'blue_TOP'}];
 return {a,seats,g:new AuthoritativeActionsV453Dev44(a,seats)};
};
let count=0;function test(name,fn){fn();count++;console.log('✓ DEV44 '+name)}
test('registered seats bind to server-authoritative units, not to supplied team',()=>{
 const {g}=make();assert.equal(g.seats.get('alice').team,'blue');assert.equal(g.seats.get('bob').team,'red');
 assert.ok(g.view('alice').units.find(u=>u.id==='blue_ADC'));
 assert.equal(g.view('anonymous'),null);
});
test('seat cannot take another unit or claim another team in client message',()=>{
 const {g,a}=make(),before=checksumV40(a.snapshotV40());
 assert.equal(g.submit('alice',{sequence:1,kind:'order.move',payload:{point:{x:.2,y:.3}},unitId:'red_ADC'}).ok,false);
 assert.equal(g.submit('unknown',{sequence:1,kind:'order.stop',payload:{}}).ok,false);
 assert.equal(checksumV40(a.snapshotV40()),before);
});
test('two human players on opposite teams submit real orders to the same Arena',()=>{
 const {g,a}=make();
 assert.equal(g.submit('alice',{sequence:1,kind:'order.stop',payload:{}}).ok,true);
 assert.equal(g.submit('bob',{sequence:1,kind:'order.stop',payload:{}}).ok,true);
 assert.equal(a.units.find(u=>u.id==='blue_ADC').order.kind,'hold');
 assert.equal(a.units.find(u=>u.id==='red_ADC').order.kind,'hold');
 assert.equal(g.revision,2);
});
test('identical duplicate command is idempotent; changed replay is rejected',()=>{
 const {g,a}=make(),c={sequence:1,kind:'order.stop',payload:{}};
 const first=g.submit('alice',c),snap=checksumV40(a.snapshotV40());
 assert.deepEqual(g.submit('alice',c),first);assert.equal(g.revision,1);
 assert.equal(g.submit('alice',{sequence:1,kind:'order.recall',payload:{}}).reason,'sequencia_reutilizada_com_dados_diferentes');
 assert.equal(checksumV40(a.snapshotV40()),snap);
});
test('out-of-order and invalid messages do not mutate authoritative game state',()=>{
 const {g,a}=make(),base=checksumV40(a.snapshotV40());
 assert.equal(g.submit('alice',{sequence:2,kind:'order.stop',payload:{}}).reason,'sequencia_fora_de_ordem');
 assert.equal(g.submit('alice',{sequence:1,kind:'order.move',payload:{point:{x:2,y:.5}}}).reason,'comando_invalido');
 assert.equal(g.submit('alice',{sequence:1,kind:'action.execute_arbitrary',payload:{}}).reason,'comando_invalido');
 assert.equal(checksumV40(a.snapshotV40()),base);
});
test('authoritative order.move applies strict normalized coordinates',()=>{
 const {g,a}=make();const p={x:.1,y:.9};
 const ack=g.submit('alice',{sequence:1,kind:'order.move',payload:{point:p}});
 assert.equal(ack.ok,true);assert.ok(a.units.find(u=>u.id==='blue_ADC').plan);
 p.x=.7;assert.notEqual(a.units.find(u=>u.id==='blue_ADC').plan.steps[0].point.x,.7);
});
test('failed champion skill does not consume sequence or mana',()=>{
 const {g,a}=make(),u=a.units.find(x=>x.id==='blue_ADC'),mana=u.mana;
 const bad=g.submit('alice',{sequence:1,kind:'skill.targeted',payload:{slot:'W',targetId:'blue_TOP'}});
 assert.equal(bad.ok,false);assert.equal(g.seats.get('alice').lastSequence,0);assert.equal(u.mana,mana);
 assert.equal(g.submit('alice',{sequence:1,kind:'order.stop',payload:{}}).ok,true);
});
test('server phase and ready locks cannot be bypassed with valid client actions',()=>{
 const {g,a}=make(),c={sequence:1,kind:'order.stop',payload:{}};
 a.teams.blue.ready=true;assert.equal(g.submit('alice',c).reason,'fase_bloqueada');
 a.teams.blue.ready=false;a.phase='executing';assert.equal(g.submit('alice',c).reason,'fase_bloqueada');
 a.phase='planning';assert.equal(g.submit('alice',c).ok,true);
});
test('visibility-filtered opponent view cannot include invisible enemy positions',()=>{
 const {g,a}=make();const enemy=a.units.find(x=>x.id==='red_ADC');
 enemy.x=.77;enemy.y=.77;
 a.visible=(team,u)=>u.team===team; // force a closed fog boundary in this test
 const view=g.view('alice');assert.ok(!view.units.some(u=>u.id===enemy.id));
 assert.ok(!('state' in view));assert.ok(!('rngState' in view));assert.ok(!('championProjectilesV453Dev42' in view));
});
test('snapshot + session restore preserve command replay/idempotence',()=>{
 const {g,a,seats}=make();const c={sequence:1,kind:'order.stop',payload:{}};
 assert.equal(g.submit('alice',c).ok,true);
 const snap=a.snapshotV40(),session=g.exportSession();
 const b=Arena.fromSnapshotV40(map,mask,snap),copy=new AuthoritativeActionsV453Dev44(b,seats,{restoredState:session});
 assert.equal(checksumV40(b.snapshotV40()),checksumV40(snap));
 assert.deepEqual(copy.submit('alice',c),g.submit('alice',c));
 assert.equal(copy.submit('bob',c).ok,true);
});
test('repeated seat or duplicate unit ownership fails closed',()=>{
 const {a}=make();
 assert.throws(()=>new AuthoritativeActionsV453Dev44(a,[{seatId:'x',unitId:'blue_ADC'},{seatId:'y',unitId:'blue_ADC'}]));
 assert.throws(()=>new AuthoritativeActionsV453Dev44(a,[{seatId:'x',unitId:'blue_ADC'},{seatId:'x',unitId:'red_ADC'}]));
});
test('real Ezreal Q and Irelia E actions enter the same authoritative Arena as player intents',()=>{
 const {g,a}=make(),ez=a.units.find(u=>u.id==='blue_ADC'),ir=a.units.find(u=>u.id==='blue_TOP');
 a.visible=()=>true;ez.skillRanks.Q=1;ir.skillRanks.E=1;ir.x=.5;ir.y=.5;
 const q=g.submit('alice',{sequence:1,kind:'skill.onhit_target',payload:{slot:'Q',targetId:'red_ADC'}});
 assert.ok(q.ok);assert.deepEqual(ez.order.combo,['Q']);
 const e=g.submit('irene',{sequence:1,kind:'skill.directional',payload:{slot:'E',point:{x:.52,y:.5}}});
 assert.ok(e.ok);assert.equal(ir.queuedDirectional.slot,'E');
});
test('noncertified on-hit kits are rejected instead of silently inheriting Ezreal Q',()=>{
 const {g,a}=make();a.visible=()=>true;const r=g.submit('irene',{sequence:1,kind:'skill.onhit_target',payload:{slot:'R',targetId:'red_ADC'}});
 assert.equal(r.reason,'habilidade_individual_nao_certificada');
});
test('all input actions are an explicit whitelist, never a generic execution shortcut',()=>{
 assert.equal(PLAYER_ACTION_KINDS_V453_DEV44.length,15);
 assert.ok(PLAYER_ACTION_KINDS_V453_DEV44.includes('item.activate')); // dev59: whitelist explicit, não execução genérica
 assert.ok(!PLAYER_ACTION_KINDS_V453_DEV44.includes('performActionV40'));
 assert.ok(!PLAYER_ACTION_KINDS_V453_DEV44.includes('champion.ultimate_steal'));
});
test('coverage audit lists all 173 but none falsely certified full',()=>{
 const report=JSON.parse(fs.readFileSync(new URL('../docs/QA_EVIDENCE_V453_DEV44/champion_coverage_26_21.json',import.meta.url)));
 assert.equal(report.championCount,173);assert.equal(report.fullyCertifiedCount,0);
 for(const key of ['Sylas','Neeko','Viego','Mordekaiser']){
  const c=report.champions.find(v=>v.id===key);assert.ok(c);assert.ok(c.missingSpecialSystems.length);assert.ok(!c.fullyCertified);
 }
 assert.equal(report.champions.find(v=>v.id==='Irelia').slots.E.status,'partial_tested');
});
console.log(`DEV44 ${count}/${count} PASS`);
