'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const evidence=path.resolve(__dirname,'../../artifacts/kitchen-v3');
fs.mkdirSync(evidence,{recursive:true});
const url='http://127.0.0.1:8765/pilot/cozinha.html';
async function open(browser,width,height,mobile){
 const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,serviceWorkers:'block',deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:55000});
 await page.waitForFunction(()=>document.getElementById('loadDetail')?.dataset.error==='1'||window.__hannaKitchenQA?.ready,null,{timeout:105000});
 const error=await page.locator('#loadDetail').getAttribute('data-error');
 const detail=await page.locator('#loadDetail').innerText();
 assert.notEqual(error,'1','Failed loading actual 3D scene: '+detail);
 return {context,page,errors};
}
async function go(page,step){
 await page.locator('#goBtn').click();
 await page.waitForFunction(s=>window.__hannaKitchenQA?.step===s&&window.__hannaKitchenQA.distance<.72,step,{timeout:33000});
 await page.waitForFunction(()=>!document.getElementById('actionBtn').disabled,null,{timeout:4000});
}
const qa=page=>page.evaluate(()=>window.__hannaKitchenQA);
test('desktop: full eight-step kitchen mission completed by real pathfinding (no teleport)',{timeout:360000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 let session;
 try{
  session=await open(browser,1280,720,false);
  const {page,errors}=session,initial=await qa(page);
  assert.equal(initial.step,0);assert.equal(initial.orientation,'landscape');assert.equal(initial.modelCount,23);
  assert.equal(initial.avatarKind,'hanna-v5-glb');
  assert.ok(initial.avatarMeshCount>=80,'Must use REAL exported Hanna player model, not primitive placeholder');
  assert.equal(initial.hasGameplayRig,true);
  assert.deepEqual(initial.loadErrors,[]);
  await page.screenshot({path:path.join(evidence,'01-desktop-landscape.png')});
  for(let i=0;i<8;i++){
   const begin=await qa(page);
   await go(page,i);
   const reached=await qa(page);
   if(begin.distance>.8)assert.ok(Math.hypot(reached.avatar.x-begin.avatar.x,reached.avatar.z-begin.avatar.z)>.1,'Avatar failed to walk at step '+i);
   assert.equal(reached.step,i);
   if(i===0)assert.ok(reached.avatarWalkedFrames>5,'Hanna animation pivots must receive walking frames');
   await page.locator('#actionBtn').click();
   await page.waitForFunction(n=>window.__hannaKitchenQA?.step===n,i+1,{timeout:7500});
   if(i===1)await page.screenshot({path:path.join(evidence,'02-milk-in-hand.png')});
   if(i===5)await page.screenshot({path:path.join(evidence,'03-toast-ready.png')});
  }
  assert.equal(await page.locator('#finish').isVisible(),true);
  await page.screenshot({path:path.join(evidence,'04-breakfast-complete.png')});
  const done=await qa(page);
  assert.equal(done.step,8);assert.ok(Number.isFinite(done.fps)&&done.fps>=0,'headless FPS must be measurable');console.log('SOFTWARE_WEBGL_FPS='+done.fps.toFixed(2)+' (diagnostic only; physical mobile target 30 FPS)');
  assert.deepEqual(errors,[]);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.ready,null,{timeout:65000});
  assert.equal((await qa(page)).step,8,'pilot save was not restored');
 }finally{await session?.context.close();await browser.close()}
});
test('Android portrait: controls visible and first action reached by walking',{timeout:150000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 let session;
 try{
  session=await open(browser,393,852,true);
  const {page,errors}=session;
  assert.equal((await qa(page)).orientation,'portrait');
  assert.ok((await qa(page)).avatarMeshCount>=80,'portrait real 3D player loaded');
  for(const sel of ['#goBtn','#actionBtn','#joystick','.missionBox']){
   const b=await page.locator(sel).boundingBox();
   assert.ok(b&&b.x>=-2&&b.x+b.width<=395&&b.y>=-2&&b.y+b.height<=854,sel+' out of mobile screen '+JSON.stringify(b));
  }
  await page.screenshot({path:path.join(evidence,'05-android-portrait.png')});
  await go(page,0);
  await page.locator('#actionBtn').tap();
  await page.waitForFunction(()=>window.__hannaKitchenQA?.step===1,null,{timeout:8000});
  await page.screenshot({path:path.join(evidence,'06-android-fridge-open.png')});
  assert.deepEqual(errors,[]);
 }finally{await session?.context.close();await browser.close()}
});
test('Android landscape: camera responsive when viewport rotates',{timeout:150000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 let session;
 try{
  session=await open(browser,852,393,true);
  const {page,errors}=session;
  assert.equal((await qa(page)).orientation,'landscape');
  assert.ok((await qa(page)).avatarMeshCount>=80,'landscape real 3D player loaded');
  await page.screenshot({path:path.join(evidence,'07-android-landscape.png')});
  await page.setViewportSize({width:393,height:852});
  await page.waitForTimeout(600);
  assert.equal((await qa(page)).orientation,'portrait');
  const b=await page.locator('#actionBtn').boundingBox();
  assert.ok(b&&b.x+b.width<=395);
  assert.deepEqual(errors,[]);
 }finally{await session?.context.close();await browser.close()}
});
