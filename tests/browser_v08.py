from pathlib import Path
import base64
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text(encoding='utf-8').split('<script src="data/bootstrap.js">')[0]+'</body></html>'
css=(BASE/'styles.css').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>')
app=(BASE/'app.js').read_text(encoding='utf-8')
uri='data:image/jpeg;base64,'+base64.b64encode((BASE/'assets/mapa_atualizado.jpg').read_bytes()).decode()
app=app.replace("image.src='assets/mapa_atualizado.jpg'","image.src="+repr(uri))
errors=[]
try:
 with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--enable-unsafe-swiftshader'])
    page=b.new_page(viewport={'width':1650,'height':950})
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html)
    page.add_script_tag(content=(BASE/'data/bootstrap.js').read_text())
    page.add_script_tag(content=(BASE/'engine.browser.js').read_text())
    page.add_script_tag(content=app)
    page.wait_for_timeout(900)
    print('map/canvas sizes',page.evaluate('JSON.stringify([document.querySelector("#board").width,document.querySelector("#board").height])'))
    print('champion',page.locator('#champName').inner_text(),'map',page.evaluate('document.querySelector("#boardHolder").getBoundingClientRect().width'))
    print('image success?',page.evaluate("Array.from(document.images).filter(x=>x.src.includes('mapa_atualizado')).map(x=>[x.complete,x.naturalWidth])"))
    page.screenshot(path=str(BASE/'PREVIEW_v08_JOGO.png'),full_page=True)
    # Select TOP, save route draft and change selection.
    page.locator('#roster button').first.click()
    page.locator('#actions button').filter(has_text='Rota desenhada').click()
    r=page.locator('#board').bounding_box()
    page.mouse.click(r['x']+r['width']*.421,r['y']+r['height']*.747)
    # no segment selection collapse
    print('steps',page.locator('#routeSteps .routeStepRow').count(),'hint',page.locator('#boardHint').inner_text())
    page.locator('#roster button').nth(2).click()
    page.locator('#roster button').first.click()
    print('steps restored',page.locator('#routeSteps .routeStepRow').count())
    page.locator('#finishRoute').click()
    print('plan status',page.locator('#orderSummary').inner_text())
    page.locator('#roster button').nth(3).click()
    page.locator('#policySelect').select_option('safe')
    page.locator('#actions button').filter(has_text='Mover').click()
    r=page.locator('#board').bounding_box()
    page.mouse.click(r['x']+r['width']*.61,r['y']+r['height']*.77)
    print('adc plan',page.locator('#orderSummary').inner_text())
    page.locator('#confirm').click()
    print('round',page.locator('#roundLabel').inner_text(),'events',page.locator('.event').count())
    page.screenshot(path=str(BASE/'PREVIEW_v08_RODADA2.png'),full_page=True)
    print('errors',errors)
    b.close()
finally: pass
