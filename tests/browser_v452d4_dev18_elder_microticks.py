from pathlib import Path
from playwright.sync_api import sync_playwright
import json, re, shutil
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf-8')

def inline_css(m):
    tag=m.group(0); q=re.search(r'href="([^"]+)"',tag)
    f=root/q.group(1) if q else None
    return '<style>\n'+f.read_text(encoding='utf-8')+'\n</style>' if f and f.exists() else tag

def inline_script(m):
    f=root/m.group(1)
    if not f.exists():return m.group(0)
    js=f.read_text(encoding='utf-8')
    if f.name=='app.js':
        assert js.rstrip().endswith('})();')
        js=js.rstrip()[:-5]+"""
  window.__dev18={get match(){return match},choose,updateInspector,renderStatus,requestDraw};
  })();"""
    return '<script>\n'+js+'\n</script>'

html=re.sub(r'<link\s+[^>]*>',inline_css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',inline_script,html)
out=root/'docs'/'QA_EVIDENCE_V452D4_DEV18';out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
    page=browser.new_page(viewport={'width':1440,'height':900})
    errors=[];page.on('pageerror',lambda error: errors.append(str(error)))
    page.set_content(html,wait_until='domcontentloaded',timeout=60000)
    page.wait_for_timeout(800)
    result=page.evaluate("""() => {
      const api=window.__dev18,a=api.match;
      const blue=a.units.find(u=>u.id==='blue_TOP'),red=a.units.find(u=>u.id==='red_TOP');
      a.gameTime=1800;a.grantElderV452d4Dev14('blue');red.hp=red.maxHp*.59;red.shield=0;
      a.damage(red,5,blue,'true','spell');
      const early=a.advanceElderSubticksV452d4Dev18(1800.24);
      const first=a.advanceElderSubticksV452d4Dev18(1800.25);
      const snap=a.snapshotV40();
      const b=window.CoachArena.Arena.fromSnapshotV40(a.map,a.mask,snap);
      a.advanceElderSubticksV452d4Dev18(1802.25);b.advanceElderSubticksV452d4Dev18(1802.25);
      api.choose(blue);api.updateInspector();api.renderStatus();api.requestDraw();
      return {early,first,damage:a.elderSubtickLedgerV452d4Dev18.map(e=>e.damage),
        times:a.elderSubtickLedgerV452d4Dev18.map(e=>e.at),
        restoredHp:b.units.find(u=>u.id===red.id).hp,originalHp:red.hp,
        equalLedger:JSON.stringify(a.elderSubtickLedgerV452d4Dev18)===JSON.stringify(b.elderSubtickLedgerV452d4Dev18),
        errors:a.validateInvariants()};
    }""")
    assert result['early']==0 and result['first']==1,result
    assert result['times']==[1800.25,1801.25,1802.25],result
    assert result['equalLedger'] and result['restoredHp']==result['originalHp'],result
    assert not result['errors'] and not errors,(result,errors)
    shot=out/'elder_microticks_chromium_fixture.png'
    page.screenshot(path=str(shot),full_page=False)
    (out/'browser_report.json').write_text(json.dumps({**result,'browserJsErrors':errors,'fixture':True},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('DEV18 Chromium engine parity PASS; 3 microticks, snapshot, 0 JS errors; screenshot:',shot)
    browser.close()
