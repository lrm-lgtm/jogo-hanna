'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const URL='http://127.0.0.1:8765/v2/index.html';
const launch=()=>chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
async function start(browser,viewport,mobile=false){
 const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>document.getElementById('loadDetail')?.dataset.error==='1'||window.__hannaKitchenQA?.ready,null,{timeout:100000});
 const detail=await page.locator('#loadDetail').innerText();
 assert.notEqual(await page.locator('#loadDetail').getAttribute('data-error'),'1',detail);
 return {context,page,errors};
}
const qa=page=>page.evaluate(()=>window.__hannaKitchenQA);
test('v2 desktop: real Hanna model and complete eight-step mission with saved progress',{timeout:360000},async()=>{
 const browser=await launch();let s;
 try{
  s=await start(browser,{width:1280,height:720});
  const {page,errors}=s;let current=await qa(page);
  assert.equal(current.step,0);assert.equal(current.saveSchema,2);
  assert.equal(current.avatarKind,'hanna-v5-glb');
  assert.ok(current.avatarMeshCount>=80);
  assert.equal(current.modelCount,23);
  for(let step=0;step<8;step++){
   await page.locator('#goBtn').click();
   await page.waitForFunction(n=>window.__hannaKitchenQA?.step===n&&window.__hannaKitchenQA.distance<.72,step,{timeout:33000});
   await page.locator('#actionBtn').click();
   await page.waitForFunction(n=>window.__hannaKitchenQA?.step===n,step+1,{timeout:7000});
  }
  assert.equal(await page.locator('#finish').isVisible(),true);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.ready,null,{timeout:90000});
  assert.equal((await qa(page)).step,8);
  assert.deepEqual(errors,[]);
 }finally{await s?.context.close();await browser.close()}
});
test('v2 Android emulated: landscape HUD, pause and portrait rotation prompt',{timeout:160000},async()=>{
 const browser=await launch();let s;
 try{
  s=await start(browser,{width:852,height:393},true);
  const {page,errors}=s;
  assert.equal((await qa(page)).orientation,'landscape');
  await page.locator('#pauseBtn').tap();
  assert.equal(await page.locator('#settings').isVisible(),true);
  await page.locator('#resumeBtn').tap();
  assert.equal(await page.locator('#settings').isVisible(),false);
  await page.setViewportSize({width:393,height:852});
  assert.equal(await page.locator('#rotatePrompt').isVisible(),true);
  assert.equal((await qa(page)).orientation,'portrait');
  assert.deepEqual(errors,[]);
 }finally{await s?.context.close();await browser.close()}
});