'use strict';
// Actual WebGL evidence for the user's regression: toast must be IN Hanna's hand,
// never fixed behind her back. Uses legitimate saved step6, then two real actions.
const {test}=require('node:test'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('artifacts/hanna-v2-r13-objects');fs.mkdirSync(out,{recursive:true});
test('R13 Android: take toast -> carry in right hand -> lower onto plate',{timeout:300000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 const context=await browser.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true,deviceScaleFactor:1,serviceWorkers:'block'});
 await context.addInitScript(()=>{
  localStorage.setItem('hanna_kitchen_v2_quality','baixo');
  localStorage.setItem('hanna_kitchen_v2_progress',JSON.stringify({schema:2,step:6,updated:Date.now()}));
 });
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const state=()=>page.evaluate(()=>window.__hannaKitchenQA);
 try{
  await page.goto('http://127.0.0.1:8765/v2/index.html',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.ready||document.querySelector('#loadDetail')?.dataset.error==='1',null,{timeout:120000});
  assert.notEqual(await page.locator('#loadDetail').getAttribute('data-error'),'1');
  assert.equal((await state()).step,6);
  await page.locator('#goBtn').tap();
  await page.waitForFunction(()=>window.__hannaKitchenQA?.step===6&&window.__hannaKitchenQA?.distance<.73,null,{timeout:100000});
  await page.locator('#actionBtn').tap();
  await page.waitForFunction(()=>window.__hannaKitchenQA?.step===7,null,{timeout:30000});
  const held=await state();
  console.log('R13_TOAST_IN_HAND',JSON.stringify({step:held.step,held:held.held,parent:held.carryParent,palmDistance:held.propHandDistance}));
  assert.equal(held.held,'toast');
  assert.equal(held.carryParent,'ArmRightPivot');
  assert.ok(held.propHandDistance<.23,'Toast still misplaced: '+JSON.stringify(held));
  assert.ok(held.heldFrontOffset>.035,'Toast must be IN FRONT of Hanna, not on her back: '+JSON.stringify(held));
  await page.screenshot({path:path.join(out,'01-torrada-na-mao.png')});
  await page.locator('#goBtn').tap();
  await page.waitForFunction(()=>window.__hannaKitchenQA?.step===7&&window.__hannaKitchenQA?.distance<.73,null,{timeout:100000});
  await page.screenshot({path:path.join(out,'02-torrada-chegou-na-mesa.png')});
  await page.locator('#actionBtn').tap();
  await page.waitForFunction(()=>window.__hannaKitchenQA?.step===8,null,{timeout:30000});
  const finished=await state();
  console.log('R13_TOAST_ON_TABLE',JSON.stringify({step:finished.step,held:finished.held,completed:finished.interactionsCompleted}));
  assert.equal(finished.held,'');
  assert.ok(await page.locator('#finish').isVisible());
  await page.screenshot({path:path.join(out,'03-torrada-servida.png')});
  assert.deepEqual(errors,[]);
 }finally{await context.close();await browser.close()}
});
