/** Auditoria PvP mecânica em duas equipes: ambas confirmam turnos, os
 * campeões ficam em HOLD sem automação. Isola minions/torres, sem afirmar
 * teste de 2 clientes humanos, rede, draft ou IA estratégica. */
import {Arena} from '../engine.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),masks=read('masks_128.json');
const horizon=Number(process.argv[2]||900),results=[];
for(const seed of [26,42]){
 const a=new Arena(map,masks,{seed,mode:'pvp',roundSeconds:10});
 for(const u of a.units){u.order={kind:'hold',spell:'none'};u.explicitOrder=true;u.autoFollow=false;u.autoJungle=false;u.autoAttack=false;u.autoFarm=false;}
 let ticks=0,rounds=0,maxOverlap=0,maxConstrained=0,maxInvalid=0,maxMismatch=0,pvpSamples=0,maxEngaged=0;
 const issues=[];
 while(a.gameTime<horizon&&!a.ended){
  if(a.pendingDecision){issues.push(`unexpected decision t=${a.gameTime}: ${a.pendingDecision.kind}`);break;}
  if(a.executionRemaining>0){const before=a.gameTime;a.continueExecution(10);ticks+=a.gameTime-before;}
  else{a.lock('blue');a.lock('red');const r=a.playTurn({autoStarter:false});if(!r.ok){issues.push('playTurn '+JSON.stringify(r));break;}rounds++;}
  if(a.gameTime>300&&a.gameTime%30===0){
   const p=a.pvpMinionEngagementAuditV453Dev58();pvpSamples++;maxEngaged=Math.max(maxEngaged,p.engaged);
   maxOverlap=Math.max(maxOverlap,p.footprints.overlaps.length);maxConstrained=Math.max(maxConstrained,p.footprints.constrained);
   maxInvalid=Math.max(maxInvalid,p.invalid.length);maxMismatch=Math.max(maxMismatch,p.focusMismatch.length);
   const v=a.validateInvariants();if(v.length){issues.push(`t=${a.gameTime}: ${v.slice(0,5).join(' / ')}`);break;}
  }
  if(rounds>200){issues.push('loop guard');break;}
 }
 const report={seed,mode:'pvp_two_teams_hold_no_bot_orders',seconds:a.gameTime,ended:a.ended,winner:a.winner,rounds,ticks,
  csMid:a.units.filter(u=>u.role==='MID').map(u=>({team:u.team,cs:u.cs})),structuresDestroyed:a.structures.filter(s=>!s.alive).length,
  minionDeaths:a.farmTelemetryV452?.events?.length||0,waves:a.waveIndex,pvpSamples,maxEngaged,maxOverlap,maxConstrained,maxInvalid,maxMismatch,issues};
 results.push(report);console.log(JSON.stringify(report));
}
writeFileSync(new URL('../docs/QA_EVIDENCE_V453_DEV58/pvp_minions_2seeds.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
if(results.some(r=>r.issues.length||r.seconds<horizon&&!r.ended||r.maxOverlap>0||r.maxInvalid>0||r.maxMismatch>0))process.exitCode=1;
