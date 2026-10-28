from pathlib import Path
from playwright.sync_api import sync_playwright
import re, shutil
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf-8')

def inline_css(m):
    tag=m.group(0)
    q=re.search(r'href="([^"]+)"',tag)
    f=root/q.group(1) if q else None
    return '<style>\n'+f.read_text(encoding='utf-8')+'\n</style>' if f and f.exists() else tag

def inline_script(m):
    f=root/m.group(1)
    if not f.exists():
        return m.group(0)
    js=f.read_text(encoding='utf-8')
    if f.name=='app.js':
        assert js.rstrip().endswith('})();')
        js=js.rstrip()[:-5]+"""
  window.__dev13={get match(){return match},get selected(){return selected},choose,openRiftPlantPicker,closeRiftPicker,get riftPicker(){return riftPicker},requestDraw};
  })();"""
    return '<script>\n'+js+'\n</script>'

html=re.sub(r'<link\s+[^>]*>',inline_css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',inline_script,html)
out_dir=root/'docs'/'QA_EVIDENCE_V452D4_DEV13'
out_dir.mkdir(parents=True,exist_ok=True)
shot=out_dir/'scryer_compact_picker_chromium.png'

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path=shutil.which('chromium'), args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
    page=browser.new_page(viewport={'width':1440,'height':900})
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.set_content(html, timeout=60000, wait_until='domcontentloaded')
    page.wait_for_timeout(1000)
    page.evaluate("""() => {
      const api=window.__dev13, a=api.match;
      const u=a.units.find(x=>x.id==='blue_JG') || a.units.find(x=>x.team==='blue');
      api.choose(u);
      const site=a.riftAllFeaturesV452d4('scryers')[0];
      u.x=site.x;u.y=site.y;
      api.openRiftPlantPicker(site, 720, 250);
    }""")
    page.wait_for_timeout(300)
    page.locator('#scryerAngleSlider').fill('135')
    page.wait_for_timeout(200)
    assert page.locator('.scryerCompactPicker').count()==1
    assert page.locator('.scryerCompactTitle').inner_text().strip()=='Florividente'
    assert 'CONE DIRECIONAL' not in page.content()
    assert 'Máscara:' not in page.content()
    page.screenshot(path=str(shot), full_page=False)
    print('Dev13 Chromium picker PASS; errors=',len(errors),'screenshot=',shot)
    if errors:
        raise AssertionError(errors)
    browser.close()
