'use strict';
/* Regression for 24/10/2026 real Samsung video: looping fridge door and floating toast.
 * Inspect rendered Babylon state, not just pure animation constants.
 */
const {test}=require('node:test'),a=require('node:assert/strict');
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const DIR=path.resolve('artifacts/hanna-v2-r14-object-proof');
fs.mkdirSync(DIR,{recursive:true});
const URL='http://127.0.0.1:8765/v2/index.html';
test('real WebGL: fridge opens exactly once and stays open after mission transitions',{timeout:260000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 const ctx=await browser.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:'block'});
 await ctx.addInitScript(()=>localStorage.setItem('hanna_kitchen_v2_quality','baixo'));
 const page=await ctx.newPage();
 const q=()=>page.evaluate(()=>window.__hannaKitchenQA);
 try{
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.ready,null,{timeout:120000});
  let start=await q();a.equal(start.step,0);a.equal(start.doorRenderedAngle,0);
  a.equal(start.fridgeSolidEnabled,false);
  a.equal(start.fridgeInteriorPresent,true);
  await page.locator('#goBtn').tap();
  await page.waitForFunction(()=>window.__hannaKitchenQA?.distance<.73,null,{timeout:90000});
  await page.locator('#actionBtn').tap();
  await page.waitForFunction(()=>window.__hannaKitchenQA?.step===1,null,{timeout:16000});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.objectMotion.door.playing===false&&window.__hannaKitchenQA?.objectMotion.door.plays===1,null,{timeout:15000});
  const opened=await q();
  a.equal(opened.objectMotion.door.plays,1);
  a.equal(opened.fridgeShelvesVisible,true);
  a.equal(opened.fridgeSolidEnabled,false);
  a.ok(Math.abs(opened.doorRenderedAngle+1.28)<.012);
  await page.screenshot({path:path.join(DIR,'geladeira-abriu-uma-vez.png')});
  await page.waitForTimeout(2900);
  const remained=await q();
  a.equal(remained.objectMotion.door.plays,1,'must not restart animation');
  a.equal(remained.objectMotion.door.playing,false);
  a.ok(Math.abs(remained.doorRenderedAngle+1.28)<.012,'no recurring open-close loop');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.ready,null,{timeout:120000});
  const restored=await q();
  a.equal(restored.step,1);a.ok(Math.abs(restored.doorRenderedAngle+1.28)<.012);
  a.equal(restored.objectMotion.door.plays,0,'restored save starts settled, not replaying');
  console.log('R14_DOOR_STAYS_OPEN',JSON.stringify({opened:opened.doorRenderedAngle,remained:remained.doorRenderedAngle,restored:restored.doorRenderedAngle,plays:remained.objectMotion.door.plays}));
 }finally{await ctx.close();await browser.close()}
});
test('real WebGL: toast emerges from inside slot and never floats above its anchor',{timeout:250000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 const ctx=await browser.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:'block'});
 await ctx.addInitScript(()=>{
  localStorage.setItem('hanna_kitchen_v2_quality','baixo');
  localStorage.setItem('hanna_kitchen_v2_progress',JSON.stringify({schema:2,step:5,updated:Date.now()}));
 });
 const page=await ctx.newPage(),q=()=>page.evaluate(()=>window.__hannaKitchenQA);
 try{
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.ready,null,{timeout:120000});
  const start=await q();a.equal(start.step,5);a.equal(start.toastReadyVisible,false);
  await page.locator('#goBtn').tap();
  await page.waitForFunction(()=>window.__hannaKitchenQA?.distance<.73,null,{timeout:90000});
  await page.locator('#actionBtn').tap();
  await page.waitForFunction(()=>window.__hannaKitchenQA?.step===6,null,{timeout:16000});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.objectMotion.toast.playing===false&&window.__hannaKitchenQA?.objectMotion.toast.plays===1,null,{timeout:12000});
  const fired=await q();
  a.equal(fired.toastReadyVisible,true);
  a.equal(fired.objectMotion.toast.plays,1);
  a.ok(fired.toastBottomY<fired.toasterSlotY-.06,'toast bottom must be INSIDE toaster, not floating: '+JSON.stringify(fired));
  a.ok(fired.toastTopY>fired.toasterSlotY+.08,'a small top part must emerge from slot: '+JSON.stringify(fired));
  await page.screenshot({path:path.join(DIR,'torrada-encaixada-no-slot.png')});
  await page.waitForTimeout(2400);
  const stable=await q();
  a.equal(stable.objectMotion.toast.plays,1);
  a.equal(stable.objectMotion.toast.playing,false);
  a.equal(stable.toastBottomY,fired.toastBottomY);
  console.log('R14_TOAST_ANCHORED',JSON.stringify({slot:fired.toasterSlotY,top:fired.toastTopY,bottom:fired.toastBottomY,plays:stable.objectMotion.toast.plays}));
 }finally{await ctx.close();await browser.close()}
});
test('R16 real WebGL: door closes after milk pickup and stays closed upon reload',{timeout:280000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 const ctx=await browser.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 await ctx.addInitScript(()=>{
  localStorage.setItem('hanna_kitchen_v2_quality','baixo');
  localStorage.setItem('hanna_kitchen_v2_progress',JSON.stringify({schema:2,step:1,updated:Date.now()}));
 });
 const page=await ctx.newPage(),q=()=>page.evaluate(()=>window.__hannaKitchenQA);
 try{
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.ready,null,{timeout:120000});
  a.equal((await q()).doorRenderedAngle,1.44);
  await page.locator('#goBtn').tap();
  await page.waitForFunction(()=>window.__hannaKitchenQA?.distance<.73,null,{timeout:90000});
  await page.locator('#actionBtn').tap();
  await page.waitForFunction(()=>window.__hannaKitchenQA?.step===2,null,{timeout:40000});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.objectMotion.doorClose.plays===1&&!window.__hannaKitchenQA?.objectMotion.doorClose.playing,null,{timeout:20000});
  const end=await q();a.equal(end.doorRenderedAngle,0);a.equal(end.objectMotion.doorClose.plays,1);
  a.equal(end.fridgeShelvesVisible,false);
  await page.screenshot({path:path.join(DIR,'porta-fechou-apos-leite.png')});
  await page.waitForTimeout(1300);a.equal((await q()).doorRenderedAngle,0);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.ready,null,{timeout:120000});
  a.equal((await q()).doorRenderedAngle,0);
 }finally{await ctx.close();await browser.close()}
});
