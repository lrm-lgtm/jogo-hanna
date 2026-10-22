'use strict';
const assert=require('node:assert/strict'),test=require('node:test');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const evidence=path.resolve(__dirname,'evidence');
fs.mkdirSync(evidence,{recursive:true});
const url='http://127.0.0.1:8765/character-v3/preview.html';
test('real GLB loads and rotates/walks in desktop and Android portrait browsers',{timeout:190000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 try{
  for(const [label,viewport,ismobile] of [
   ['desktop',{width:1280,height:720},false],
   ['android-portrait',{width:393,height:852},true]
  ]){
   const context=await browser.newContext({viewport,isMobile:ismobile,hasTouch:ismobile,deviceScaleFactor:1,serviceWorkers:'block'});
   try{
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const res=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
    assert.equal(res.status(),200);
    await page.waitForFunction(()=>window.__hannaArtQA?.status!=='loading',null,{timeout:95000});
    const s=await page.evaluate(()=>window.__hannaArtQA);
    assert.equal(s.status,'ready','Could not load real GLB: '+JSON.stringify(s));
    assert.ok(s.meshCount>45,'character incomplete: '+s.meshCount);
    await page.screenshot({path:path.join(evidence,label+'-front.png')});
    await page.locator('#walk').click();
    await page.waitForFunction(()=>window.__hannaArtQA.walking);
    await page.locator('#turn').click();
    await page.waitForFunction(()=>window.__hannaArtQA.turning);
    await page.waitForTimeout(700);
    await page.screenshot({path:path.join(evidence,label+'-walking.png')});
    await page.locator('#front').click();
    await page.waitForFunction(()=>!window.__hannaArtQA.turning);
    assert.deepEqual(errors,[]);
    console.log('PASS_'+label.toUpperCase().replaceAll('-','_')+' '+JSON.stringify(s));
   }finally{await context.close()}
  }
 }finally{await browser.close()}
});
