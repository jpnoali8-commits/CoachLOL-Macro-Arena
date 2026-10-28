import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,SMITE_CONTEST_RULES_V452D4_DEV9,resolveSimultaneousSmiteV452d4Dev9,resolveNoSmiteObjectiveV452d4Dev9} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
let passed=0;const test=(n,fn)=>{fn();passed++;console.log('✓ DEV9 '+n);};
const setup=(hp=850,blueTier=3,redTier=2)=>{
 const a=new Arena(map,mask,{seed:9981,mode:'bot',roundSeconds:10});
 for(const u of a.units){u.order={kind:'stop'};u.autoAttack=false;u.autoJungle=false;u.autoFollow=false;u.x=.04;u.y=.96;}
 a.gameTime=500;a.phase='executing';a.updateObjectives();
 const c=a.camps.find(c=>c.timerKey==='dragon');assert.ok(c.alive);c.health=hp;
 const b=a.units.find(u=>u.id==='blue_JG'),r=a.units.find(u=>u.id==='red_JG');
 for(const [u,tier] of [[b,blueTier],[r,redTier]]){
  u.junglePet='mosstomper';u.smiteTier=tier;u.smiteDamage=[0,600,1000,1400][tier];u.smiteCharges=2;u.smiteCd=0;u.smiteRecoveries=[];
  u.x=c.x;u.y=c.y;u.order={kind:'objective',targetId:c.id};u.jungleAttackAt=999;
 }
 return {a,c,b,r};
};
test('patch 26.21 usa 600/1000/1400 em 0/15/35 stacks',()=>{
 assert.deepEqual(SMITE_CONTEST_RULES_V452D4_DEV9.tiers,[600,1000,1400]);
 const {a,b}=setup();for(const [tier,power] of [[1,600],[2,1000],[3,1400]]){b.smiteTier=tier;assert.equal(a.smitePower(b),power);}
});
test('arbitragem independente da ordem, 1200 contra 900 no HP 850',()=>{
 for(const impacts of [[{actorId:'red_JG',hit:900},{actorId:'blue_JG',hit:1200}],[{actorId:'blue_JG',hit:1200},{actorId:'red_JG',hit:900}]]){
  assert.equal(resolveSimultaneousSmiteV452d4Dev9(850,impacts).winner?.actorId,'blue_JG');
 }
 assert.equal(resolveSimultaneousSmiteV452d4Dev9(2200,[{actorId:'blue_JG',hit:1200},{actorId:'red_JG',hit:900}]).winner,null);
});
test('dragão contestado abre decisão sem gastar Golpear antes do teclado',()=>{
 const {a,c,b,r}=setup();a.updateObjectives();
 assert.equal(a.pendingDecision?.kind,'smite_contest');assert.equal(a.smiteContestV452d4Dev9.openingHP,850);
 assert.equal(c.health,850);assert.equal(b.smiteCharges,2);assert.equal(r.smiteCharges,2);
});
test('Golpear 1400 do azul vence 1000 do vermelho e concede um dragão',()=>{
 const {a,c,b,r}=setup();a.updateObjectives();
 const action=a.submitSmiteContestV452d4Dev9('blue',b.id,'cast');assert.equal(action.ok,true,JSON.stringify(action));
 assert.equal(a.pendingDecision,null);assert.equal(action.winner.actorId,b.id);assert.equal(b.smiteCharges,1);assert.equal(r.smiteCharges,1);
 a.gameTime++;a.updateObjectives();assert.equal(c.alive,false);assert.equal(c.lastClearTeam,'blue');
 assert.equal(a.teams.blue.dragons.length,1);assert.equal(a.teams.red.dragons.length,0);
 assert.equal(a.objectiveLedgerV44.filter(o=>o.objective==='dragon').length,1);
 assert.equal(a.objectiveLedgerV44.at(-1).smiteActorId,b.id);
});
test('Aguardar dá janela ao bot, sem consumo do Golpear azul',()=>{
 const {a,c,b,r}=setup();a.updateObjectives();
 const res=a.submitSmiteContestV452d4Dev9('blue',b.id,'hold');assert.equal(res.ok,true);
 assert.equal(b.smiteCharges,2);assert.equal(r.smiteCharges,1);
 a.gameTime++;a.updateObjectives();assert.equal(c.lastClearTeam,'red');assert.equal(a.teams.blue.dragons.length,0);
});
test('resposta duplicada e competidor remoto são rejeitados; estado conserva recompensas',()=>{
 const {a,c,b}=setup();a.updateObjectives();
 const s=a.snapshotV40(),re=Arena.fromSnapshotV40(map,mask,s);
 assert.equal(re.pendingDecision?.kind,'smite_contest');assert.equal(re.smiteContestV452d4Dev9.campId,c.id);
 assert.equal(re.submitSmiteContestV452d4Dev9('red','red_JG','cast').ok,false);
 const result=re.submitSmiteContestV452d4Dev9('blue',b.id,'cast');assert.equal(result.ok,true);
 assert.equal(re.submitSmiteContestV452d4Dev9('blue',b.id,'cast').ok,false);
 re.gameTime++;re.updateObjectives();assert.equal(re.objectiveLedgerV44.length,1);
 const rr=Arena.fromSnapshotV40(map,mask,re.snapshotV40());assert.equal(rr.objectiveLedgerV44.length,1);
});
test('sem contestação, o Golpear existente permanece automático',()=>{
 const {a,c,b,r}=setup(350,1,1);r.order={kind:'stop'};r.x=.03;r.y=.96;a.updateObjectives();
 assert.equal(a.pendingDecision,null);assert.equal(c.lastClearTeam,'blue');assert.equal(b.smiteCharges,1);
});
test('sem missão, carga ou em distância inválida não abre a janela',()=>{
 for(const block of ['pet','charges','distance']){
  const {a,c,b}=setup();if(block==='pet')b.junglePet=null;else if(block==='charges')b.smiteCharges=0;else b.x=.02;
  a.updateObjectives();assert.equal(a.pendingDecision,null,block);
 }
});
test('missão real eleva o dano exatamente nos 15 e 35 acúmulos',()=>{
 const {a,b}=setup(5000,1,1);b.jungleTreats=0;b.junglePetStage=1;b.jungleBonusTreats=0;b.jungleNextBonusAt=Infinity;
 for(let i=1;i<=35;i++){
  a.feedJunglePet(b);
  assert.equal(a.smitePower(b),i<15?600:i<35?1000:1400,`stack ${i}`);
 }
 assert.equal(b.jungleTreats,35);
});
test('bot respeita política guardar sem consumir cargas da equipe vermelha',()=>{
 const {a,c,b,r}=setup();r.smitePolicy={mode:'hold',rules:[]};a.updateObjectives();
 const x=a.submitSmiteContestV452d4Dev9('blue',b.id,'cast');assert.equal(x.ok,true);
 assert.equal(r.smiteCharges,2);a.gameTime++;a.updateObjectives();
 assert.equal(c.lastClearTeam,'blue');assert.equal(a.objectiveLedgerV44.length,1);
});

