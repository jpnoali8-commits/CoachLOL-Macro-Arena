import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Arena,KIT_PATCH_V42,CHAMPION_KITS_V42,kitSpellV42,abilityRule,skillshotHitsV42,areaHitsV42,growthAtLevelV42} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const fresh=()=>new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:42,roundSeconds:10});
const u=(a,id)=>a.units.find(v=>v.id===id);
const t=(label,test)=>{test();console.log('✓ V4.2 '+label)};

t('Manifestos patchados com maturidade explícita; kits não certificados como completos',()=>{
 assert.equal(KIT_PATCH_V42,'26.21');assert.equal(CHAMPION_KITS_V42.Nami.certification,'partial');
 assert.equal(CHAMPION_KITS_V42.Lux.certification,'partial');
 assert.equal(CHAMPION_KITS_V42.Vex.certification,'partial');
 assert.equal(CHAMPION_KITS_V42.Jinx.certification,'data_only');
 assert.equal(CHAMPION_KITS_V42.Nami.spells.E.implemented,'prototype');
 assert.equal(kitSpellV42('Nami','E').charges,3);
 for(const [ch,kit] of Object.entries(CHAMPION_KITS_V42))assert.equal(kit.patch,KIT_PATCH_V42,ch);
});
t('Stats base e crescimento para cinco campeões auditados sem AP fantasma por nível',()=>{
 const a=fresh(),cases=[['Jinx','blue_ADC',610,260,59,26,33,325],['Nami','blue_SUP',560,365,54,29,30,335],['Ahri','blue_MID',590,418,53,21,30,330]];
 for(const [champ,id,hp,mana,ad,armor,mr,ms] of cases){const c=u(a,id);c.champ=champ;
  // Recriar unidades com escolhas canônicas para conferir os atributos efetivamente carregados.
  const picks={blue:{},red:{}};picks.blue[c.role]=champ;
  const b=new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:42,roundSeconds:10,draft:picks});
  const v=u(b,id);assert.equal(v.hp,hp,champ+' HP');assert.equal(v.mana,mana,champ+' MP');assert.equal(v.ad,ad);assert.equal(v.ap,0);assert.equal(v.armor,armor);assert.equal(v.mr,mr);assert.equal(v.moveSpeed,ms);
  v.xp=1e7;b.gainXP(v,0);assert.equal(v.ap,0,champ+' AP não escala sem itens');
 }
 for(const [champ,role,hp,mana,ad,ar,mr,ms] of [['Vex','MID',590,490,54,23,28,335],['Lux','MID',580,440,54,21,30,330]]){
  const b=new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:42,roundSeconds:10,draft:{blue:{[role]:champ}}});
  const v=u(b,'blue_'+role);assert.equal(v.hp,hp);assert.equal(v.mana,mana);assert.equal(v.ad,ad);assert.equal(v.ap,0);assert.equal(v.armor,ar);assert.equal(v.mr,mr);assert.equal(v.moveSpeed,ms);
 }
});
t('Database V4.2 exporta stats nível 1–18 com fontes por patch para cinco campeões',()=>{
 const registry=data('champion_stats_v42.json');assert.equal(registry.patch,KIT_PATCH_V42);
 assert.equal(Object.keys(registry.champions).length,5);
 for(const [ch,entry] of Object.entries(registry.champions)){
  assert.equal(entry.perLevel.length,18,ch);assert.equal(entry.perLevel[0].level,1);
  assert.equal(entry.perLevel[0].hp,entry.base.hp);assert.equal(entry.perLevel[0].ap,0);
  assert.ok(entry.perLevel[17].hp>entry.perLevel[0].hp);
  assert.ok(entry.source.startsWith('https://wiki.leagueoflegends.com/en-us/'));
 }
});
t('Range e custos Q Nami, Q/E Lux, R Vex com fontes e ranks individuais',()=>{
 const a=fresh(),n=u(a,'blue_SUP');n.champ='Nami';
 assert.equal(abilityRule(n,'Q').range,850);assert.equal(abilityRule(n,'W').range,725);
 n.champ='Lux';assert.equal(abilityRule(n,'Q').range,1300);assert.equal(abilityRule(n,'Q').maxHits,2);
 assert.equal(abilityRule(n,'E').range,1100);assert.equal(abilityRule(n,'E').duration,5);
 n.champ='Vex';assert.deepEqual(abilityRule(n,'R').rangeByRank,[2000,2500,3000]);
});
t('Geometria determinística: linha com hit cap, largura e ordem',()=>{
 const base={x:.50,y:.50},dir={x:.7,y:.5};
 const opponents=[{id:'c',x:.56,y:.50},{id:'b',x:.52,y:.50},{id:'a',x:.51,y:.5},{id:'z',x:.525,y:.515}];
 assert.deepEqual(skillshotHitsV42(base,dir,opponents,{range:1200,width:140,maxHits:2}).map(x=>x.id),['a','b']);
 assert.deepEqual(areaHitsV42(base,opponents,350).map(x=>x.id),['a','b']);
});
t('Nami Q em ponto longe aguarda aproximação sem custar mana e depois aplica stun',()=>{
 const a=fresh(),n=u(a,'blue_SUP'),enemy=u(a,'red_MID');n.champ='Nami';n.skillRanks.Q=1;n.mana=300;
 n.x=.42;n.y=.62;enemy.x=.49;enemy.y=.59;enemy.manualMoveHold=true;enemy.order={kind:'hold'};enemy.autoFollow=false;
 const point={x:enemy.x,y:enemy.y};const before=n.mana;
 assert.ok(a.mapDistance(n,point)>850);
 const order=a.queueKitSkillV42('blue',n.id,'Q',point);assert.ok(order.ok,order.reason);
 a.resolveKitSkillsV42();assert.equal(n.mana,before);assert.equal(n.skillCds.Q,0);
 a.finishPreparation();let distance=a.mapDistance(n,point);
 for(let i=0;i<15;i++){a.gameTime++;a.reviveAndMove();a.resolveKitSkillsV42();if(!n.pendingKitCastV42)break;}
 assert.ok(!n.pendingKitCastV42,'concluiu cast depois da aproximação');
 assert.ok(a.mapDistance(n,point)<=850,'cast ocorreu dentro do range');
 assert.ok(a.mapDistance(n,point)<distance,'percorreu caminho');
 assert.ok(n.mana<before-50&&n.mana>=before-60,'consumiu mana só ao cast, apesar da regeneração durante a aproximação');assert.ok(n.skillCds.Q>a.gameTime);
 assert.ok(a.effectResolverV41().has(enemy,'stun'));
});
t('Lux Q atinge no máximo dois inimigos em ordem sem bloquear o terceiro',()=>{
 const a=fresh(),lux=u(a,'blue_SUP');lux.champ='Lux';lux.skillRanks.Q=1;
 lux.x=.5;lux.y=.5;const enemies=[u(a,'red_TOP'),u(a,'red_MID'),u(a,'red_ADC')];
 enemies.forEach((v,i)=>{v.x=.515+i*.014;v.y=.5;v.mr=0;v.hp=v.maxHp;});
 const p={x:.57,y:.5};a.visible=()=>true;
 assert.ok(a.queueKitSkillV42('blue',lux.id,'Q',p).ok);
 a.resolveKitSkillsV42();
 assert.equal(enemies[0].hp,enemies[0].maxHp,'Q tem tempo de voo na dev68');
 a.gameTime=1.1;a.advanceChampionProjectilesV453Dev42();
 assert.equal(enemies[0].hp<enemies[0].maxHp,true);
 assert.equal(enemies[1].hp<enemies[1].maxHp,true);
 assert.equal(enemies[2].hp,enemies[2].maxHp);
 assert.ok(a.effectResolverV41().has(enemies[0],'root'));
 assert.equal(lux.mana,lux.maxMana-50);
});
t('Lux E cria zona temporária, desacelera e detona sem novo custo',()=>{
 const a=fresh(),lux=u(a,'blue_SUP'),enemy=u(a,'red_MID');lux.champ='Lux';lux.skillRanks.E=1;
 lux.x=.5;lux.y=.5;enemy.x=.515;enemy.y=.5;enemy.mr=0;
 const center={x:enemy.x,y:enemy.y},initial=lux.mana;
 assert.ok(a.queueKitSkillV42('blue',lux.id,'E',center).ok);
 a.resolveKitSkillsV42();assert.ok(lux.luxZoneV42);assert.equal(lux.mana,initial-70);
 a.gameTime++;a.resolveKitSkillsV42();assert.ok(a.effectResolverV41().has(enemy,'slow'));
 // Recast is an action stage, not an extra spell cast or cooldown reset.
 const e2=a.queueKitSkillV42('blue',lux.id,'E',center);assert.ok(e2.ok,e2.reason);assert.equal(e2.recast,true);
 a.resolveKitSkillsV42();assert.equal(lux.luxZoneV42,null);assert.equal(lux.mana,initial-70);
 assert.ok(enemy.hp<enemy.maxHp);
});
t('Lux Q respeita colisão de minions antes de campeão (limite de 2)',()=>{
 const a=fresh(),lux=u(a,'blue_SUP'),enemy=u(a,'red_MID');lux.champ='Lux';lux.skillRanks.Q=1;
 lux.x=.5;lux.y=.5;enemy.x=.532;enemy.y=.5;enemy.mr=0;enemy.hp=enemy.maxHp;
 for(const [i,x] of [.512,.522].entries())a.minions.push({id:'m_v42_'+i,team:'red',kind:'melee',lane:'mid',x,y:.5,spawnAt:0,hp:150,maxHp:150,mr:0,armor:0});
 assert.ok(a.queueKitSkillV42('blue',lux.id,'Q',{x:.57,y:.5}).ok);
 a.resolveKitSkillsV42();
 a.gameTime=1.1;a.advanceChampionProjectilesV453Dev42();
 assert.ok(a.minions.filter(m=>m.id.startsWith('m_v42')).every(m=>m.hp<m.maxHp));
 assert.equal(enemy.hp,enemy.maxHp,'minions absorvem as duas colisões');
});
t('Spell shield anula dano e controle da Nami Q, consumindo apenas um escudo',()=>{
 const a=fresh(),n=u(a,'blue_SUP'),enemy=u(a,'red_MID');n.champ='Nami';n.skillRanks.Q=1;
 n.x=.5;n.y=.5;enemy.x=.52;enemy.y=.5;
 const eff=a.effectResolverV41();eff.apply(enemy,'spell_shield',{duration:5,source:enemy});
 const hp=enemy.hp;assert.ok(a.queueKitSkillV42('blue',n.id,'Q',{x:enemy.x,y:enemy.y}).ok);
 a.resolveKitSkillsV42();assert.equal(enemy.hp,hp);
 assert.equal(eff.has(enemy,'stun'),false);assert.equal(eff.has(enemy,'spell_shield'),false);
});
t('Vex R primeiro acerto aplica marca e R2 não consome mana novamente',()=>{
 const a=fresh(),v=u(a,'blue_MID'),target=u(a,'red_MID');v.champ='Vex';v.skillRanks.R=1;v.level=6;v.mana=300;
 v.x=.5;v.y=.5;target.x=.56;target.y=.5;target.mr=0;a.visible=()=>true;
 const before=v.mana;assert.ok(a.queueDirectionalSkill('blue',v.id,'R',{x:.65,y:.5}).ok);
 a.resolveDirectionalSkills();assert.equal(v.vexMark??null,null,'Dev69 R1 voa antes do impacto');
 assert.equal(v.mana,before-100);const after=v.mana;
 a.gameTime=.65;a.advanceChampionProjectilesV453Dev42();
 assert.equal(v.vexMark?.targetId,target.id,'Marca somente após impacto temporal');
 assert.ok(a.queueVexRecast('blue',v.id).ok);a.resolveDirectionalSkills();
 assert.equal(v.mana,after);assert.equal(v.vexMark,null);
 assert.ok(v.vexDashV453Dev69,'R2 deve viajar em vez de teleportar');
 const hp=target.hp;a.gameTime=1.1;a.advanceVexShadowDashV453Dev69();
 assert.ok(target.hp<hp,'R2 aplica dano apenas ao chegar');
});
t('Skill não aprendida, sem mana e em CD não entra na fila nem muda recursos',()=>{
 const a=fresh(),lux=u(a,'blue_SUP');lux.champ='Lux';lux.skillRanks.Q=0;
 const point={x:lux.x+.002,y:lux.y};const before=lux.mana;
 assert.equal(a.queueKitSkillV42('blue',lux.id,'Q',point).ok,false);assert.equal(lux.mana,before);
 lux.skillRanks.Q=1;lux.mana=10;assert.equal(a.queueKitSkillV42('blue',lux.id,'Q',point).reason,'mana');
 lux.mana=before;lux.skillCds.Q=100;assert.equal(a.queueKitSkillV42('blue',lux.id,'Q',point).reason,'recarga');
 assert.equal(lux.pendingKitCastV42,undefined);
});
t('Conjuração na fog não publica intenção ao adversário',()=>{
 const a=fresh(),lux=u(a,'blue_SUP');lux.champ='Lux';lux.skillRanks.Q=1;
 const point={x:lux.x+.004,y:lux.y};a.canSeePoint=(team)=>team==='blue';
 assert.ok(a.queueKitSkillV42('blue',lux.id,'Q',point).ok);
 assert.ok(a.actionJournalV40.some(e=>e.kind==='intent'&&e.intentKind==='kit_location'));
 assert.equal(a.journalForV40('red').some(e=>e.kind==='intent'&&e.intentKind==='kit_location'),false);
 a.resolveKitSkillsV42();assert.equal(a.journalForV40('red').some(e=>e.source==='kit_v42'),false);
});
t('Escala de crescimento não linear conserva total no nível 18',()=>{
 const gain=105;let accum=0;for(let level=2;level<=18;level++)accum+=growthAtLevelV42(gain,level);
 assert.ok(Math.abs(accum-gain*17)<.000001);
 assert.ok(growthAtLevelV42(gain,2)<gain);assert.ok(growthAtLevelV42(gain,18)>gain);
});
t('Snapshot V4.0 restaura zonas, ordem de kit e seu estado determinístico',()=>{
 const a=fresh(),lux=u(a,'blue_SUP');lux.champ='Lux';lux.skillRanks.E=1;
 assert.ok(a.queueKitSkillV42('blue',lux.id,'E',{x:lux.x+.002,y:lux.y}).ok);
 a.resolveKitSkillsV42();assert.ok(lux.luxZoneV42);
 const copy=Arena.fromSnapshotV40(a.map,a.mask,a.snapshotV40());
 assert.deepEqual(u(copy,'blue_SUP').luxZoneV42,lux.luxZoneV42);
 a.gameTime+=5;copy.gameTime+=5;a.resolveKitSkillsV42();copy.resolveKitSkillsV42();
 assert.equal(u(copy,'blue_SUP').luxZoneV42,null);assert.deepEqual(a.actionJournalV40,copy.actionJournalV40);
});
t('Browser/Node compatibilidade completa do registry e métodos',()=>{
 const ctx={window:{},structuredClone,TextEncoder,Math,Date,Set,Map};vm.createContext(ctx);
 vm.runInContext(readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8'),ctx);
 const b=ctx.window.CoachArena;
 assert.equal(b.KIT_PATCH_V42,KIT_PATCH_V42);
 assert.equal(b.CHAMPION_KITS_V42.Lux.spells.Q.range,1300);
 assert.equal(typeof b.Arena.prototype.queueKitSkillV42,'function');
 assert.equal(typeof b.Arena.prototype.resolveKitSkillsV42,'function');
});
