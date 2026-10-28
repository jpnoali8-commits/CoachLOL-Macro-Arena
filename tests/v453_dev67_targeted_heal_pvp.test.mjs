/** V4.5.3-dev67: two authenticated human seats; target-lock and Heal/defensive regression. */
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
let passed=0;
const check=(name,fn)=>{fn();console.log('✓ DEV67 '+name);passed++;};
const eq=(a,b)=>assert.equal(a,b);
for(const team of ['blue','red']){
 const other=team==='blue'?'red':'blue';
 const tmp=mkdtempSync(join(tmpdir(),'coachlol-dev67-'));
 const reg=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:tmp});
 const server=createPvPServerV453Dev47({registry:reg,tickMs:0});
 const addr=await server.listen(0),base=`http://127.0.0.1:${addr.port}`;
 const request=async(path,payload,cookie='')=>{const res=await fetch(base+'/api/'+path,{method:payload===undefined?'GET':'POST',headers:{...(cookie?{cookie}:{}),...(payload===undefined?{}:{'content-type':'application/json',origin:base})},body:payload===undefined?undefined:JSON.stringify(payload)});return {status:res.status,cookie:res.headers.get('set-cookie'),data:await res.json()};};
 try {
  const created=await request('create',{}),blueCookie=created.cookie.split(';')[0];
  const joined=await request('join',{roomId:created.data.roomId}),redCookie=joined.cookie.split(';')[0];
  const cookie=team==='blue'?blueCookie:redCookie,wrong=team==='blue'?redCookie:blueCookie;
  const room=reg.get(created.data.roomId),a=room.arena;
  const own=role=>a.units.find(u=>u.id===team+'_'+role),foe=role=>a.units.find(u=>u.id===other+'_'+role);
  for(const u of a.units){u.autoAttack=false;u.autoFollow=false;u.autoFarm=false;u.autoJungle=false;u.x=.07;u.y=.07;}
  const caster=own('MID'),buddy=own('TOP'),healer=own('ADC'),igniter=own('SUP'),exhauster=own('JG');
  const target=foe('MID'),decoy=foe('ADC');
  caster.x=caster.y=.5;caster.summonerSlots=['heal','flash'];caster.summonerSpell='heal';caster.hp=100;
  igniter.x=igniter.y=.5;igniter.summonerSlots=['ignite','flash'];igniter.summonerSpell='ignite';
  exhauster.x=exhauster.y=.5;exhauster.summonerSlots=['exhaust','smite'];exhauster.summonerSpell='exhaust';
  target.x=target.y=.5;decoy.x=decoy.y=.5;
  check(team+' dois jogadores, cinco unidades e cookies independentes',()=>{eq(room.players.length,2);assert.notEqual(cookie,wrong);eq(a.units.filter(x=>x.team===team).length,5);});
  check(team+' visibilidade inicial do alvo explícito',()=>assert.ok(a.visible(team,target)));
  const wrongHeal=await request('action',{sequence:1,unitId:caster.id,kind:'summoner.queue',payload:{type:'heal'}},wrong);
  check(team+' adversário não controla Curar do outro jogador',()=>eq(wrongHeal.status,409));
  const heal=await request('action',{sequence:1,unitId:caster.id,kind:'summoner.queue',payload:{type:'heal'}},cookie);
  const again=await request('action',{sequence:1,unitId:caster.id,kind:'summoner.queue',payload:{type:'heal'}},cookie);
  check(team+' Curar recebido e replay idempotente',()=>{eq(heal.status,200);assert.deepEqual(heal.data,again.data);eq(caster.hp,100);});
  a.resolveSummonerCasts();
  check(team+' Curar sem outro aliado só cura o conjurador uma vez',()=>{eq(caster.hp,212);assert.ok(caster.healCd>a.gameTime);});
  check(team+' outras unidades não recebem cura a distância',()=>eq(buddy.hp,buddy.maxHp));
  // Normal Heal heals a distinct second ally, including an explicitly selected one.
  healer.x=healer.y=.5;healer.summonerSlots=['heal','flash'];healer.hp=90;
  buddy.x=buddy.y=.5;buddy.hp=100;
  const direct=await request('action',{sequence:2,unitId:healer.id,kind:'summoner.queue',payload:{type:'heal',targetId:buddy.id}},cookie);
  check(team+' Curar aceita segundo aliado explicitamente escolhido',()=>eq(direct.status,200));
  a.resolveSummonerCasts();
  check(team+' duas curas distintas e cooldown do conjurador',()=>{eq(healer.hp,202);eq(buddy.hp,196);assert.ok(healer.healCd>a.gameTime);});
  const beforeCaster=caster.hp;
  buddy.x=buddy.y=.91;healer.hp=70;
  const locked=a.applySummonerHealV453Dev67(healer,buddy,{lockTarget:true});
  check(team+' Curar com aliado explícito distante não muda para outro aliado',()=>{eq(locked.allyId,null);eq(locked.secondary,0);eq(caster.hp,beforeCaster);eq(healer.hp,182);});
  buddy.x=buddy.y=.5;
  const denied=await request('action',{sequence:3,unitId:igniter.id,kind:'summoner.queue',payload:{type:'heal',targetId:target.id}},cookie);
  check(team+' feitiço não equipado não permite atacar ou curar inimigo',()=>assert.notEqual(denied.status,200));
  // Explicit target must never jump to an alternative enemy when it moves out of range.
  const queue=await request('action',{sequence:3,unitId:igniter.id,kind:'summoner.queue',payload:{type:'ignite',targetId:target.id}},cookie);
  check(team+' Incendiar enfileirado para alvo visível',()=>{if(queue.status!==200)console.log('INCENDIAR FAILURE',queue.data);eq(queue.status,200);});
  target.x=target.y=.91;const beforeDecoy=decoy.hp,beforeCd=igniter.igniteCd;
  a.resolveSummonerCasts();
  check(team+' Incendiar não troca de alvo nem gasta CD',()=>{eq(decoy.hp,beforeDecoy);eq(igniter.igniteCd,beforeCd);eq(igniter.queuedSummoner.targetId,target.id);});
  // Return target, then apply direct damage only to the originally requested enemy.
  target.x=target.y=.5;const beforeTarget=target.hp;
  a.resolveSummonerCasts();
  check(team+' Incendiar só atinge alvo original quando ele retorna',()=>{assert.ok(target.hp<beforeTarget);eq(decoy.hp,beforeDecoy);assert.ok(igniter.igniteCd>a.gameTime);eq(igniter.queuedSummoner,null);});
  const secondTarget=foe('TOP');secondTarget.x=secondTarget.y=.5;
  const exhaust=await request('action',{sequence:4,unitId:exhauster.id,kind:'summoner.queue',payload:{type:'exhaust',targetId:secondTarget.id}},cookie);
  check(team+' Exaustão aceita o alvo explícito',()=>eq(exhaust.status,200));
  secondTarget.x=secondTarget.y=.91;const initialExhaust=exhauster.exhaustCd;a.resolveSummonerCasts();
  check(team+' Exaustão não salta para alvo alternativo',()=>{eq(exhauster.exhaustCd,initialExhaust);assert.ok(!(decoy.exhaustUntil>a.gameTime));eq(exhauster.queuedSummoner.targetId,secondTarget.id);});
  secondTarget.x=secondTarget.y=.5;a.resolveSummonerCasts();
  check(team+' Exaustão correta com CD e efeito limitado',()=>{assert.ok(secondTarget.exhaustUntil>a.gameTime);assert.ok(exhauster.exhaustCd>a.gameTime);assert.ok(!(decoy.exhaustUntil>a.gameTime));});
  // Defensive summoners retain the Dev66 CC exceptions and expire normally.
  const ghostCaster=igniter;ghostCaster.summonerSlots=['ghost','barrier'];
  a.applyEffectV41(ghostCaster,'root',{source:target,duration:10,key:'dev67_root'});
  const rootUntil=ghostCaster.rootUntil,moveBefore=a.effectiveMS(ghostCaster);
  const ghostQ=await request('action',{sequence:5,unitId:ghostCaster.id,kind:'summoner.queue',payload:{type:'ghost'}},cookie);
  check(team+' Fantasma enfileirado sob enraizamento',()=>eq(ghostQ.status,200));
  a.resolveSummonerCasts();
  check(team+' Fantasma aumenta velocidade e preserva root',()=>{assert.ok(ghostCaster.ghostCd>a.gameTime);assert.ok(ghostCaster.ghostUntil>a.gameTime);assert.ok(a.effectiveMS(ghostCaster)>moveBefore);eq(ghostCaster.rootUntil,rootUntil);});
  a.applyEffectV41(ghostCaster,'stun',{source:target,duration:4,key:'dev67_stun'});
  const barrierQ=await request('action',{sequence:6,unitId:ghostCaster.id,kind:'summoner.queue',payload:{type:'barrier'}},cookie);
  check(team+' Barreira pode ser conjurada durante stun',()=>eq(barrierQ.status,200));
  const shieldBefore=ghostCaster.shield,hpBefore=ghostCaster.hp;
  a.resolveSummonerCasts();
  check(team+' Barreira concede escudo com cooldown próprio',()=>{assert.ok(ghostCaster.shield>shieldBefore);assert.ok(ghostCaster.barrierCd>a.gameTime);});
  const shieldAmount=ghostCaster.barrierAmount;
  a.damage(ghostCaster,Math.min(shieldAmount,50),target,'true','spell');
  check(team+' Barreira absorve dano antes do HP',()=>{eq(ghostCaster.hp,hpBefore);assert.ok(ghostCaster.barrierAmount<shieldAmount);});
  // Snapshot preserves the pending target exactly; cannot retarget after reconnect.
  const another=own('TOP');another.summonerSlots=['exhaust','flash'];another.exhaustCd=0;
  const queued=await request('action',{sequence:7,unitId:another.id,kind:'summoner.queue',payload:{type:'exhaust',targetId:target.id}},cookie);
  check(team+' segundo Exaustão autoritativo aceito',()=>eq(queued.status,200));
  room.persist();
  const restoredReg=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:tmp});const r=restoredReg.get(room.id);
  check(team+' checkpoint mantém alvo, cooldowns e autorização',()=>{
   assert.ok(r);const rr=r.arena.units.find(x=>x.id===another.id);eq(rr.queuedSummoner.targetId,target.id);
   eq(r.arena.units.find(x=>x.id===igniter.id).igniteCd,igniter.igniteCd);
   assert.equal(r.gateway.seats.get(team==='blue'?'p1':'p2').lastSequence,7);
  });
  const sess=await request('session',undefined,cookie),foreign=await request('session',undefined,wrong);
  check(team+' sessões de ambos veem só suas cinco unidades controláveis',()=>{eq(sess.status,200);eq(foreign.status,200);eq(sess.data.team,team);eq(sess.data.projection.controlledUnitIds.length,5);eq(foreign.data.projection.controlledUnitIds.length,5);});
 }finally{await server.close();rmSync(tmp,{recursive:true,force:true});}
}
console.log('DEV67 '+passed+'/'+passed+' PASS');
