"""Genuine Chromium state/visual test for editable D/F spell loadouts."""
import asyncio, re, base64, json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/QA_EVIDENCE_V452D4_DEV11'

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=await browser.new_page(viewport={'width':1600,'height':900},device_scale_factor=1)
  errors=[]
  page.on('pageerror',lambda err:errors.append(str(err)))
  html=(ROOT/'draft.html').read_text()
  def css_repl(m):
   f=ROOT/m.group(1);return '<style>'+f.read_text()+'</style>' if f.is_file() else ''
  html=re.sub(r'<link[^>]+href="([^"]+\.css)"[^>]*/?>',css_repl,html)
  def js_repl(m):
   f=ROOT/m.group(1)
   return '<script>'+f.read_text()+'</script>' if f.is_file() else ''
  html=re.sub(r'<script src="([^"]+)"\s*></script>',js_repl,html)
  await page.set_content(html,wait_until='domcontentloaded',timeout=30000)
  await page.wait_for_function('window.DraftFlow',timeout=8000)
  await page.evaluate('DraftFlow.forceReady()')
  jg=page.locator('#draftBlueRoster .draftRosterSlot[data-role="JG"]')
  assert await jg.count()==1
  selectors=jg.locator('select.draftSpellSelectV452d4Dev11')
  assert await selectors.count()==2
  assert await selectors.nth(0).input_value()=='flash'
  assert await selectors.nth(1).input_value()=='smite'
  await selectors.nth(0).select_option('ghost')
  assert await selectors.nth(0).input_value()=='ghost'
  assert await selectors.nth(1).input_value()=='smite'
  await selectors.nth(0).select_option('smite')
  assert await selectors.nth(0).input_value()=='smite'
  assert await selectors.nth(1).input_value()=='ghost'
  mid=page.locator('#draftBlueRoster .draftRosterSlot[data-role="MID"] select.draftSpellSelectV452d4Dev11')
  assert await mid.count()==2
  await mid.nth(0).select_option('ignite')
  await mid.nth(1).select_option('tp')
  assert [await mid.nth(0).input_value(),await mid.nth(1).input_value()]==['ignite','tp']
  state=await page.evaluate('''() => {const s=DraftFlow.getState();return {jg:s.summonerSlots.blue[s.picks.blue.find(p=>p.role==='JG').id],mid:s.summonerSlots.blue[s.picks.blue.find(p=>p.role==='MID').id],smiteKey:s.smiteKeys.blue};}''')
  assert state=={'jg':['smite','ghost'],'mid':['ignite','tp'],'smiteKey':'d'},state
  await page.evaluate("() => {const c=document.getElementById('banCinema');if(c)c.style.display='none';const h=document.getElementById('draftPassOverlay');if(h)h.style.display='none';}")
  await page.screenshot(path=str(OUT/'champ_select_dual_spells_chromium.png'),full_page=True)
  assert not errors,errors
  print('PASS Chromium draft D/F',json.dumps(state),'pageErrors=0')
  await browser.close()
if __name__=='__main__':asyncio.run(main())
