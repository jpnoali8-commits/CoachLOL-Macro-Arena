from pathlib import Path
from playwright.sync_api import sync_playwright
import re,base64,html
from urllib.parse import urlsplit, unquote
D=Path(__file__).resolve().parent.parent
source=(D/'index.html').read_text().replace('<head>','<head><base href="http://coachlol.test/">',1)
for stylesheet in re.findall(r'<link[^>]+href="(styles[^\"]*\.css)"[^>]*>',source):
 pattern=r'<link[^>]+href="'+re.escape(stylesheet)+r'"[^>]*>'
 source=re.sub(pattern,lambda m:'<style>\n'+(D/stylesheet).read_text()+'\n</style>',source)
for script in re.findall(r'<script src="([^\"]+\.js)"></script>',source):
 code=(D/script).read_text()
 if script=='app.js':
  img=(D/'assets/mapa_atualizado.jpg').read_bytes()
  data='data:image/jpeg;base64,'+base64.b64encode(img).decode()
  code=code.replace("image.src='assets/mapa_atualizado.jpg'", "image.src='"+data+"'")
 pattern='<script src="'+script+'"></script>'
 assert pattern in source
 source=source.replace(pattern,'<script>\n'+code.replace('</script','<\\/script')+'\n</script>')
with sync_playwright() as sp:
 b=sp.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-web-security','--disable-dev-shm-usage','--disable-gpu'])
 page=b.new_page(viewport={'width':1650,'height':950},device_scale_factor=1)
 def local_asset(route):
  path=unquote(urlsplit(route.request.url).path).lstrip('/')
  f=(D/path).resolve()
  if not str(f).startswith(str(D)) or not f.exists() or not f.is_file(): return route.abort()
  suffix=f.suffix.lower(); mime={'.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.css':'text/css'}.get(suffix,'application/octet-stream')
  route.fulfill(status=200,body=f.read_bytes(),content_type=mime)
 page.route('http://coachlol.test/**',local_asset)
 page.route('https://ddragon.leagueoflegends.com/**',lambda r:r.abort())

 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 try:
  page.set_content(source,wait_until='domcontentloaded',timeout=30000)
  page.wait_for_timeout(1600)
  print('BROWSER_TITLE',page.title())
  print('PAGE_ERRORS',errors[:15])
  print('CANVAS',page.locator('#board').bounding_box())
  print('CHAMP',page.locator('#champName').inner_text()[:60])
  print('UPGRADE_BUTTONS',page.locator('.skillFloatUpgrade').count(),'UPGRADE_ENABLED',page.locator('.skillFloatUpgrade.ready').count())
  print('LEGACY_UPGRADE_VISIBLE',page.locator('#quickSkillUp').is_visible())
  print('VECTORS',page.locator('img.actionVector').count())
  print('DEV_CONTROLS_VISIBLE',page.locator('#save').is_visible())
  page.screenshot(path=str(D/'PREVIEW_V30_ARENA_REAL.png'),full_page=True,timeout=30000)
  # upgrade a skill and see overlay vanish for 1pt in current state
  if page.locator('.skillFloatUpgrade.ready').count()>0:
   chosen=page.locator('.skillFloatUpgrade.ready').first
   slot=chosen.get_attribute('data-upgrade')
   chosen.click()
   print('UPGRADED',slot,'remaining overlays',page.locator('.skillFloatUpgrade').count())
  page.locator('#shopOpen').click()
  page.wait_for_timeout(300)
  print('SHOP_OPEN',page.locator('#shopModal').is_visible(),'ITEMS',page.locator('#itemGrid .itemBtn').count(), 'ROLE_BANNER',page.locator('.shopRoleBanner').all_inner_texts())
  page.screenshot(path=str(D/'PREVIEW_V30_LOJA_REAL.png'),full_page=True,timeout=30000)
  page.locator('#shopClose').click()
  page.locator('#scoreboardOpen').click()
  print('SCOREBOARD_SUMMONERS',page.locator('.sbSummoners img').count(),'ROW_ITEMS',page.locator('.sbItem').count())
  page.screenshot(path=str(D/'PREVIEW_V30_PLACAR_REAL.png'),full_page=True,timeout=30000)
  print('FINAL_ERRORS',errors[:15])
 except Exception as e:print('BROWSER_ERROR',str(e)[:1200], 'page_errors',errors[:5])
 b.close()
