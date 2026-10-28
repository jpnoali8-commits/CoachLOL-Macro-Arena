import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Arena,EFFECT_TYPES_V41,checksumV40} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const fresh=()=>new Arena(map,mask,{seed:20261026,roundSeconds:10});
const unit=(a,id)=>a.units.find(x=>x.id===id);
const t=(name,fn)=>{fn();console.log('✓ V4.1 '+name)};

t('Catálogo de 24 efeitos com tipos e bloqueios declarativos',()=>{
 assert.equal(Object.keys(EFFECT_TYPES_V41).length,24);
 for(const [name,v] of Object.entries(EFFECT_TYPES_V41))assert.equal(Array.isArray(v.block),true,name);
});
t('Stun bloqueia movimento, AA, spell; root só movimento; silence só spell',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),o=unit(a,'red_MID'),e=a.effectResolverV41();
 assert.ok(e.apply(v,'stun',{source:o,duration:4}).ok);
 for(const k of ['move','attack','skill'])assert.equal(e.canAct(v,k).ok,false,k);
 e.remove(v,{types:['stun']});assert.ok(e.canAct(v,'skill').ok);
 e.apply(v,'root',{source:o,duration:2});assert.equal(e.canAct(v,'move').ok,false);assert.equal(e.canAct(v,'attack').ok,true);assert.equal(e.canAct(v,'skill').ok,true);
 e.apply(v,'silence',{source:o,duration:2});assert.equal(e.canAct(v,'skill').ok,false);assert.equal(e.canAct(v,'attack').ok,true);
});
t('Tenacidade reduz stun e root mas nunca knockup e suppression',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),o=unit(a,'red_MID'),e=a.effectResolverV41();v.tenacity=50;
 assert.equal(e.apply(v,'stun',{source:o,duration:4}).until,2);
 assert.equal(e.apply(v,'root',{source:o,duration:4}).until,2);
 assert.equal(e.apply(v,'knockup',{source:o,duration:4}).until,4);
 assert.equal(e.apply(v,'suppression',{source:o,duration:4}).until,4);
});
t('Refresh mesma fonte, independente outra; cleanse preserva supressão',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),o=unit(a,'red_MID'),p=unit(a,'red_SUP'),e=a.effectResolverV41();
 const first=e.apply(v,'stun',{source:o,duration:2});
 a.gameTime=1;const again=e.apply(v,'stun',{source:o,duration:5});assert.equal(first.id,again.id);assert.equal(again.until,6);
 assert.notEqual(e.apply(v,'stun',{source:p,duration:3}).id,first.id);
 e.apply(v,'suppression',{source:o,duration:3});
 assert.equal(e.remove(v,{ccOnly:true}),2);assert.ok(e.has(v,'suppression'));
 assert.equal(e.remove(v,{ccOnly:true,includeSuppression:true}),1);assert.equal(e.canAct(v,'move').ok,true);
});
t('CC immunity não bloqueia dano físico e rejeita CC externo',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),o=unit(a,'red_MID'),e=a.effectResolverV41();
 e.apply(v,'cc_immunity',{duration:5,source:v});assert.equal(e.apply(v,'charm',{duration:3,source:o}).reason,'cc_immunity');
 assert.ok(a.damage(v,100,o,'true')>0);
});
t('Escudos físicos/mágicos e comum absorvem em ordem por validade',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),o=unit(a,'red_MID'),e=a.effectResolverV41();
 v.armor=0;v.mr=0;v.shield=0;
 e.apply(v,'shield',{duration:6,power:40,source:v});
 e.apply(v,'physical_shield',{duration:2,power:50,source:v});
 e.apply(v,'magic_shield',{duration:3,power:30,source:v});
 const hp=v.hp;a.damage(v,65,o,'physical');assert.equal(v.hp,hp);assert.equal(e.list(v).find(s=>s.type==='physical_shield').power,0);assert.equal(e.list(v).find(s=>s.type==='shield').power,25);
 a.damage(v,45,o,'magic');assert.equal(v.hp,hp);assert.equal(e.list(v).find(s=>s.type==='magic_shield').power,0);assert.equal(e.list(v).find(s=>s.type==='shield').power,10);
 a.damage(v,25,o,'true');assert.equal(v.hp,hp-15);assert.equal(e.list(v).find(s=>s.type==='magic_shield').power,0);
});
t('Escudo mágico não absorve dano físico; escudo físico não absorve magia',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),o=unit(a,'red_MID'),e=a.effectResolverV41();v.armor=0;v.mr=0;v.shield=0;
 e.apply(v,'magic_shield',{source:v,duration:10,power:80});const hp=v.hp;
 a.damage(v,30,o,'physical');assert.equal(v.hp,hp-30);
 a.damage(v,50,o,'magic');assert.equal(v.hp,hp-30);assert.equal(e.list(v)[0].power,30);
});
t('Invulnerabilidade e estase impedem dano; estase impede casts sem mana',()=>{
 const a=fresh(),v=unit(a,'blue_SUP'),o=unit(a,'red_MID'),e=a.effectResolverV41();v.skillRanks.W=1;
 e.apply(v,'invulnerable',{source:v,duration:2});assert.equal(a.damage(v,100,o,'true'),0);
 assert.ok(a.performActionV40({actorId:v.id,slot:'W'}).ok);
 a.gameTime=1;e.apply(v,'stasis',{source:v,duration:3});
 const before=v.mana;assert.equal(a.performActionV40({actorId:v.id,slot:'W'}).ok,false);assert.equal(v.mana,before);assert.equal(a.damage(v,200,o,'magic'),0);
});
t('Anti-cura 40% corta cura e lifesteal sem alterar dano nem custo',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),o=unit(a,'red_MID'),e=a.effectResolverV41();v.hp=100;
 e.apply(v,'grievous_wounds',{duration:5,source:o});assert.equal(e.heal(v,100,v),60);
 e.remove(v,{types:['grievous_wounds']});assert.equal(e.heal(v,100,v),100);
});
t('DoT e HoT dependem de gameTime e respeitam MR, shield, anti-cura',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),o=unit(a,'red_MID'),e=a.effectResolverV41();v.hp=300;v.mr=0;v.shield=0;
 e.apply(v,'dot',{duration:3,interval:1,power:20,damageType:'magic',source:o});
 e.apply(v,'hot',{duration:3,interval:1,power:10,source:v});
 e.apply(v,'grievous_wounds',{duration:3,source:o});
 for(let sec=1;sec<=3;sec++){a.gameTime=sec;e.advanceTick();}
 assert.equal(v.hp,300-60+22);
 assert.equal(e.list(v).length,0);
});
t('DoT repetido no mesmo segundo não duplica tick',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),e=a.effectResolverV41();v.hp=200;v.mr=0;
 e.apply(v,'dot',{duration:5,interval:1,power:10,source:unit(a,'red_MID')});a.gameTime=1;
 e.advanceTick();e.advanceTick();assert.equal(v.hp,190);
});
t('Blind para ataque básico, não para magia; spell shield consome um spell',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),o=unit(a,'red_MID'),e=a.effectResolverV41();v.mr=0;v.armor=0;
 e.apply(o,'blind',{duration:5,source:v});let hp=v.hp;
 assert.equal(a.damage(v,70,o,'physical','basic'),0);assert.equal(v.hp,hp);
 e.apply(v,'spell_shield',{duration:5,source:v});
 assert.equal(a.damage(v,50,o,'magic','spell'),0);assert.equal(v.hp,hp);
 assert.equal(e.has(v,'spell_shield'),false);
 assert.equal(a.damage(v,50,o,'magic','spell'),50);
});
t('Escudo de feitiço bloqueia um CC e é consumido',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),o=unit(a,'red_MID'),e=a.effectResolverV41();
 e.apply(v,'spell_shield',{source:v,duration:8});
 assert.equal(a.applyCC(o,v,'root',3).reason,'spell_shield');
 assert.equal(e.has(v,'spell_shield'),false);
 assert.ok(a.applyCC(o,v,'root',3).ok);
});
t('Skill em CC não consome recurso, não altera diário de ações',()=>{
 const a=fresh(),v=unit(a,'blue_SUP'),o=unit(a,'red_MID'),e=a.effectResolverV41();v.skillRanks.W=1;
 const before=v.mana,n=a.actionJournalV40.length;
 e.apply(v,'silence',{duration:4,source:o});
 assert.equal(a.performActionV40({actorId:v.id,slot:'W'}).ok,false);assert.equal(v.mana,before);assert.equal(a.actionJournalV40.length,n);
});
t('Sem vazamento: fonte escondida é omitida para vítima, identificada pela própria equipe',()=>{
 const a=fresh(),b=unit(a,'blue_ADC'),r=unit(a,'red_MID');a.canSeePoint=(team,u)=>team===u.team;
 a.applyEffectV41(b,'root',{source:r,duration:3});
 const own=a.effectJournalForV41('blue'),enemy=a.effectJournalForV41('red');
 assert.equal(own.at(-1).sourceId,null);
 assert.equal(enemy.at(-1).sourceId,r.id);assert.equal(enemy.at(-1).targetId,null);
});
t('Snapshot restaura ledger, RNG, sequence e reaplica ticks iguais',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),enemy=unit(a,'red_MID');a.phase='executing';
 a.applyEffectV41(v,'dot',{duration:5,source:enemy,power:4,interval:1});
 const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,mask,JSON.parse(JSON.stringify(snap)));
 assert.equal(checksumV40(a.snapshotV40()),checksumV40(b.snapshotV40()));
 for(let i=0;i<3;i++){a.gameTime++;b.gameTime++;a.effectResolverV41().advanceTick();b.effectResolverV41().advanceTick();}
 assert.equal(checksumV40(a.snapshotV40()),checksumV40(b.snapshotV40()));
});
t('Duas equipes e 1x/2x: duração medida somente por tempo de simulação',()=>{
 const a=fresh(),b=unit(a,'blue_ADC');const e=a.effectResolverV41();
 e.apply(b,'root',{duration:10});
 for(let i=0;i<9;i++){a.gameTime++;e.advanceTick();assert.equal(e.canAct(b,'move').ok,false);}
 a.gameTime=10;e.advanceTick();assert.equal(e.canAct(b,'move').ok,true);
});
t('Core do browser publica EffectResolver e mesmos tipos; métodos de Arena espelhados',()=>{
 const src=readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8');const c={window:{},console};vm.runInNewContext(src,c,{timeout:4000});
 assert.deepEqual(Object.keys(c.window.CoachArena.EFFECT_TYPES_V41).sort(),Object.keys(EFFECT_TYPES_V41).sort());
 for(const name of ['applyEffectV41','effectJournalForV41','effectResolverV41'])assert.equal(typeof c.window.CoachArena.Arena.prototype[name],'function');
});
t('Slow com 40% e resistência de lentidão altera movimento, não escala cooldown',()=>{
 const a=fresh(),v=unit(a,'blue_ADC'),o=unit(a,'red_MID'),e=a.effectResolverV41();
 const normal=a.effectiveMS(v);v.slowResist=25;
 e.apply(v,'slow',{source:o,duration:6,power:40});
 const slowed=a.effectiveMS(v);assert.ok(slowed<normal);assert.ok(slowed>normal*.65);assert.ok(Math.abs(e.slowFraction(v)-.30)<1e-10);
 a.gameTime=6;e.advanceTick();assert.equal(a.effectiveMS(v),normal);
});
t('Incendiar do feitiço mantém DoT antigo, aplica anti-cura e dano verdadeiro',()=>{
 const a=fresh(),caster=unit(a,'blue_MID'),victim=unit(a,'red_MID');
 caster.summonerSpell='ignite';caster.x=.5;caster.y=.5;victim.x=.501;victim.y=.5;a.visible=()=>true;
 a.queueSummoner('blue',caster.id,'ignite',victim.id);a.resolveSummonerCasts();
 assert.ok(a.effectResolverV41().has(victim,'grievous_wounds'));
 assert.ok(a.delayedEffects.some(x=>x.kind==='ignite_dot'));
 const hp=victim.hp;victim.mr=900;victim.armor=900;a.gameTime=1;a.resolveDelayedEffects();assert.equal(hp-victim.hp,13+caster.level*3);
});
