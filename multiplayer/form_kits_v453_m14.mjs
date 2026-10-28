/** Shared polymorphic kit grammar for transforming champions.
 * Separate Q/W/E cooldown namespaces; never overwrite another form's spells.
 * Gameplay prototypes: missing flags denote non-certified unique mechanics.
 */
const BS=(shape,range,mana,cooldown,damage=[],extra={})=>({
 kind:'board_effect',shape,range,mana:[].concat(mana),
 cooldown:[].concat(cooldown),damage:[].concat(damage),
 implemented:'form_prototype',...extra
});
export const FORM_KITS_V453_M14=Object.freeze({
 Nidalee:{
  human:{
   Q:BS('line_enemy',1500,50,6,[70,95,120,145,170],{width:115,maxHits:1,apRatio:.65,missing:'spear_flight_distance_multiplier'}),
   W:BS('circle_enemy',900,40,12,[35,55,75,95,115],{radius:150,apRatio:.22,boardTemporal:'minefield',zoneSeconds:5,missing:'trap_hunted_and_reveal'}),
   E:BS('target_ally',600,60,12,[],{heal:[70,100,130,160,190],apRatio:.5,missing:'attack_speed_ally_buff'}),
   R:BS('self',0,0,3,[],{transformTo:'cougar'})
  },
  cougar:{
   Q:BS('target_enemy',175,0,6,[55,80,105,130,155],{apRatio:.4,missingHpRatio:.28,missing:'hunted_empower'}),
   W:BS('move_point',375,0,6,[45,70,95,120,145],{radius:205,apRatio:.35,missing:'hunted_long_pounce'}),
   E:BS('cone_enemy',300,0,6,[60,90,120,150,180],{arc:75,apRatio:.4}),
   R:BS('self',0,0,3,[],{transformTo:'human'})
  }
 },
 Elise:{
  human:{
   Q:BS('target_enemy',615,80,6,[45,70,95,120,145],{apRatio:.7,missing:'current_hp_scaling'}),
   W:BS('circle_enemy',950,70,12,[50,75,100,125,150],{radius:235,apRatio:.75,missing:'volatile_spiderling_tracking'}),
   E:BS('line_enemy',1075,50,12,[],{width:125,maxHits:1,cc:'stun',ccSeconds:1.5,missing:'cocoon_projectile_travel'}),
   R:BS('self',0,0,3,[],{transformTo:'spider',missing:'spiderling_pet_swarm'})
  },
  spider:{
   Q:BS('target_enemy',475,0,6,[50,75,100,125,150],{apRatio:.6,dashToHit:true,missing:'missing_hp_scaling'}),
   W:BS('self',0,0,12,[],{speedBuff:.25,buffSeconds:4,missing:'attack_speed_buff'}),
   E:BS('move_point',750,0,20,[],{radius:0,missing:'rappel_stasis_and_enemy_anchor'}),
   R:BS('self',0,0,3,[],{transformTo:'human'})
  }
 },
 Shyvana:{
  human:{
   Q:BS('self',0,0,10,[],{nextBasic:[40,60,80,100,120],basicAdRatio:.5,charges:1,missing:'emberstrike_double_hit_recast'}),
   W:BS('self',0,0,13,[],{shield:[75,110,145,180,215],speedBuff:.18,buffSeconds:3,missing:'delayed_inferno_aegis_explosion'}),
   E:BS('circle_enemy',800,0,12,[70,100,130,160,190],{radius:230,apRatio:.55,missing:'fireball_projectile_and_impact'}),
   R:BS('move_point',1050,0,0,[100,150,200],{radius:320,cc:'fear',ccSeconds:1,transformTo:'dragon',missing:'fury_trigger_and_transformation_timing'})
  },
  dragon:{
   Q:BS('self',0,0,10,[],{nextBasic:[65,95,125,155,185],basicAdRatio:.7,charges:1,missing:'dragon_extra_recasts'}),
   W:BS('self',0,0,13,[],{shield:[100,140,180,220,260],speedBuff:.22,buffSeconds:3,missing:'dragon_healing_explosion'}),
   E:BS('circle_enemy',950,0,12,[95,140,185,230,275],{radius:360,apRatio:.7,missing:'molten_fire_trail'}),
   R:BS('self',0,0,0,[],{passiveOnly:true,missing:'dragon_form_ends_with_fury'})
  }
 }
});
export const DEFAULT_FORM_V453_M14=Object.freeze({Nidalee:'human',Elise:'human',Shyvana:'human'});
