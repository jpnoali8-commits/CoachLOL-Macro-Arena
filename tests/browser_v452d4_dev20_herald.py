from pathlib import Path
import re,shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf-8')
def css(m):
 tag=m.group(0);q=re.search(r'href="([^"]+)"',tag);f=root/q.group(1) if q else None
 return '<style>\n'+f.read_text(encoding='utf-8')+'\n</style>' if f and f.exists() else tag
def script(m):
 f=root/m.group(1)
 if not f.exists():return m.group(0)
 js=f.read_text(encoding='utf-8')
 if f.name=='app.js':
  assert js.rstrip().endswith('})();')
  js=js.rstrip()[:-5]+'''
  window.__dev20={get match(){return match},get selected(){return selected},get action(){return action},get targetMode(){return targetMode},choose,updateInspector,renderStatus,requestDraw,worldScreen};
  })();'''
 return '<script>\n'+js+'\n</script>'
html=re.sub(r'<link\s+[^>]*>',css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',script,html)
out=root/'docs/QA_EVIDENCE_V452D4_DEV20';out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
 page=browser.new_page(viewport={'width':1440,'height':900});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,timeout=60000,wait_until='domcontentloaded');page.wait_for_timeout(550)
 state=page.evaluate('''() => {
  const v=window.__dev20,a=v.match,u=a.units.find(x=>x.id==='blue_JG');
  a.gameTime=905;a.phase='planning';u.hp=u.maxHp;u.x=.50;u.y=.50;
  a.heraldEyeV45={owner:'blue',x:u.x,y:u.y,dropAt:905,expiresAt:925,holderId:null};
  v.choose(u);v.updateInspector();return {eye:a.heraldEyeV45.owner,claim:!!document.querySelector('.heraldEyeClaimV452d4Dev20')};
 }''')
 assert state['claim'],state
 page.locator('.heraldEyeClaimV452d4Dev20').click()
 assert page.locator('.heraldEyeActionV45').count()==1
 assert page.locator('.heraldLaneSelectV452d4Dev20').count()==1
 page.locator('.heraldLaneSelectV452d4Dev20').select_option('mid')
 page.locator('.heraldEyeActionV45').click()
 assert page.evaluate('window.__dev20.action')=='herald_deploy'
 # Use actual board click on a walkable mid-lane point.
 target=page.evaluate('''() => {
  const a=window.__dev20.match;
  const pt=a.lanes.mid.path.find(pt=>a.walkable(pt.x,pt.y)&&Math.min(...a.lanes.mid.path.map(p=>a.mapDistance(p,pt)))<100);
  return {point:pt,screen:window.__dev20.worldScreen(pt.x,pt.y)};
 }''')
 rect=page.locator('#board').bounding_box();assert rect,target
 page.mouse.click(rect['x']+target['screen']['x'],rect['y']+target['screen']['y'])
 result=page.evaluate('''() => {const a=window.__dev20.match,u=a.units.find(x=>x.id==='blue_JG');return {order:u.heraldSummonOrderV452d4Dev20,lane:u.heraldSummonOrderV452d4Dev20?.lane,count:a.heraldMercenariesV45.length};}''')
 assert result['order'] is not None and result['lane']=='mid',result
 assert result['count']==0,'No instant teleport or summon before carrier arrives'
 page.screenshot(path=str(out/'herald_carrier_lane_selector_chromium.png'),full_page=False)
 result=page.evaluate('''() => {
  const a=window.__dev20.match,u=a.units.find(x=>x.id==='blue_JG'),goal=u.heraldSummonOrderV452d4Dev20.point;
  u.x=goal.x;u.y=goal.y;a.gameTime++;a.advanceHeraldCarrierV452d4Dev20(u);
  window.__dev20.renderStatus();window.__dev20.requestDraw();
  return {count:a.heraldMercenariesV45.length,lane:a.heraldMercenariesV45[0]?.lane,charges:a.heraldMercenariesV45[0]?.charges};
 }''')
 assert result['count']==1 and result['lane']=='mid',result
 page.wait_for_timeout(120)
 page.screenshot(path=str(out/'herald_summoned_chromium.png'),full_page=False)
 assert not errors,errors
 print('DEV20 Chromium PASS: manual Eye claim, lane select, real board click, walk-then-summon, 0 JS exceptions',result)
 browser.close()
