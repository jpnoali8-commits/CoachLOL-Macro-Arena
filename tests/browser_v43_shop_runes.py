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
  window.__v43={get match(){return match},choose,renderShop,renderStatus,updateInspector};
  })();"""
 return '<script>\n'+js+'\n</script>'
html=re.sub(r'<link\s+[^>]*>',inline_css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',inline_script,html)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
 page=browser.new_page(viewport={'width':1600,'height':900});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,timeout=60000,wait_until='domcontentloaded');page.wait_for_timeout(700)
 assert not errors,errors
 assert page.evaluate("typeof window.CoachArena.RUNE_PAGES_V43")=='object'
 page.locator('#shopOpen').click()
 assert page.locator('#shopModal').is_visible()
 assert page.locator('#shopRunePage').is_visible()
 page.locator('#shopRunePage').select_option('sorcery')
 page.locator('#shopRuneApply').click()
 assert page.evaluate("window.__v43.match.units.find(u=>u.id==='blue_ADC').runePageV43")=='sorcery'
 # Server/motor API purchase; UI render/inventory & client click sale.
 purchased=page.evaluate("""() => {let a=window.__v43.match,u=a.units.find(u=>u.id==='blue_ADC');
   let shop=a.map.objects.find(s=>s.id==='blue_spawn_shop');u.x=shop.x;u.y=shop.y;u.gold=5000;
   let ok=a.buy('blue',u.id,'long_sword');window.__v43.renderShop('all');return ok; }""")
 assert purchased
 assert 'Espada Longa' in page.locator('#shopInventory').inner_text()
 page.screenshot(path=str(root/'docs'/'PREVIEW_V43_SHOP_RUNES_CHROMIUM.png'),full_page=True)
 buttons=page.locator('#shopInventory .inventorySlotV43 button')
 assert buttons.count()>0
 gold0=page.evaluate("window.__v43.match.units.find(u=>u.id==='blue_ADC').gold")
 buttons.last.click()
 gold1=page.evaluate("window.__v43.match.units.find(u=>u.id==='blue_ADC').gold")
 assert gold1==gold0+245,(gold0,gold1)
 assert not errors,errors
 print('V4.3 Chromium: shop / rune selection / buy-sale / JS errors',len(errors))
 browser.close()
