"""Chromium controlled E2E for real app/engine endgame flow.
Accelerates a Nexus destruction in test-only route injection; this does not
represent an organically simulated whole match. Does not modify app.js.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
EVIDENCE=ROOT/'docs/QA_EVIDENCE_V452D4_DEV8'
EVIDENCE.mkdir(parents=True,exist_ok=True)

async def run():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
        for winner in ('blue','red'):
            page=await browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            import re
            import base64
            html=(ROOT/'index.html').read_text(encoding='utf-8')
            def css_replace(m):
                f=ROOT/m.group(1)
                return '<style>'+f.read_text(encoding='utf-8')+'</style>' if f.is_file() else ''
            html=re.sub(r'<link[^>]+href="([^"]+\.css)"[^>]*/?>',css_replace,html)
            def js_replace(m):
                file=ROOT/m.group(1)
                raw=file.read_text(encoding='utf-8')
                if file.name=='app.js':
                    for outcome in ('victory','defeat'):
                        logo=ROOT/f'assets/ui/endgame/{outcome}_overlay.png'
                        uri='data:image/png;base64,'+base64.b64encode(logo.read_bytes()).decode()
                        raw=raw.replace(f"'assets/ui/endgame/{outcome}_overlay.png'",repr(uri))
                    hook="""
window.__coachDev8Harness={
 forceWinner(team){
  const defeated=match.structures.find(s=>s.id===(team==='blue'?'red':'blue')+'_nexus');
  defeated.hp=0;match.phase='planning';match.finishStructureDeathsV451();match.gameTime++;
  match.tick();renderStatus();return {ended:match.ended,winner:match.winner};
 }
};
"""
                    i=raw.rfind('})();')
                    assert i>0
                    raw=raw[:i]+hook+raw[i:]
                return '<script>'+raw+'</script>'
            html=re.sub(r'<script src="([^"]+)"\s*></script>',js_replace,html)
            await page.set_content(html,wait_until='domcontentloaded',timeout=30000)
            await page.wait_for_function('window.__coachDev8Harness && window.CoachPostgame',timeout=15000)
            result=await page.evaluate('(w)=>window.__coachDev8Harness.forceWinner(w)',winner)
            assert result=={'ended':True,'winner':winner},result
            await page.locator('#endgameOverlay').wait_for(state='visible',timeout=10000)
            img=await page.locator('#endgameIntroImage').get_attribute('src')
            assert img.startswith('data:image/png;base64,'),img[:80]
            await page.screenshot(path=str(EVIDENCE/f'endgame_{winner}_intro.png'),full_page=False)
            await page.locator('#endgameIntroContinue').click()
            await page.locator('#resultOverlay').wait_for(state='visible')
            assert await page.locator('#resultTitle').is_visible()
            assert await page.locator('#resultTables').inner_text()
            tabs=page.locator('#resultTables [role="tab"]')
            # Postgame independent module 5 tabs; ensure they are interactive.
            count=await tabs.count()
            assert count>=5,f'tabs {count}'
            for idx in range(5):
                await tabs.nth(idx).click()
            await page.screenshot(path=str(EVIDENCE/f'endgame_{winner}_results.png'),full_page=False)
            await tabs.nth(3).click()
            await page.screenshot(path=str(EVIDENCE/f'endgame_{winner}_charts.png'),full_page=False)
            await page.locator('#resultContinue').click()
            assert await page.locator('#resultOverlay').is_hidden()
            assert not errors,f'{winner} JS errors: {errors[:5]}'
            print(f'PASS browser {winner}: Nexus->intro->Continue->result (5 tabs)->Continue; pageerrors=0')
            await page.close()
        await browser.close()

if __name__=='__main__':asyncio.run(run())
