from pathlib import Path
from playwright.sync_api import sync_playwright
import re, shutil
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf-8')

def inline_css(m):
    tag=m.group(0); q=re.search(r'href="([^"]+)"',tag)
    f=root/q.group(1) if q else None
    return '<style>\n'+f.read_text(encoding='utf-8')+'\n</style>' if f and f.exists() else tag

def inline_script(m):
    f=root/m.group(1)
    if not f.exists(): return m.group(0)
    js=f.read_text(encoding='utf-8')
    if f.name=='app.js':
        assert js.rstrip().endswith('})();')
        js=js.rstrip()[:-5]+"""
  window.__dev14={get match(){return match},choose,updateInspector,renderStatus,requestDraw};
  })();"""
    return '<script>\n'+js+'\n</script>'

html=re.sub(r'<link\s+[^>]*>',inline_css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',inline_script,html)
out=root/'docs'/'QA_EVIDENCE_V452D4_DEV14'
out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
    page=browser.new_page(viewport={'width':1440,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded',timeout=60000)
    page.wait_for_timeout(800)
    result=page.evaluate("""() => {
      const api=window.__dev14,a=api.match,u=a.units.find(x=>x.id==='blue_TOP');
      a.gameTime=1200;api.choose(u);
      const before=a.elementalStatsV452d3(u);
      a.grantBaronV452d4Dev14('blue');a.grantElderV452d4Dev14('blue');
      api.updateInspector();api.renderStatus();api.requestDraw();
      const after=a.elementalStatsV452d3(u);
      return {beforeAD:before.ad,afterAD:after.ad,afterAP:after.ap,
        text:document.getElementById('effectStripV41').textContent,
        shownAD:document.querySelector('#statGrid .stat-ad b')?.textContent,
        shownAP:document.querySelector('#statGrid .stat-ap b')?.textContent};
    }""")
    assert result['afterAD']>result['beforeAD'],result
    assert result['shownAD']==str(round(result['afterAD'])),result
    assert result['shownAP']==str(round(result['afterAP'])),result
    assert 'Barão' in result['text'] and 'Ancião' in result['text'],result
    assert not errors,errors
    screen=out/'baron_elder_hud_chromium.png'
    page.screenshot(path=str(screen),full_page=False)
    print('DEV14 Chromium HUD PASS: effective AD/AP, buff timers, 0 errors; screenshot:',screen)
    browser.close()
