from pathlib import Path
from playwright.sync_api import sync_playwright
import re,base64
D=Path(__file__).resolve().parents[1]
html=(D/'index.html').read_text()
html=re.sub(r'<script src="[^"]+"></script>','',html)
html=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',html)
app=(D/'app.js').read_text()
img='data:image/jpeg;base64,'+base64.b64encode((D/'assets/mapa_atualizado.jpg').read_bytes()).decode()
app=app.replace("image.src='assets/mapa_atualizado.jpg'",'image.src='+repr(img))
app=app.replace('})();','window.__v39Smoke={match,cinematicDirector,renderStatus};})();')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-web-security'])
 page=b.new_page(viewport={'width':1600,'height':900});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 for f in ['styles.css','styles-v25.css','styles-v26.css','styles-v27.css','styles-v28.css','styles-v29.css','styles-v30.css','styles-v31.css','styles-v32.css','styles-v33.css','styles-v38.css','styles-v38-1.css','cinematics.css','styles-v39.css']:
  if (D/f).exists():page.add_style_tag(content=(D/f).read_text())
 for f in ['data/bootstrap.js','riot-assets.js','engine.browser.js','commands.browser.js','data/cinematic_manifest.browser.js','cinematics-core.browser.js','cinematics.js','app.js','ui-align-v26.js']:
  page.add_script_tag(content=app if f=='app.js' else (D/f).read_text())
 page.wait_for_timeout(600)
 assert not errors,errors
 page.locator('#roster button').first.click()
 page.locator('#showAllStats').click()
 assert not page.locator('#allStatsOverlay').evaluate('(e)=>e.hidden'),'overlay not open'
 assert page.locator('#allStatsGrid b').count()>28
 page.screenshot(path=str(D/'docs'/'PREVIEW_V39_STATS_CHROMIUM.png'),full_page=True)
 page.locator('#gameTime').click(force=True)
 assert page.locator('#allStatsOverlay').evaluate('(e)=>e.hidden'),'overlay not auto-hidden'
 page.select_option('#matchSpeed','2')
 assert page.locator('#matchSpeed').input_value()=='2'
 page.evaluate("()=>{const m=window.__v39Smoke.match;m.gameTime=10;window.__v39Smoke.renderStatus();}")
 assert page.locator('#gameTime').inner_text()=='00:10'
 print('Chromium UI OK; overlay, 30+ attributes, outside-click, speed 2x, game-time clock; JS errors=',errors)
 b.close()
