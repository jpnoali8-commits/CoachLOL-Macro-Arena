/** M14 prototype realm kernel: one world, two combat partitions.
 * All coordinates are canonical map coordinates; no duplicate terrain.
 * Geometry is sampled from the authoritative elemental wall/brush masks.
 */
export const realmOf=(a,u)=>{
 const r=a.realmContextV453Dev69;
 return r&&u&&(u.id===r.casterId||u.id===r.targetId)?r:null;
};
export const sameRealm=(a,u,v)=>
 (realmOf(a,u)?.id||null)===(realmOf(a,v)?.id||null);
export const validRealmPoint=(a,u,p)=>{
 if(!p||!a.walkable(p.x,p.y))return false;
 const r=realmOf(a,u);
 return !r||a.mapDistance(r.centerWorld,p)<=r.radiusWorld;
};
export function startRealm(a,caster,target){
 if(a.realmContextV453Dev69||!caster?.hp||!target?.hp||
  !a.visible(caster.team,target)||a.mapDistance(caster,target)>650)
  return {ok:false,reason:'reino_alvo_invalido'};
 const r={id:'realm_'+(++a.realmSeqV453Dev69),casterId:caster.id,
  targetId:target.id,centerWorld:{x:target.x,y:target.y},
  radiusWorld:1200,startAt:a.gameTime,endsAt:a.gameTime+7,
  riftVariant:a.riftV452d4?.element||'original',
  geometryRevision:a.riftV452d4?.revision||0,
  lastValid:{[caster.id]:{x:caster.x,y:caster.y},
   [target.id]:{x:target.x,y:target.y}}};
 a.realmContextV453Dev69=r;
 caster.realmIdV453Dev69=r.id;target.realmIdV453Dev69=r.id;
 a.event('Reino da Morte iniciado.',null,'realm_start',caster.id,
  {observedBy:[caster.team,target.team]});
 return {ok:true,realmId:r.id};
}
export function endRealm(a,reason='duration'){
 const r=a.realmContextV453Dev69;if(!r)return;
 for(const id of [r.casterId,r.targetId]){
  const u=a.units.find(v=>v.id===id);if(!u)continue;
  const p=r.lastValid[id];
  // The actors have been moving in world coordinates all along.
  // Keep their FINAL positions, never revert to initial cast coordinates.
  if(!a.walkable(u.x,u.y)&&p){u.x=p.x;u.y=p.y;}
  u.realmIdV453Dev69=null;
 }
 a.realmContextV453Dev69=null;
 a.event('Reino da Morte encerrado: '+reason,null,'realm_end',r.casterId,
  {observedBy:['blue','red']});
}
export function advanceRealm(a){
 const r=a.realmContextV453Dev69;if(!r)return;
 const caster=a.units.find(u=>u.id===r.casterId),
  target=a.units.find(u=>u.id===r.targetId);
 if(!caster?.hp||!target?.hp)return endRealm(a,'death');
 if(a.gameTime>=r.endsAt)return endRealm(a,'duration');
 // End on elemental revision change, instead of mixing old visual
 // geometry with changed physical masks mid-ultimate.
 if((a.riftV452d4?.revision||0)!==r.geometryRevision)
  return endRealm(a,'geometry_change');
 for(const u of [caster,target]){
  const from=r.lastValid[u.id]||{x:u.x,y:u.y},to={x:u.x,y:u.y};
  const count=Math.max(1,Math.ceil(a.mapDistance(from,to)/20));
  let last=from;
  for(let i=1;i<=count;i++){
   const next={x:from.x+(to.x-from.x)*i/count,
    y:from.y+(to.y-from.y)*i/count};
   if(!validRealmPoint(a,u,next))break;
   last=next;
  }
  if(last.x!==u.x||last.y!==u.y){
   u.x=last.x;u.y=last.y;u.path=[];u.laneFollowPath=[];
   u.retreatPath=[];
  }
  r.lastValid[u.id]={x:u.x,y:u.y};
 }
}
export function realmView(a,team){
 const r=a.realmContextV453Dev69;if(!r)return null;
 const actors=[r.casterId,r.targetId].map(id=>a.units.find(u=>u.id===id));
 if(!actors.some(u=>u?.team===team))return null;
 const n=25,terrain=[];
 for(let y=0;y<n;y++){
  let wall='',brush='';
  for(let x=0;x<n;x++){
   const px=r.centerWorld.x+((x+.5)/n*2-1)*r.radiusWorld/a.worldWidth,
    py=r.centerWorld.y+((y+.5)/n*2-1)*r.radiusWorld/a.worldHeight;
   wall+=a.maskAt('wall',px,py)?'1':'0';
   brush+=a.maskAt('brush',px,py)?'1':'0';
  }
  terrain.push({wall,brush});
 }
 return {id:r.id,centerWorld:{...r.centerWorld},radiusWorld:r.radiusWorld,
  endsAt:r.endsAt,riftVariant:r.riftVariant,
  geometryRevision:r.geometryRevision,worldWidth:a.worldWidth,
  worldHeight:a.worldHeight,terrain,
  units:actors.filter(Boolean).map(u=>({id:u.id,champ:u.champ,team:u.team,
   x:u.x,y:u.y,hp:u.hp,maxHp:u.maxHp,mana:u.mana,maxMana:u.maxMana}))};
}
