"""Chromium DOM test: choose D for Smite in real CoachLOL Champ Select UI.
Uses a shortened draft fixture (DraftFlow.forceReady), not a manually completed full draft.
"""
from pathlib import Path
import asyncio,re
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/QA_EVIDENCE_V452D4_DEV10';OUT.mkdir(exist_ok=True,parents=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=await browser.new_page(viewport={'width':1440,'height':900})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  html=(ROOT/'draft.html').read_text(encoding='utf-8')
  # Do not navigate to index or write local storage from a data-URL smoke test.
  html=html.split('<script>\nwindow.addEventListener(\'draft:complete\'')[0]+'</body></html>'
  def css(m):
   f=ROOT/m.group(1);return '<style>'+f.read_text(encoding='utf-8')+'</style>' if f.exists() else ''
  html=re.sub(r'<link[^>]+href="([^"]+\.css)"[^>]*>',css,html)
  def js(m):
   f=ROOT/m.group(1)
   return '<script>'+f.read_text(encoding='utf-8')+'</script>'
  html=re.sub(r'<script src="([^"]+)"\s*></script>',js,html)
  await page.set_content(html,wait_until='domcontentloaded',timeout=30000)
  await page.wait_for_function('window.DraftFlow',timeout=10000)
  await page.evaluate('window.DraftFlow.forceReady()')
  locator=page.locator('#draftSmiteKey')
  await locator.wait_for(state='visible',timeout=10000)
  await locator.select_option('d')
  assert await locator.input_value()=='d'
  assert await page.evaluate('window.DraftFlow.getState().smiteKeys.blue')=='d'
  # The fixture skips ban animations; keep the configured Champion Select visible.
  await page.evaluate("document.getElementById('banCinema').style.display='none';document.getElementById('draftPassOverlay').style.display='none'")
  await page.screenshot(path=str(OUT/'champ_select_smite_d_chromium.png'))
  await page.evaluate("window.__draftResult=null;window.addEventListener('draft:complete',e=>window.__draftResult=e.detail);window.DraftFlow.finish();")
  assert await page.evaluate('window.__draftResult.smiteKeys.blue')=='d'
  assert not errors,errors[:4]
  print('PASS Chromium Champ Select D-slot -> draft:complete payload; JS errors=0')
  await browser.close()
if __name__=='__main__':asyncio.run(main())
