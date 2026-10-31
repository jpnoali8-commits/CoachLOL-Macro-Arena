// B12C source validator. No standalone gameplay, no Node dependencies.
// Re-run against the frozen catalog and golden fixtures before Rust integration.
export function validateItemsStaticB12C({catalog,ITEM_RECIPES,ITEM_SELL_VALUES_V453_DEV60,
 recipePurchasePartsV453Dev30,rustCatalog,recipeFixture,shopFixture}){
 const problems=[];
 const check=(ok,msg)=>{if(!ok)problems.push(msg)};
 const rustLines=rustCatalog.split('\n');
 check(catalog.length===125,'unexpected source catalog length');
 let recordMatches=0;
 for(const spec of catalog){
  const line=rustLines.find(s=>s.includes('id: '+JSON.stringify(spec.id)+', cost:'));
  const sale=Object.prototype.hasOwnProperty.call(ITEM_SELL_VALUES_V453_DEV60,spec.id)
   ?'Some('+ITEM_SELL_VALUES_V453_DEV60[spec.id]+')':'None';
  const tags='&['+spec.tags.map(x=>JSON.stringify(x)).join(', ')+']';
  const recipe='&['+(ITEM_RECIPES[spec.id]||[]).map(x=>JSON.stringify(x)).join(', ')+']';
  const role=spec.roleLock?'Some('+JSON.stringify(spec.roleLock)+')':'None';
  const pet=spec.pet?'Some('+JSON.stringify(spec.pet)+')':'None';
  const metadata='tags: '+tags+', role_lock: '+role+', pet: '+pet+
   ', not_purchasable: '+Boolean(spec.notPurchasable)+', recipe: '+recipe;
  const matches=!!line&&line.includes('cost: '+spec.cost+', sell: '+sale)&&line.includes(metadata);
  if(matches)recordMatches++;else problems.push('catalog mismatch '+spec.id);
 }
 const byId=new Map(catalog.map(spec=>[spec.id,spec]));
 const fromField=f=>f==='-'?[]:f.split(',');
 const recRows=recipeFixture.split('\n').filter(s=>s&&!s.startsWith('#'));
 let recipeMatches=0;
 for(const row of recRows){
  const p=row.split('\t');if(p.length!==4){problems.push('bad recipe TSV');continue}
  const [id,inventory,consumed,cost]=p,entry=byId.get(id);
  if(!entry){problems.push('missing fixture item '+id);continue}
  const result=recipePurchasePartsV453Dev30(id,fromField(inventory));
  const discount=result.reduce((a,key)=>a+(byId.get(key)?.cost||0),0);
  const quoted=Math.max(0,entry.cost-discount);
  if(JSON.stringify(result)===JSON.stringify(fromField(consumed))&&String(quoted)===cost)
   recipeMatches++;
  else problems.push('recipe mismatch '+row);
 }
 const shopRows=shopFixture.split('\n').filter(s=>s&&!s.startsWith('#'));
 const seen=new Map();
 for(const row of shopRows){
  const p=row.split('\t');
  if(p.length!==15){problems.push('bad shop TSV');continue}
  const key=p[0]+'/'+p[1],idx=Number(p[4]),prev=seen.get(key)||0;
  if(idx!==prev)problems.push('shop step discontinuity '+key+': '+idx);
  seen.set(key,prev+1);
  if(!['blue','red'].includes(p[1])||!['TOP','JG','MID','ADC','SUP'].includes(p[2]))
   problems.push('invalid team/role '+row);
  if(!['0','1'].includes(p[6])||!Number.isSafeInteger(Number(p[7])))
   problems.push('invalid acceptance/gold '+row);
 }
 check(recordMatches===125,'expected 125 catalog records');
 check(recRows.length===1000,'expected 1000 recipe lines');
 check(recipeMatches===1000,'expected 1000 recipe matches');
 check(shopRows.length===258,'expected 258 shop lines');
 check(seen.size===44,'expected 44 blue/red shop histories');
 return {status:problems.length?'FAIL':'PASS',catalog_matches:recordMatches,recipe_rows:recRows.length,
 recipe_matches:recipeMatches,shop_rows:shopRows.length,shop_scenarios:seen.size,
 errors:problems.slice(0,30)};
}
