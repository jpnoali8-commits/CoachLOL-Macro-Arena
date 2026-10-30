/**
 * M31 fixed-B01: machine-readable, champion-authored witness and certification debt.
 * This ledger is NOT a substitute for M27 17-dimension certification.
 * One real unique witness is necessary evidence, never sufficient for P+QWER.
 */
import {BOARD_M20_B01_V453} from '../engine.mjs';
import {M27_CERTIFICATION_DIMENSIONS} from './skills_m27_b01_completeness_audit.mjs';
import {writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
export const M31_B01_CHAMPION_WITNESSES=Object.freeze({
 Alistar:{slot:'R',key:'m26AlistarUnbreakable',identity:'Unbreakable Will duration and damage reduction'},
 Braum:{slot:'E',key:'m26BraumDirection',identity:'Unbreakable directional shield orientation'},
 Cassiopeia:{slot:'R',key:'m28CassPetrify',identity:'Petrifying Gaze depends on enemy facing'},
 Corki:{slot:'R',key:'m22Magazine',identity:'Missile Barrage owner magazine'},
 Fizz:{slot:'E',key:'m24FizzLeap',identity:'Playful Trickster temporary untargetability'},
 Galio:{slot:'R',key:'m25GalioEntrance',identity:'Hero Entrance allied anchor delay'},
 Gragas:{slot:'Q',key:'m21Barrel',identity:'Rolling Barrel server-owned detonation fuse'},
 Heimerdinger:{slot:'Q',key:'m28HeimerStock',identity:'Three stored turret charge limits'},
 JarvanIV:{slot:'E',key:'m24FlagDeploy',identity:'Demacian Standard summon and owned banner'},
 Karthus:{slot:'E',key:'m26KarthusToggle',identity:'Defile owned toggle mana upkeep'},
 Kassadin:{slot:'Q',key:'m30KassInterrupt',identity:'Null Sphere hit-only channel interruption'},
 KogMaw:{slot:'E',key:'m28KogOoze',identity:'Void Ooze collision-tested slowing trail'},
 LeeSin:{slot:'E',key:'m26LeeReveal',identity:'Flurry after each real spell and two actual basics'},
 Locke:{slot:'Q',key:'m26LockeNails',identity:'Owner-stacked Soul Nails and interaction'},
 Lucian:{slot:'Q',key:'m30LucianAnchoredQ',identity:'Piercing Light must start from real legal target'},
 Lulu:{slot:'E',key:'m25LuluPixAttach',identity:'Pix companion ally-anchor relocation'},
 MasterYi:{slot:'W',key:'m29YiMeditate',identity:'Meditate finite nontrue-damage reduction'},
 Mel:{slot:'Q',key:'m28MelVolley',identity:'Radiant projectile individual followup collision'},
 Milio:{slot:'E',key:'m29MilioTwoE',identity:'Warm Hugs two stored shield charges'},
 Quinn:{slot:'W',key:'m29QuinnHeightened',identity:'Heightened Senses marks visible Harrier target'},
 Rell:{slot:'W',key:'m31RellDualForm',identity:'Ferromancy starts mounted then alternates crash/mount'},
 Sejuani:{slot:'W',key:'m28SejTwoSwings',identity:'Winter Wrath separates two Frost swings'},
 Seraphine:{slot:'E',key:'m29SeraphineBeatDrop',identity:'Beat Drop slow/root/stun CC ladder'},
 Sett:{slot:'Q',key:'m30SettKnuckle',identity:'Knuckle Down target-max-HP on next two real basics'},
 Shen:{slot:'R',key:'m26ShenChannel',identity:'Stand United delayed allied relocation'},
 Syndra:{slot:'Q',key:'m20OrbSpawn',identity:'Dark Sphere owned persistent orb'},
 TahmKench:{slot:'E',key:'m27TahmGreyHealth',identity:'Thick Skin stored grey health conversion'},
 Urgot:{slot:'W',key:'m27UrgotPurge',identity:'Purge owned repeated target lock'},
 Varus:{slot:'W',key:'m30VarusEmpowerQ',identity:'Blighted Quiver primes charged Q'},
 Vi:{slot:'Q',key:'m29ViCharge',identity:'Vault Breaker charge-dependent range and damage'},
 Viktor:{slot:'Q',key:'m30ViktorEvolution',identity:'Glorious Evolution earned and selected hex upgrades'},
 Xerath:{slot:'R',key:'m22ArtilleryShots',identity:'Rite of the Arcane interruptible artillery'},
 Yunara:{slot:'R',key:'m25YunaraTranscendent',identity:'Transcendent combat form'},
 Zac:{slot:'W',key:'m25ZacGoo',identity:'Unstable Matter creates collected cell blobs'},
 Zilean:{slot:'W',key:'m20Rewind',identity:'Rewind reduces only Q/E cooldowns'}
});
const SLOTS=['Q','W','E','R'];
export function buildM31B01ContractLedger(){
 const names=Object.keys(BOARD_M20_B01_V453).sort();
 if(names.length!==35||names.some(n=>!M31_B01_CHAMPION_WITNESSES[n])||
    Object.keys(M31_B01_CHAMPION_WITNESSES).length!==35)
  throw new Error('M31 fixed B01 individual identity inventory changed');
 const champions=names.map(champion=>{
  const kit=BOARD_M20_B01_V453[champion],
   witness=M31_B01_CHAMPION_WITNESSES[champion];
  if(!kit[witness.slot]?.[witness.key])
   throw new Error('Missing authored witness '+champion+' '+witness.slot+' '+witness.key);
  const QWER=Object.fromEntries(SLOTS.map(slot=>{
   const d=kit[slot];
   return [slot,{
    state:'IMPLEMENTED_PARTIAL_NOT_CERTIFIED',
    shape:d.shape,authoritativeContractKeys:Object.keys(d).filter(k=>
     /^(m1[5-9]|m2[0-9]|m3[0-9]|boardTemporal|boardSummon|transformTo)/.test(k)&&k!=='m20Missing'),
    legacyDebtTag:d.m20Missing||null,
    counterplayVerifiedForThisIndividualSkill:false,
    all17DimensionsCertified:false
   }];
  }));
  const individual={champion,passive:kit.passive,witness,
   witnessQA:'tests/audit/v453_m31_b01_35_identity_witnesses.test.mjs',
   QWER,remainingLegacyTags:SLOTS.flatMap(slot=>kit[slot].m20Missing?[slot+':'+kit[slot].m20Missing]:[]),
   dimensions:Object.fromEntries(M27_CERTIFICATION_DIMENSIONS.map(d=>[d,'NOT_FULLY_CERTIFIED'])),
   certification:'NOT_CERTIFIED'};
  return individual;
 });
 return {milestone:'M31_B01_AUTHORED_35_IDENTITY_LEDGER',identityWitnesses:35,
  scope:'two humans control 5 champions each; 35 champion-specific identity witnesses, not complete kits',
  dimensions:M27_CERTIFICATION_DIMENSIONS,champions,
  metrics:{champions:35,QWER:140,verifiedUniqueIdentityWitnessesPerSeat:35,teamSeats:2,
   fullyCertifiedPqwerKits:0},noGenericFallbackCertification:true};
}
if(process.argv[1]&&import.meta.url.endsWith('/'+process.argv[1].split('/').at(-1))){
 const data=buildM31B01ContractLedger(),i=process.argv.indexOf('--out');
 if(i>=0){
  const p=resolve(process.argv[i+1]);mkdirSync(dirname(p),{recursive:true});
  writeFileSync(p,JSON.stringify(data,null,2)+'\n','utf8');
 }
 console.log('M31_B01_IDENTITY_LEDGER '+JSON.stringify(data.metrics));
}
