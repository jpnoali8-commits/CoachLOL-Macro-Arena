from pathlib import Path
from playwright.sync_api import sync_playwright
import re,shutil
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
  assert js.rstrip().endswith('})();')
  js=js.rstrip()[:-5]+"""
  window.__v45={get match(){return match},get selected(){return selected},choose,updateInspector,renderStatus,requestDraw};
  })();"""
 return '<script>\n'+js+'\n</script>'
html=re.sub(r'<link\s+[^>]*>',inline_css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',inline_script,html)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
 page=browser.new_page(viewport={'width':1600,'height':900});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,timeout=60000,wait_until='domcontentloaded');page.wait_for_timeout(600)
 assert not errors,errors
 assert page.evaluate('typeof window.CoachArena.Arena.prototype.summonHeraldV45')=='function'
 result=page.evaluate("""() => {
  const v=window.__v45,a=v.match,u=a.units.find(c=>c.id==='blue_JG');
  v.choose(u);const h=a.camps.find(c=>c.timerKey==='herald');a.gameTime=902;
  u.x=h.x;u.y=h.y;u.order={kind:'objective',targetId:h.id};u.ad=60000;
  a.updateObjectives();a.pickupHeraldEyeV45(u.id);v.updateInspector();v.renderStatus();v.requestDraw();
  return {eye:u.trinket,button:!!document.querySelector('.heraldEyeActionV45')};
 }""")
 assert result['eye']=='herald_eye' and result['button'],result
 assert page.locator('.heraldEyeActionV45').count()==1
 page.locator('.heraldEyeActionV45').click()
 assert page.evaluate("window.__v45.match.heraldMercenariesV45.length")==0 # carrier must move to lane first
 assert page.locator('.heraldLaneSelectV452d4Dev20').count()==1
 assert not errors,errors
 page.screenshot(path=str(root/'docs'/'PREVIEW_V45_ARAUTO_CHROMIUM.png'),full_page=False)
 print('V4.5 Chromium: historical Eye button now queues lane deployment, JS errors:',len(errors))
 browser.close()
