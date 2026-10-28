from pathlib import Path
from playwright.sync_api import sync_playwright
import base64
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text().split('<script src="data/bootstrap.js">')[0]+'</body></html>'
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+ (BASE/'styles.css').read_text()+'</style>')
app=(BASE/'app.js').read_text()
map_uri='data:image/jpeg;base64,'+base64.b64encode((BASE/'assets/mapa_atualizado.jpg').read_bytes()).decode()
app=app.replace("image.src='assets/mapa_atualizado.jpg'","image.src="+repr(map_uri))
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
 page=b.new_page(viewport={'width':1680,'height':940},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 for name in ['data/bootstrap.js','engine.browser.js','commands.browser.js']:
  page.add_script_tag(content=(BASE/name).read_text())
 page.add_script_tag(content=app)
 page.wait_for_timeout(900)
 print('JS errors on load',errors)
 assert not errors,errors
 page.locator('#roster button').nth(3).click()  # ADC
 print('ADC',page.locator('#champName').inner_text(),'upgrade',page.locator('#skillUpgradeButtons').inner_text())
 assert page.locator('#champName').inner_text()=='Jinx'
 assert page.locator('#skillUpgradeButtons button').nth(3).is_disabled()
 page.locator('#skillUpgradeButtons button').nth(1).click()
 assert '0 ponto' in page.locator('#skillPointsLabel').inner_text()
 msg='Jinx farmar safe com AA e kite; JG red de baixo depois krugs de baixo; MID priorizar upar Q E W'
 page.locator('#textOrders').fill(msg)
 page.locator('#previewOrders').click()
 assert not page.locator('#applyTextOrders').is_disabled(),page.locator('#commandPreview').inner_text()
 print('text preview',page.locator('#commandPreview').inner_text()[:250])
 page.locator('#applyTextOrders').click()
 assert 'FARM' in page.locator('#orderSummary').inner_text()
 screenshot=Path('/mnt/data/CoachLOL_Preview_v17_Ordens_Skills.png')
 page.screenshot(path=str(screenshot),full_page=True)
 page.locator('#confirm').click()
 page.wait_for_timeout(800)
 print('phase',page.locator('#simulatedNow').inner_text(), 'errors',errors)
 assert not errors,errors
 print('Screenshot',screenshot,'size',screenshot.stat().st_size)
 b.close()
