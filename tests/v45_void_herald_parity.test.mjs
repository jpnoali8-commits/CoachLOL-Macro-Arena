import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Arena,OBJECTIVE_RULES_V45,checksumV40} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const create=()=>new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:45,mode:'manual',roundSeconds:10});
const setup=(type,time)=>{const a=create();for(const u of a.units){u.order={kind:'stop'};u.autoAttack=false;u.autoJungle=false;u.x=.05;u.y=.95;}a.phase='executing';a.gameTime=time;a.updateObjectives();const c=a.camps.find(c=>c.timerKey===type);assert.ok(c.alive);return {a,c};};
const hero=(a,team='blue')=>a.units.find(u=>u.id===team+'_JG');
const place=(u,c)=>{u.x=c.x;u.y=c.y;u.order={kind:'objective',targetId:c.id};u.ad=60000;};
const hit=(a,c,t)=>{a.gameTime=t;a.updateObjectives();};
const test=(name,fn)=>{fn();console.log('✓ V4.5 '+name);};

test('três barras individuais sem dano excedente transferido',()=>{
 const {a,c}=setup('voidgrubs',480),u=hero(a);place(u,c);assert.equal(c.grubsV45.length,3);
 hit(a,c,482);assert.equal(c.grubsV45.filter(g=>g.alive).length,2);
 assert.equal(a.teams.blue.voidgrubs,1);assert.equal(c.alive,true);
 hit(a,c,484);assert.equal(c.grubsV45.filter(g=>g.alive).length,1);
 hit(a,c,486);assert.equal(c.alive,false);assert.equal(a.teams.blue.voidgrubs,3);
 assert.equal(u.gold,500+90);assert.equal(a.objectiveLedgerV44.filter(x=>x.objective==='voidgrub_individual').length,3);
});

test('contestação pode dividir 1/2 stacks entre equipes e revelar só encerramento público',()=>{
 const {a,c}=setup('voidgrubs',480),b=hero(a),r=hero(a,'red');place(b,c);hit(a,c,482);
 b.order={kind:'stop'};b.x=.05;b.y=.95;place(r,c);
 hit(a,c,484);hit(a,c,486);
 assert.equal(a.teams.blue.voidgrubs,1);assert.equal(a.teams.red.voidgrubs,2);
 assert.equal(c.lastClearTeam,'red');
 assert.ok(a.perspective('red').objectiveLedger.every(l=>l.owner==='red'));
 assert.equal(a.perspective('red').objectiveLedger.length,2);
 assert.ok(a.events.some(e=>e.public&&e.text?.includes('Azul 1/3')));
});

test('Golpear atinge só uma Vastilarva, não todo o grupo',()=>{
 const {a,c}=setup('voidgrubs',480),u=hero(a);place(u,c);
 u.junglePet='mosstomper';u.smiteTier=3;u.smiteCharges=2;u.smiteRecoveries=[];u.smiteCd=0;
 for(const g of c.grubsV45)g.hp=800;
 c.health=2400;u.ad=0;u.jungleAttackAt=800;
 hit(a,c,481);
 assert.equal(a.teams.blue.voidgrubs,1);assert.equal(c.grubsV45.filter(g=>g.alive).length,2);
 assert.equal(u.smiteCharges,1);
});

test('queima de torres por stacks e Voidmite somente no terceiro stack',()=>{
 const a=create(),b=hero(a);const s=a.structures.find(st=>st.team==='red'&&st.type==='tower'&&st.id.endsWith('_t1'));
 assert.ok(s&&a.structureVulnerable(s));
 for(const count of [1,2,3]){
  a.teams.blue.voidgrubs=count;a.gameTime+=20;b.voidmiteNextV45=0;
  s.hp=s.maxHp;const old=s.hp;
  a.damage(s,40,b,'physical','basic');assert.ok(a.structureBurnV45[s.id]);
  assert.equal(a.voidmiteSiegesV45.length,count===3?1:0);
  a.gameTime+=1;a.advanceObjectivesV45();assert.ok(s.hp<old-25,'burn should cause additional damage');
  if(count===3)assert.equal(a.voidmiteSiegesV45.length,1);
  a.voidmiteSiegesV45=[];
 }
});

