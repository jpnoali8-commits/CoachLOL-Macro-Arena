"""Real Chromium UI test: authored left-to-right cone, angle choice, and activation.
This is an isolated, controlled scenario, not an organically played match.
"""
from pathlib import Path
import asyncio,re,base64,json
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/QA_EVIDENCE_V452D4_DEV12'
OUT.mkdir(parents=True,exist_ok=True)
HOOK='''
window.__coachDev12={
 prepare(){
  const site=match.riftAllFeaturesV452d4('scryers').find(p=>match.walkable(p.x,p.y));
  selected=match.units.find(u=>u.team==='blue');selected.x=site.x;selected.y=site.y;
  openRiftPlantPicker(site,720,310);
  return {id:site.id,kind:site.kind,anglePicker:!!document.querySelector('[aria-label="Direção da Florividente"]'),initial:document.querySelector('[aria-label="Ângulo da Florividente em graus"]')?.value};
 },
 state(){return {pulses:match.riftVisionPulsesV452d4.length,heading:match.riftVisionPulsesV452d4.at(-1)?.heading,cooldown:Object.values(match.riftPlantTimersV452d4)[0],errors:match.validateInvariants()};}
};
'''
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=await browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  html=(ROOT/'index.html').read_text()
  def css(m):
   f=ROOT/m.group(1);return '<style>'+f.read_text()+'</style>' if f.is_file() else ''
  html=re.sub(r'<link[^>]+href="([^"]+\.css)"[^>]*/?>',css,html)
  def js(m):
   f=ROOT/m.group(1);code=f.read_text()
   if f.name=='app.js':
    for typ in ('victory','defeat'):
     img=ROOT/f'assets/ui/endgame/{typ}_overlay.png'
     code=code.replace(f"'assets/ui/endgame/{typ}_overlay.png'",repr('data:image/png;base64,'+base64.b64encode(img.read_bytes()).decode()))
    k=code.rfind('})();');assert k>=0
    code=code[:k]+HOOK+code[k:]
   return '<script>'+code+'</script>'
  html=re.sub(r'<script src="([^"]+)"\s*></script>',js,html)
  await page.set_content(html,wait_until='domcontentloaded',timeout=40000)
  await page.wait_for_function('window.__coachDev12',timeout=15000)
  out=await page.evaluate('window.__coachDev12.prepare()')
  assert out['anglePicker'] and out['initial']=='0',out
  slider=page.locator('[aria-label="Ângulo da Florividente em graus"]')
  await slider.fill('90')
  assert await slider.input_value()=='90'
  await page.locator('[aria-label="Direção da Florividente"] button',has_text='Revelar na direção').click()
  state=await page.evaluate('window.__coachDev12.state()')
  assert state['pulses']==1 and abs(state['heading']-1.5707963267948966)<1e-7 and not state['errors'],state
  # Second time: screenshot the actual selector at 135 degrees.
  await page.evaluate('window.__coachDev12.prepare()')
  await page.locator('[aria-label="Ângulo da Florividente em graus"]').fill('135')
  await page.screenshot(path=str(OUT/'scryer_angle_picker_chromium.png'),full_page=False)
  assert not errors,errors[:5]
  print('PASS real Chromium UI:',json.dumps(out),json.dumps(state),'pageErrors=0')
  await browser.close()
if __name__=='__main__':asyncio.run(main())
