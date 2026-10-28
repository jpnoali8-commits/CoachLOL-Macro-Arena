from pathlib import Path
from playwright.sync_api import sync_playwright
import re,shutil,os
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
def inline_css(m):
 tag=m.group(0);q=re.search(r'href="([^"]+)"',tag)
 f=root/q.group(1) if q else None
 return '<style>\n'+f.read_text()+'\n</style>' if f and f.exists() else tag
def inline_script(m):
 f=root/m.group(1)
 if not f.exists():return m.group(0)
 js=f.read_text()
 if f.name=='app.js':
  js=js.rstrip()[:-5]+"""
  window.__v42={match,choose,requestDraw,renderStatus,updateInspector,worldScreen};
  Object.defineProperty(window.__v42,'action',{get(){return action}});
  Object.defineProperty(window.__v42,'targetMode',{get(){return targetMode}});
  })();"""
 return '<script>\n'+js+'\n</script>'
html=re.sub(r'<link\s+[^>]*>',inline_css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',inline_script,html)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
 page=browser.new_page(viewport={'width':1600,'height':900});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,timeout=60000,wait_until='domcontentloaded')
 page.wait_for_timeout(900)
 assert not errors,errors
 assert page.evaluate("typeof window.CoachArena.kitSpellV42")=='function'
 # Use Nami from starter SUP; teach Q and confirm point-target mode.
 page.evaluate("""() => {const a=window.__v42.match,n=a.units.find(u=>u.id==='blue_SUP');n.skillRanks.Q=1;n.skillPoints=0;window.__v42.choose(n);}""")
 assert page.locator('#champName').inner_text().upper()=='NAMI'
 page.locator('#spells button.spellKey').first.click()
 assert page.evaluate('window.__v42.action')=='kit_location'
 assert page.evaluate('window.__v42.targetMode') is True
 page.screenshot(path=str(root/'docs'/'PREVIEW_V42_NAMI_TARGETING_CHROMIUM.png'),full_page=True)
 # Actual map clicks differ by camera transform; queue via engine proves authoritative route.
 queued=page.evaluate("""() => {const a=window.__v42.match,n=a.units.find(u=>u.id==='blue_SUP');return a.queueKitSkillV42('blue',n.id,'Q',{x:n.x+.02,y:n.y});}""")
 assert queued['ok'],queued
 assert page.evaluate("window.__v42.match.units.find(u=>u.id==='blue_SUP').pendingKitCastV42.slot")=='Q'
 resolved=page.evaluate("() => {const a=window.__v42.match;a.resolveKitSkillsV42();window.__v42.requestDraw();return a.events.some(e=>e.vfx?.type==='aqua_prison');}")
 assert resolved,'VFX da Nami Q não foi emitido'
 page.wait_for_timeout(300)
 assert not errors,errors
 page.screenshot(path=str(root/'docs'/'PREVIEW_V42_NAMI_VFX_CHROMIUM.png'),full_page=True)
 page.locator('#showAllStats').click()
 assert not page.locator('#allStatsOverlay').evaluate('(e)=>e.hidden')
 page.locator('#gameTime').click(force=True)
 assert page.locator('#allStatsOverlay').evaluate('(e)=>e.hidden')
 assert not errors,errors
 print('V4.2 Chromium: Nami kit targeting, HUD, queue and stats overlay OK; JS errors:',len(errors))
 browser.close()
