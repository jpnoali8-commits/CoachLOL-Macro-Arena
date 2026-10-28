#!/usr/bin/env python3
"""Dev64 offline DOM Chromium check using real server pendingDecision fixtures.
Does NOT test browser native HTTP/SSE transport or a human-played full match.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/QA_EVIDENCE_V453_DEV64'
html=(ROOT/'multiplayer.html').read_text().replace('</style>', '</style><style>'+ (ROOT/'multiplayer/shop_v453_dev62.css').read_text() +'</style>').replace('<link rel="stylesheet" href="/multiplayer/shop_v453_dev62.css">','').replace('<script type="module" src="/multiplayer/pvp_client_v453_dev47.js"></script>','')
js=(ROOT/'multiplayer/pvp_client_v453_dev47.js').read_text()
checks=[];errors=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 try:
  for side in ['blue','red']:
   owner=json.loads((OUT/f'{side}_owner_pending.json').read_text())
   enemy=json.loads((OUT/f'{side}_opponent_pending.json').read_text())
   ctx=browser.new_context(viewport={'width':1440,'height':810},device_scale_factor=1)
   page=ctx.new_page()
   page.on('pageerror',lambda err,side=side:errors.append(f'{side}: {err}'))
   page.set_content(html,wait_until='domcontentloaded')
   page.add_script_tag(content='window.__dev64Posted=[];window.fetch=async(url,opt={})=>{if(opt.method==="POST")window.__dev64Posted.push({url,body:JSON.parse(opt.body)});return {ok:true,status:200,json:async()=>({ok:true,kind:"decision.reaction",unitId:"red_MID"})};};')
   page.add_script_tag(content='(async()=>{'+js+'\n window.__dev64_render=render;})();')
   page.wait_for_function('typeof window.__dev64_render === "function"')
   page.evaluate('(data)=>window.__dev64_render(data)',owner)
   assert page.locator('#decision').is_visible(),side
   checks.append(f'{side}: legitimate defender has on-screen reaction dialog')
   assert page.locator('#reactionTargetPvp').input_value()==owner['pendingDecision']['enemyId']
   checks.append(f'{side}: aggressor selected without hidden positional data')
   assert page.locator('[data-reaction-slot="Q"]').is_enabled()
   assert page.locator('[data-reaction-slot="R"]').is_disabled()
   checks.append(f'{side}: skill rank gates unlearned R')
   page.locator('[data-reaction-slot="Q"]').click()
   assert page.locator('#reactionStepsPvp').inner_text()=='Q'
   checks.append(f'{side}: combo step Q built in HUD')
   page.screenshot(path=str(OUT/f'dev64_{side}_reaction.png'),full_page=True)
   page.locator('#reactfight').click()
   page.wait_for_function('window.__dev64Posted.length>0')
   posted=page.evaluate('window.__dev64Posted[0]')
   assert posted['url']=='/api/action',posted
   assert posted['body']['unitId']==side+'_MID'
   assert posted['body']['kind']=='decision.reaction'
   assert posted['body']['payload']['steps']==['Q']
   checks.append(f'{side}: manual Q submitted via action endpoint, not local damage')
   page.evaluate('(data)=>window.__dev64_render(data)',enemy)
   assert not page.locator('#decision').is_visible()
   checks.append(f'{side}: opponent cannot see the private window')
   ctx.close()
 finally:browser.close()
assert not errors,errors
checks.append('Chromium 2 contexts: 0 JavaScript exceptions')
report={'scope':'Chromium real, offline DOM with authoritative pendingDecision JSON from HTTP E2E; NO native browser HTTP/SSE and NO full human competitive match','passed':len(checks),'checks':checks,'errors':errors,'screenshots':['dev64_blue_reaction.png','dev64_red_reaction.png']}
(OUT/'chromium_reaction_report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(f'DEV64 CHROMIUM {len(checks)}/{len(checks)} PASS')