test('Arauto deixa olho, só a equipe vencedora pode coletar em alcance',()=>{
 const {a,c}=setup('herald',900),b=hero(a),r=hero(a,'red');place(b,c);hit(a,c,902);
 assert.equal(c.alive,false);assert.equal(a.heraldEyeV45.owner,'blue');
 place(r,c);assert.equal(a.pickupHeraldEyeV45(r.id).ok,false);
 assert.equal(a.pickupHeraldEyeV45(b.id).ok,true);
 assert.equal(b.trinket,'herald_eye');assert.equal(b.heraldEyeExpiresAtV45,1142);
});

test('invocação consome olho, restaura trinket, mercenário causa dano a torre',()=>{
 const {a,c}=setup('herald',900),b=hero(a);place(b,c);hit(a,c,902);a.pickupHeraldEyeV45(b.id);
 const out=a.summonHeraldV45(b.id);assert.equal(out.ok,true);
 assert.notEqual(b.trinket,'herald_eye');assert.equal(a.summonHeraldV45(b.id).ok,false);
 const merc=a.heraldMercenariesV45[0],target=a.structures.filter(st=>st.team==='red'&&st.type==='tower'&&a.structureVulnerable(st))[0];
 merc.x=target.x;merc.y=target.y;const old=target.hp;a.gameTime=903;a.advanceObjectivesV45();
 assert.ok(target.hp<old);assert.equal(merc.charges,1);
});

test('Olho expira após 240 segundos de jogo e trinket original retorna',()=>{
 const {a,c}=setup('herald',900),b=hero(a);place(b,c);hit(a,c,902);a.pickupHeraldEyeV45(b.id);
 const original=b.previousTrinketV45;a.gameTime=1142;a.advanceObjectivesV45();
 assert.equal(b.trinket,original);assert.equal(a.summonHeraldV45(b.id).ok,false);
});

test('snapshot conserva estados parciais de Vastilarvas e olho do Arauto',()=>{
 const {a,c}=setup('voidgrubs',480),b=hero(a);place(b,c);hit(a,c,482);
 const snap=a.snapshotV40(),restored=Arena.fromSnapshotV40(a.map,a.mask,snap);
 assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));
 assert.equal(restored.camps.find(c=>c.timerKey==='voidgrubs').grubsV45.filter(g=>g.alive).length,2);
 const h=setup('herald',900),u=hero(h.a);place(u,h.c);hit(h.a,h.c,902);h.a.pickupHeraldEyeV45(u.id);
 const second=Arena.fromSnapshotV40(h.a.map,h.a.mask,h.a.snapshotV40());
 assert.equal(second.units.find(v=>v.id===u.id).trinket,'herald_eye');
 assert.equal(second.summonHeraldV45(u.id).ok,true);
});

test('Voidmites da cova surgem por larva viva, atacam e expiram; matá-los não dá ouro',()=>{
 const {a,c}=setup('voidgrubs',480),u=hero(a);place(u,c);u.ad=10;
 hit(a,c,481);assert.equal(c.leashState,'engaged');
 const before=u.hp;a.advanceNeutralMitesV45(c);
 assert.equal(c.neutralMitesV45.length,12,'4 filhotes por Vastilarva viva');
 const mite=c.neutralMitesV45[0],gold=u.gold;
 a.gameTime=482;a.advanceNeutralMitesV45(c);assert.ok(u.hp<before,'filhotes causam dano');
 u.attackAt=0;const result=a.hitNeutralMiteV45(u.id,c.id,mite.id);
 assert.equal(result.ok,true);assert.equal(u.gold,gold);
 a.gameTime=488;a.advanceNeutralMitesV45(c);
 assert.equal(c.neutralMitesV45.length,0,'expiram após seis segundos');
});

test('segurança: esconder poço mantém identidades e HP das três larvas privados',()=>{
 const {a,c}=setup('voidgrubs',480),b=hero(a);place(b,c);hit(a,c,482);
 const red=a.perspective('red').camps.find(x=>x.id===c.id);
 if(red.unknown){assert.equal(red.grubsV45,undefined);assert.equal(red.health,undefined);}
 const journal=a.perspective('red').objectiveLedger;
 assert.equal(journal.some(x=>x.owner==='blue'),false);
});

test('Node e navegador compartilham as mesmas funções de objetivos',()=>{
 const code=readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8'),context={window:{}};
 vm.runInNewContext(code,context,{timeout:5000});
 assert.equal(context.window.CoachArena.OBJECTIVE_RULES_V45.voidgrubs.count,3);
 assert.equal(typeof context.window.CoachArena.Arena.prototype.summonHeraldV45,'function');
});
console.log('11 contratos V4.5 aprovados');
