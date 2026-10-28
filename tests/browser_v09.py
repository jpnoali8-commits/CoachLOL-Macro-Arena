from pathlib import Path
from playwright.sync_api import sync_playwright
P=Path(__file__).resolve().parents[1]
errors=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader'])
 page=browser.new_page(viewport={'width':1650,'height':960},device_scale_factor=1)
 page.on('pageerror',lambda exc:errors.append(str(exc)))
 
 import base64
 html=(P/'index.html').read_text(encoding='utf-8').split('<script src="data/bootstrap.js">')[0]+'</body></html>'
 html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+ (P/'styles.css').read_text(encoding='utf-8')+'</style>')
 page.set_content(html)
 page.add_script_tag(content=(P/'data/bootstrap.js').read_text(encoding='utf-8'))
 page.add_script_tag(content=(P/'engine.browser.js').read_text(encoding='utf-8'))
 app=(P/'app.js').read_text(encoding='utf-8')
 art='data:image/jpeg;base64,'+base64.b64encode((P/'assets/mapa_atualizado.jpg').read_bytes()).decode()
 app=app.replace("image.src='assets/mapa_atualizado.jpg'",'image.src='+repr(art))
 page.add_script_tag(content=app)

 page.wait_for_timeout(1100)
 assert page.locator('#board').evaluate('(x)=>x.width')>100
 assert page.locator('#simulatedNow').count()==1
 assert 'MS' in page.locator('#simulatedNow').inner_text()
 page.screenshot(path=str(P/'PREVIEW_v09_JOGO.png'),full_page=True)
 print('before turn',page.locator('#roundLabel').inner_text(),page.locator('#simulatedNow').inner_text())
 page.wait_for_timeout(2200)
 page.locator('#confirm').click()
 print('after turn',page.locator('#roundLabel').inner_text(),page.locator('#gameTime').inner_text(),page.locator('#boardHint').inner_text())
 assert page.locator('#roundLabel').inner_text()=='02'
 t=page.locator('#gameTime').inner_text()
 assert t.startswith('00:') and 1<=int(t.split(':')[1])<=12
 page.screenshot(path=str(P/'PREVIEW_v09_RODADA2.png'),full_page=True)
 assert not errors,errors
 print('JS browser errors:',errors)
 # Champ Select file preserved in package; static check.
 draft=(P/'draft.html').read_text(encoding='utf-8')
 assert 'CHAMP' in draft.upper() and (P/'draft.js').exists()
 browser.close()
