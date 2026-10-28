from pathlib import Path
from playwright.sync_api import sync_playwright
import base64
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text().split('<script src="data/bootstrap.js">')[0]+'</body></html>'
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+(BASE/'styles.css').read_text()+'</style>')
app=(BASE/'app.js').read_text()
map_uri='data:image/jpeg;base64,'+base64.b64encode((BASE/'assets/mapa_atualizado.jpg').read_bytes()).decode()
app=app.replace("image.src='assets/mapa_atualizado.jpg'","image.src="+repr(map_uri))
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
 page=b.new_page(viewport={'width':1680,'height':920},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 for name in ['data/bootstrap.js','engine.browser.js','commands.browser.js']:
  page.add_script_tag(content=(BASE/name).read_text())
 page.add_script_tag(content=app)
 page.wait_for_timeout(300)
 assert not errors,errors
 # Only jungler has the Smite policy panel
 page.locator('#roster button').nth(3).click()
 assert page.locator('#smitePanel').is_hidden()
 page.locator('#roster button').nth(1).click()
 assert page.locator('#smitePanel').is_visible()
 assert page.locator('#smitePanelStatus').inner_text()=='AUTO'
 page.locator('#smitePanel').evaluate('(e)=>e.open=true')
 page.locator('#smiteMode').select_option('targets')
 selected=page.locator('#smiteTarget option').all()
 red=[o.get_attribute('value') for o in selected if 'Red' in o.inner_text() and 'baixo' in o.inner_text()][0]
 page.locator('#smiteTarget').select_option(red)
 page.locator('#smiteThreshold').fill('600')
 page.locator('#smiteSave').click()
 assert page.locator('#smitePanelStatus').inner_text()=='ALVOS 1'
 assert 'Golpear' in page.locator('#notice').inner_text()
 assert not errors,errors
 page.screenshot(path='/mnt/data/CoachLOL_Preview_v19_Golpear.png',full_page=True)
 # Text command must parse path plus HP and be previewed as actionable
 page.locator('#textOrders').fill('JG red de baixo depois krugs, golpear red com 600 hp; ADC kite com AA e farm safe')
 page.locator('#previewOrders').click()
 preview=page.locator('#commandPreview').inner_text()
 assert page.locator('#applyTextOrders').is_enabled(),preview
 assert 'Golpear' in preview and '600' in preview,preview
 page.locator('#applyTextOrders').click()
 assert not errors,errors
 page.screenshot(path='/mnt/data/CoachLOL_Preview_v19_Ordens.png',full_page=True)
 # Pause initial state, no simulated time until player confirmation
 assert page.locator('#gameTime').inner_text()=='00:00'
 page.locator('#confirm').click();page.wait_for_timeout(350)
 assert page.locator('#simulatedNow').inner_text().startswith('EXECUTANDO')
 assert not errors,errors
 print('Browser v1.9: JG policy, ADC text, preview, apply, confirm -> OK')
 print('Preview files: /mnt/data/CoachLOL_Preview_v19_Golpear.png, /mnt/data/CoachLOL_Preview_v19_Ordens.png')
 b.close()
