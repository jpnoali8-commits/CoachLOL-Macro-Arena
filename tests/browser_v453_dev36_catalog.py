#!/usr/bin/env python3
"""True Chromium QA for the local static official read-only catalogue."""
from pathlib import Path
import json, shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
evidence=root/'docs/QA_EVIDENCE_V453_DEV36'
evidence.mkdir(parents=True,exist_ok=True)
report={'browser':'chromium','scenario':'dev36 real local HTML; user-supplied official static reference','jsErrors':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security','--disable-gpu'])
 page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
 page.on('pageerror',lambda ex:report['jsErrors'].append(str(ex)))
 html=(root/'catalogo_riot_26_21.html').read_text()
 bundle=(root/'data/riot_reference/catalog_26_21_dev36.js').read_text()
 html=html.replace('<script src="data/riot_reference/catalog_26_21_dev36.js"></script>','<script>'+bundle+'</script>')
 page.set_content(html,wait_until='domcontentloaded')
 page.wait_for_selector('#items .item',timeout=30000)
 report['listInitial']=page.locator('#items .item').count()
 assert report['listInitial']==863,report
 page.locator('#q').fill('rabadon')
 report['searchMatches']=page.locator('#items .item').count()
 assert report['searchMatches']>=1,report
 page.locator('#items .item').first.click()
 assert 'Rabadon' in page.locator('#detail').inner_text(),report
 report['recipeComponents']=page.locator('#detail .recipe button').count()
 assert report['recipeComponents']>=2,report
 page.screenshot(path=str(evidence/'official_rabadon_recipe_chromium.png'),full_page=True)
 page.locator('#q').fill('')
 page.locator('#category').select_option('champion_exclusive')
 report['exclusiveCount']=page.locator('#items .item').count()
 assert report['exclusiveCount']==7
 page.locator('#category').select_option('minion_turret_internal')
 report['internalCount']=page.locator('#items .item').count()
 assert report['internalCount']==1
 page.locator('#items .item').click()
 report['internalDescription']=page.locator('#detail').inner_text()[:230]
 assert 'Turret Plating' in report['internalDescription']
 page.screenshot(path=str(evidence/'official_turret_internal_chromium.png'),full_page=True)
 assert not report['jsErrors'],report
 browser.close()
(evidence/'browser_official_catalog_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