// Extension: no Smite on either jungler -> seeded, team-size-weighted final
// tick only; the early turns remain ordinary objective/team combat.
const pitSetup=(hp,blueCount,redCount,withPets=false)=>{
 const {a,c,b,r}=setup(hp,1,1);
 const roster={blue:a.units.filter(u=>u.team==='blue').sort((u,v)=>(u.role==='JG'?-1:1)-(v.role==='JG'?-1:1)),red:a.units.filter(u=>u.team==='red').sort((u,v)=>(u.role==='JG'?-1:1)-(v.role==='JG'?-1:1))};
 for(const [team,count] of [['blue',blueCount],['red',redCount]])for(const [i,u] of roster[team].entries()){
  if(i>=count){u.x=.04;u.y=.96;u.order={kind:'stop'};continue;}
  u.x=c.x+.0003*i;u.y=c.y+.0003*i;u.awaitingShop=false;
  u.order=i===0?{kind:'objective',targetId:c.id}:{kind:'stop'};
  u.jungleAttackAt=0;
  if(!withPets){u.junglePet=null;u.smiteCharges=0;u.smiteCd=99999;}
 }
 c.health=hp;
 return {a,c,b,r};
};
test('0 Smite dos dois lados: não abre overlay; não sorteia antes do tick letal',()=>{
 const {a,c}=pitSetup(9000,3,2);
 a.updateObjectives();assert.equal(a.pendingDecision,null);assert.equal(c.alive,true);
 assert.equal(a.objectiveLedgerV44.filter(x=>x.objective==='dragon').length,0);
 assert.equal(c.health<9000,true);
});
test('0 Smite no último tick: pesos refletem 4 jogadores x 1, um dragão e nenhum Smite fictício',()=>{
 const {a,c}=pitSetup(55,4,1);
 a.updateObjectives();assert.equal(a.pendingDecision,null);assert.equal(c.alive,false);
 const l=a.objectiveLedgerV44.find(x=>x.objective==='dragon');assert.ok(l);
 assert.deepEqual([l.noSmitePitRoll?.blue,l.noSmitePitRoll?.red],[4,1]);
 assert.equal(l.noSmitePitRoll.blueProbability,.8);
 assert.ok([0,1].includes(Math.floor(l.noSmitePitRoll.roll)));
 assert.equal(l.smiteSecured,false);assert.equal(l.smiteActorId,null);
 assert.equal(a.teams.blue.dragons.length+a.teams.red.dragons.length,1);
 assert.equal(a.objectiveLedgerV44.filter(x=>x.objective==='dragon').length,1);
});
test('sorteio 4x1 é reproduzível por seed e não consome RNG do combate',()=>{
 const x=pitSetup(55,4,1),y=pitSetup(55,4,1);
 const prior=x.a.rng.getState();
 x.a.updateObjectives();y.a.updateObjectives();
 const xlog=x.a.objectiveLedgerV44.find(o=>o.objective==='dragon');
 const ylog=y.a.objectiveLedgerV44.find(o=>o.objective==='dragon');
 assert.equal(xlog.owner,ylog.owner);assert.equal(xlog.noSmitePitRoll.roll,ylog.noSmitePitRoll.roll);
 assert.equal(x.a.rng.getState(),y.a.rng.getState());
 const s=x.a.snapshotV40(),back=Arena.fromSnapshotV40(map,mask,s);
 assert.deepEqual(back.objectiveLedgerV44.at(-1).noSmitePitRoll,xlog.noSmitePitRoll);
});
test('sorteio ponderado tem probabilidade aproximada 80/20 em várias seeds',()=>{
 let blue=0;for(let seed=1;seed<=500;seed++)if(resolveNoSmiteObjectiveV452d4Dev9(seed,'dragon',1,500,4,1).winner==='blue')blue++;
 assert.ok(blue>340&&blue<450,`blue=${blue}`);
});

