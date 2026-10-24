'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const screenshots=path.resolve(__dirname,'../../artifacts/kitchen-v2');fs.mkdirSync(screenshots,{recursive:true});
const URL='http://127.0.0.1:8765/v2/index.html';
const launch=()=>chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
async function start(browser,viewport,mobile=false){
 const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
 // Browser mission validates gameplay logic at CSS-pixel resolution; separate
 // snapshot suite audits true DPR=3 and higher-resolution graphic fidelity.
 await context.addInitScript(()=>localStorage.setItem('hanna_kitchen_v2_quality','baixo'));
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>document.getElementById('loadDetail')?.dataset.error==='1'||window.__hannaKitchenQA?.ready,null,{timeout:100000});
 const detail=await page.locator('#loadDetail').innerText();
 assert.notEqual(await page.locator('#loadDetail').getAttribute('data-error'),'1',detail);
 return {context,page,errors};
}
const qa=page=>page.evaluate(()=>window.__hannaKitchenQA);
test('v2 desktop: real Hanna model and complete eight-step mission with saved progress',{timeout:540000},async()=>{
 const browser=await launch();let s;
 try{
  s=await start(browser,{width:1280,height:720});
  const {page,errors}=s;let current=await qa(page);
  assert.equal(current.step,0);assert.equal(current.saveSchema,2);
  assert.equal(current.avatarKind,'hanna-r12-free-glb');
  assert.ok(current.blinkMeshCount>=8,'real facial eye meshes are animated');
  assert.ok(current.avatarMeshCount>=80);
  assert.ok(current.frontAxis?.confidence>.09,'face-forward vector must be measured from actual GLB');
  assert.equal(current.artPass,'r2-blender');
  assert.ok(current.gltfMeshCount>=45,'real imported Blender furniture must be present');
  assert.equal(current.cameraMode,0,'third-person perspective mode');
  assert.ok(current.cameraBeta>1.1,'camera should not be top-down');
  assert.ok(current.cameraRadius<6,'camera should feature playable Hanna, not aerial dollhouse');
  assert.ok(current.cutawayHidden.includes('leftWall'),'side wall must not block character/camera');
  assert.ok(current.cameraFrame?.visible,'character must start visibly framed: '+JSON.stringify(current.cameraFrame));
  await page.screenshot({path:path.join(screenshots,'desktop-inicial.png')});
  assert.equal(current.modelCount,current.quality==='baixo'?19:23); // decorative kit assets are intentionally skipped in low mode
  for(let step=0;step<8;step++){
   await page.locator('#goBtn').click();
   await page.waitForFunction(n=>window.__hannaKitchenQA?.step===n&&window.__hannaKitchenQA.distance<.72,step,{timeout:33000});
   // One extra render permits the camera to settle on SwiftShader CPU at low FPS.
   await page.waitForTimeout(500);
   const approach=await qa(page);
   assert.ok(approach.cameraFrame?.visible,'Hanna obscured or outside camera frame at step '+step+': '+JSON.stringify(approach.cameraFrame));
   if(step===0)await page.screenshot({path:path.join(screenshots,'fridge-approach.png')});
   if(step===4)await page.screenshot({path:path.join(screenshots,'toaster-approach.png')});
   if(step===7)await page.screenshot({path:path.join(screenshots,'table-approach.png')});
   await page.locator('#actionBtn').click();
   await page.waitForFunction(n=>window.__hannaKitchenQA?.step===n,step+1,{timeout:7000});
  }
  assert.equal(await page.locator('#finish').isVisible(),true);
  await page.screenshot({path:path.join(screenshots,'cafe-completo.png')});
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
  await page.screenshot({path:path.join(screenshots,'android-paisagem.png')});
  await page.locator('#pauseBtn').tap();
  assert.equal(await page.locator('#settings').isVisible(),true);
  await page.locator('#resumeBtn').tap();
  assert.equal(await page.locator('#settings').isVisible(),false);
  await page.setViewportSize({width:393,height:852});
  assert.equal(await page.locator('#rotatePrompt').isVisible(),true);
  await page.screenshot({path:path.join(screenshots,'android-girar-tela.png')});
  assert.equal((await qa(page)).orientation,'portrait');
  assert.deepEqual(errors,[]);
 }finally{await s?.context.close();await browser.close()}
});
test('v2 offline: second opening loads local Babylon, avatar and kitchen after SW cache',{timeout:300000},async()=>{
 const browser=await launch();let s;
 try{
  s=await start(browser,{width:960,height:540});
  const {context,page,errors}=s;
  await page.waitForFunction(()=>navigator.serviceWorker?.controller!==null,null,{timeout:120000});
  await page.waitForFunction(async()=>{
   const names=await caches.keys(),key=names.find(k=>k.startsWith('hanna-kitchen-v2-'));
   if(!key)return false;
   const cache=await caches.open(key);
   const refs=['./index.html','./vendor/babylon.js','./vendor/babylonjs.loaders.min.js','./assets/hanna-free-r8.glb'];
   return (await Promise.all(refs.map(r=>cache.match(new URL(r,document.baseURI))))).every(Boolean);
  },null,{timeout:120000});
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.ready,null,{timeout:100000});
  assert.equal((await qa(page)).avatarKind,'hanna-r12-free-glb');
  assert.deepEqual((await qa(page)).loadErrors,[]);
  await page.screenshot({path:path.join(screenshots,'retorno-offline.png')});
  assert.deepEqual(errors,[]);
 }finally{await s?.context.close();await browser.close()}
});
