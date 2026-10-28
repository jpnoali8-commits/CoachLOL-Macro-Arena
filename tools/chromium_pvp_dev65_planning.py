#!/usr/bin/env python3
"""Dev65 offline Chromium DOM check, real HTTP sessions from Node E2E.
Does not certify native browser HTTP/SSE transport or full human play.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/QA_EVIDENCE_V453_DEV65'
html=(ROOT/'multiplayer.html').read_text().replace('</style>', '</style><style>'+ (ROOT/'multiplayer/shop_v453_dev62.css').read_text() +'</style>').replace('<link rel="stylesheet" href="/multiplayer/shop_v453_dev62.css">','').replace('<script type="module" src="/multiplayer/pvp_client_v453_dev47.js"></script>','')
js=(ROOT/'multiplayer/pvp_client_v453_dev47.js').read_text()
checks=[];errors=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 try:
  for side in ['blue','red']:
   owner=json.loads((OUT/f'{side}_planning_session.json').read_text())
   ctx=browser.new_context(viewport={'width':1440,'height':810},device_scale_factor=1)
   page=ctx.new_page()
   page.on('pageerror',lambda err,side=side:errors.append(f'{side}: {err}'))
   page.set_content(html,wait_until='domcontentloaded')
   page.add_script_tag(content='window.__dev65Posted=[];window.fetch=async(url,opt={})=>{if(opt.method==="POST")window.__dev65Posted.push({url,body:JSON.parse(opt.body)});return {ok:true,status:200,json:async()=>({ok:true,kind:"order.combo",unitId:"'+side+'_MID"})};};')
   page.add_script_tag(content='(async()=>{'+js+'\n window.__dev65_render=render;})();')
   page.wait_for_function('typeof window.__dev65_render === "function"')
   page.evaluate('(data)=>window.__dev65_render(data)',owner)
   assert page.locator('#planningComboV453Dev65').is_visible(),side
   checks.append(f'{side}: planejamento ofensivo visível')
   assert page.locator('#planningTargetPvp').input_value()==('red_MID' if side=='blue' else 'blue_MID')
   checks.append(f'{side}: alvo foi obtido do snapshot visível')
   assert page.locator('[data-plan-slot="Q"]').is_enabled()
   assert page.locator('[data-plan-slot="R"]').is_disabled()
   assert page.locator('[data-plan-slot="EXHAUST"]').is_disabled()
   assert page.locator('[data-plan-slot="IGNITE"]').is_enabled()
   checks.append(f'{side}: gates de skills e feitiços no HUD')
   page.locator('[data-plan-slot="Q"]').click()
   page.locator('[data-plan-slot="IGNITE"]').click()
   assert page.locator('#planningStepsPvp').inner_text()=='Q → IGNITE'
   checks.append(f'{side}: Q -> IGNITE exibido em ordem')
   page.screenshot(path=str(OUT/f'dev65_{side}_planned_combo.png'),full_page=True)
   page.locator('#planningSubmitPvp').click()
   page.wait_for_function('window.__dev65Posted.length>0')
   sent=page.evaluate('window.__dev65Posted[0]')
   assert sent['url']=='/api/action',sent
   assert sent['body']['unitId']==side+'_MID',sent
   assert sent['body']['kind']=='order.combo',sent
   assert sent['body']['payload']=={'targetId':('red_MID' if side=='blue' else 'blue_MID'),'steps':['Q','IGNITE']},sent
   checks.append(f'{side}: pacote de ordem enviado sem dano local')
   page.locator('#planningClearPvp').click()
   assert page.locator('#planningSubmitPvp').is_disabled()
   checks.append(f'{side}: limpar desativa envio vazio')
   ctx.close()
 finally:browser.close()
assert not errors,errors
checks.append('Chromium: 0 JavaScript exceptions, 2 contexts')
report={'scope':'Chromium offline DOM using real fog-filtered HTTP sessions; NOT native HTTP/SSE and NOT full human competitive match','passed':len(checks),'checks':checks,'errors':errors,'screenshots':['dev65_blue_planned_combo.png','dev65_red_planned_combo.png']}
(OUT/'chromium_planned_combos_report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print('DEV65 CHROMIUM '+str(len(checks))+'/'+str(len(checks))+' PASS')