test('uma equipe com Golpear disponível não abre disputa D/F nem ativa sorteio',()=>{
 const {a,c,b,r}=pitSetup(55,2,2);
 b.junglePet='mosstomper';b.smiteCharges=1;b.smiteCd=0;b.smiteTier=1;
 a.updateObjectives();assert.equal(a.pendingDecision,null);assert.equal(c.alive,false);
 const l=a.objectiveLedgerV44.find(o=>o.objective==='dragon');assert.equal(l.owner,'blue');assert.equal(l.noSmitePitRoll,null);
 assert.equal(l.smiteSecured,true);assert.equal(b.smiteCharges,0);assert.equal(r.smiteCharges,0);
});
test('ambos têm pet mas Golpear está em recarga: sem overlay, decide presença ponderada',()=>{
 const {a,c,b,r}=pitSetup(55,3,2,true);
 b.smiteCharges=2;r.smiteCharges=2;b.smiteCd=9999;r.smiteCd=9999;
 a.updateObjectives();assert.equal(a.pendingDecision,null);assert.equal(c.alive,false);
 const l=a.objectiveLedgerV44.find(o=>o.objective==='dragon');assert.equal(l.noSmitePitRoll.blueProbability,.6);
 assert.equal(b.smiteCharges,2);assert.equal(r.smiteCharges,2);
});
const epicSetup=(kind,withSmites=false)=>{
 const a=new Arena(map,mask,{seed:9981,mode:'bot',roundSeconds:10});
 for(const u of a.units){u.order={kind:'stop'};u.autoAttack=false;u.autoJungle=false;u.autoFollow=false;u.x=.04;u.y=.96;}
 a.gameTime=kind==='voidgrubs'?500:kind==='herald'?950:1400;a.phase='executing';a.updateObjectives();
 const c=a.camps.find(x=>x.timerKey===kind);assert.ok(c?.alive,kind);
 if(kind==='voidgrubs'){
  const grub=c.grubsV45.find(x=>x.alive);grub.hp=55;c.health=c.grubsV45.filter(x=>x.alive).reduce((s,g)=>s+g.hp,0);
 }else c.health=55;
 const b=a.units.find(u=>u.id==='blue_JG'),r=a.units.find(u=>u.id==='red_JG');
 for(const u of [b,r]){
  u.x=c.x;u.y=c.y;u.awaitingShop=false;u.order={kind:'objective',targetId:c.id};u.jungleAttackAt=0;
  u.junglePet=withSmites?'mosstomper':null;u.smiteCharges=withSmites?2:0;u.smiteCd=0;u.smiteRecoveries=[];
 }
 return {a,c,b,r};
};
test('sem Golpear: Barão e Arauto usam captura ponderada no último tick',()=>{
 for(const kind of ['herald','baron']){
  const {a,c}=epicSetup(kind);a.updateObjectives();assert.equal(c.alive,false,kind);
  const event=a.objectiveLedgerV44.find(x=>x.objective===kind);assert.ok(event?.noSmitePitRoll,kind);
  assert.deepEqual([event.noSmitePitRoll.blue,event.noSmitePitRoll.red],[1,1]);
 }
});
test('sem Golpear: Vastilarva individual tem dono único decidido por presença',()=>{
 const {a,c}=epicSetup('voidgrubs');const before=c.grubsV45.filter(g=>g.alive).length;
 a.updateObjectives();assert.equal(a.pendingDecision,null);
 const events=a.objectiveLedgerV44.filter(e=>e.objective==='voidgrub_individual');
 assert.equal(events.length,1);assert.equal(before-c.grubsV45.filter(g=>g.alive).length,1);
 assert.equal(events[0].noSmitePitRoll.blueProbability,.5);
 assert.equal(a.teams.blue.voidgrubs+a.teams.red.voidgrubs,1);
});
test('com Golpear: Vastilarva final abre janela e Golpear mais forte vence somente uma',()=>{
 const {a,c,b,r}=epicSetup('voidgrubs',true);b.smiteTier=3;r.smiteTier=2;
 a.updateObjectives();assert.equal(a.pendingDecision?.kind,'smite_contest');
 const q=a.submitSmiteContestV452d4Dev9('blue',b.id,'cast');assert.equal(q.ok,true);
 a.gameTime++;a.updateObjectives();const log=a.objectiveLedgerV44.filter(e=>e.objective==='voidgrub_individual');
 assert.equal(log.length,1);assert.equal(log[0].owner,'blue');assert.equal(log[0].smiteSecured,true);
 assert.equal(b.smiteCharges,1);assert.equal(r.smiteCharges,1);
});

test('Golpear disponível em ambos: Arauto e Barão só abrem disputa no HP executável',()=>{
 for(const kind of ['herald','baron']){
  const {a,c,b,r}=epicSetup(kind,true);b.smiteTier=3;r.smiteTier=2;
  c.health=2200;a.updateObjectives();assert.equal(a.pendingDecision,null,kind);
  // A execução normal do turno pode reduzir HP; controlamos o último turno.
  c.health=850;a.updateObjectives();assert.equal(a.pendingDecision?.kind,'smite_contest',kind);
  const response=a.submitSmiteContestV452d4Dev9('blue',b.id,'cast');assert.equal(response.ok,true,kind);
  a.gameTime++;a.updateObjectives();assert.equal(c.lastClearTeam,'blue',kind);
  assert.equal(a.objectiveLedgerV44.filter(e=>e.objective===kind).length,1,kind);
 }
});

console.log(`V4.5.2d-4-dev9: ${passed}/20 PASS`);
