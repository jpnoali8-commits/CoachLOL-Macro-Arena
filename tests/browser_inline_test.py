from pathlib import Path
from playwright.sync_api import sync_playwright
import base64
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text()
html=html.split('<script src="data/bootstrap.js">')[0]+'</body></html>'
css=(BASE/'styles.css').read_text()
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>')
app=(BASE/'app.js').read_text()
uri='data:image/jpeg;base64,'+base64.b64encode((BASE/'assets/mapa_atualizado.jpg').read_bytes()).decode()
app=app.replace("image.src='assets/mapa_atualizado.jpg'","image.src="+repr(uri))
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-web-security'])
 page=b.new_page(viewport={'width':1680,'height':940})
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 page.add_script_tag(content=(BASE/'data/bootstrap.js').read_text())
 page.add_script_tag(content=(BASE/'engine.browser.js').read_text())
 page.add_script_tag(content=app)
 page.wait_for_timeout(1800)
 print('errs',errors[:8]);print('champ',page.locator('#champName').inner_text())
 page.screenshot(path='/mnt/data/CoachLOL_v07_inicial.png',full_page=True)
 print('map loaded?', page.evaluate('document.querySelector("#board").width'), page.evaluate('document.querySelector("#board").height'))
 page.locator('#roster button').last.click()
 page.locator('#actions button').filter(has_text='Rota desenhada').click()
 rect=page.locator('#board').bounding_box()
 page.mouse.click(rect['x']+rect['width']*.61,rect['y']+rect['height']*.6)
 print('route points',page.locator('#boardHint').inner_text())
 page.locator('#finishRoute').click()
 print('order',page.locator('#orderSummary').inner_text())
 page.locator('#confirm').click()
 page.wait_for_timeout(500)
 print('round',page.locator('#roundLabel').inner_text(),'events',page.locator('.event').count(),'errors',errors[:10])
 page.screenshot(path='/mnt/data/CoachLOL_v07_rodada2.png',full_page=True)
 b.close()
