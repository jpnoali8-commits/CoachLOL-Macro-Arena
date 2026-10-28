#!/usr/bin/env python3
"""Actual Chromium smoke with HTTP-originated fog-filtered projections; browser localhost unavailable."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/QA_EVIDENCE_V453_DEV66'
html=(ROOT/'multiplayer.html').read_text().replace('</style>', '</style><style>'+ (ROOT/'multiplayer/shop_v453_dev62.css').read_text() +'</style>').replace('<link rel="stylesheet" href="/multiplayer/shop_v453_dev62.css">','').replace('<script type="module" src="/multiplayer/pvp_client_v453_dev47.js"></script>','')
js=(ROOT/'multiplayer/pvp_client_v453_dev47.js').read_text()
checks=[];errors=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 try:
  for side in ('blue','red'):
   state=json.loads((OUT/f'{side}_cleanse_session.json').read_text())
   ctx=browser.new_context(viewport={'width':1440,'height':810},device_scale_factor=1)
   page=ctx.new_page()
   page.on('pageerror',lambda err,side=side: errors.append(f'{side}: {err}'))
   page.set_content(html,wait_until='domcontentloaded')
   page.add_script_tag(content="window.__dev66Posted=[];window.fetch=async(url,opt={})=>{if(opt.method==='POST')window.__dev66Posted.push({url,body:JSON.parse(opt.body)});return {ok:true,status:200,json:async()=>({ok:true,kind:'summoner.queue'})};};")
   page.add_script_tag(content='(async()=>{'+js+'\n window.__dev66_render=render;})();')
   page.wait_for_function('typeof window.__dev66_render === "function"')
   page.evaluate('(data)=>window.__dev66_render(data)',state)
   assert page.locator('#cleansePvp').is_visible(),side
   checks.append(side+': botão Purificar exibido somente com spell equipado')
   assert page.locator('#cleansePvp').is_enabled(),side
   checks.append(side+': botão liberado durante planejamento')
   assert page.locator('[data-plan-slot="CLEANSE"]').is_enabled(),side
   checks.append(side+': Cleanse disponível no montador de combos')
   assert page.locator('[data-plan-slot="EXHAUST"]').is_disabled(),side
   checks.append(side+': Exaustão não equipada permanece bloqueada')
   assert page.locator('[data-plan-slot="R"]').is_disabled(),side
   checks.append(side+': ultimate não aprendida continua bloqueada')
   page.locator('#cleansePvp').click()
   page.wait_for_function('window.__dev66Posted.length>0')
   sent=page.evaluate('window.__dev66Posted[0]')
   assert sent['url']=='/api/action',sent
   assert sent['body']['unitId']==side+'_MID',sent
   assert sent['body']['kind']=='summoner.queue',sent
   assert sent['body']['payload']=={'type':'cleanse'},sent
   checks.append(side+': self-cast enfileirado no servidor sem alvo inimigo')
   page.screenshot(path=str(OUT/f'dev66_{side}_cleanse.png'),full_page=True)
   ctx.close()
 finally:browser.close()
assert not errors,errors
checks.append('Chromium: 0 exceções JS; contextos isolados')
report={'scope':'actual Chromium DOM of real fog-filtered HTTP session snapshots, with intercepted local action; NOT native browser HTTP/SSE and NOT a complete manually played PvP match','passed':len(checks),'checks':checks,'errors':errors}
(OUT/'chromium_cleanse_report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(f'DEV66 CHROMIUM {len(checks)}/{len(checks)} PASS')
