#!/usr/bin/env python3
"""Chromium DOM test of the REAL PvP client using REAL server end-state fixtures.
No native browser localhost transport or browser-clicked long match is claimed.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/QA_EVIDENCE_V453_DEV63'
blue=json.loads((OUT/'final_blue_session.json').read_text())
red=json.loads((OUT/'final_red_session.json').read_text())
html=(ROOT/'multiplayer.html').read_text().replace('</style>','</style><style>'+ (ROOT/'multiplayer/shop_v453_dev62.css').read_text()+'</style>').replace('<link rel="stylesheet" href="/multiplayer/shop_v453_dev62.css">','').replace('<script type="module" src="/multiplayer/pvp_client_v453_dev47.js"></script>','')
js=(ROOT/'multiplayer/pvp_client_v453_dev47.js').read_text()
checks=[];errors=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 try:
  for team,payload,title,shot in [('blue',blue,'VITÓRIA','dev63_victory_blue.png'),('red',red,'DERROTA','dev63_defeat_red.png')]:
   context=browser.new_context(viewport={'width':1440,'height':810},device_scale_factor=1)
   page=context.new_page()
   page.on('pageerror',lambda err,team=team:errors.append(f'{team}: {err}'))
   page.set_content(html,wait_until='domcontentloaded')
   page.add_script_tag(content='window.fetch=async()=>({ok:false,status:401});')
   page.add_script_tag(content='(async()=>{'+js+'\n window.__dev63_render=render;})();')
   page.wait_for_function('typeof window.__dev63_render === "function"')
   page.evaluate('(data)=>window.__dev63_render(data)',payload)
   overlay=page.locator('#pvpResultOverlay')
   assert overlay.is_visible(),team+' overlay hidden'
   checks.append(team+': overlay opened on server ended=true')
   assert page.locator('#pvpResultTitle').inner_text()==title
   checks.append(team+': result correct relative to authenticated team')
   assert page.locator('#pvpResultDetails').inner_text()=='Nexus vermelho destruído • 23:43 de partida'
   checks.append(team+': real Nexus target and server game-time shown')
   assert page.locator('#ready').is_disabled()
   checks.append(team+': no new confirmation after game end')
   assert page.locator('#shopTogglePvp').is_disabled()
   checks.append(team+': shop disabled after game end')
   page.screenshot(path=str(OUT/shot),full_page=True)
   page.locator('#pvpResultContinue').click()
   assert not overlay.is_visible()
   page.evaluate('(data)=>window.__dev63_render(data)',payload)
   assert not overlay.is_visible()
   checks.append(team+': Ver tabuleiro dismisses overlay even on next SSE render')
   context.close()
 finally:browser.close()
assert not errors,errors
checks.append('Chromium: 0 JavaScript exceptions')
report={'scope':'Chromium real, 2 browser contexts; final game data from native server HTTP test; offline DOM injection, NO browser-native HTTP/SSE or browser-driven full human match','passed':len(checks),'checks':checks,'errors':errors,'captures':['dev63_victory_blue.png','dev63_defeat_red.png']}
(OUT/'chromium_result_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'DEV63 CHROMIUM {len(checks)}/{len(checks)} PASS')
