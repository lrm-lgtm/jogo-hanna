'use strict';
/* Browser acceptance R15: authentic auto-path, stage and hand contact on fridge/milk/table.
 * Screenshots are made at the moment Hanna reaches and holds an object.
 */
const {test}=require('node:test'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const DIR=path.resolve('artifacts/hanna-r15-contact');fs.mkdirSync(DIR,{recursive:true});
test('R15 real mobile: approach fridge -> hand reaches handle -> grab milk -> put on table',{timeout:430000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 const ctx=await browser.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:'block'});
 await ctx.addInitScript(()=>localStorage.setItem('hanna_kitchen_v2_quality','baixo'));
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const qa=()=>page.evaluate(()=>window.__hannaKitchenQA);
 try{
  await page.goto('http://127.0.0.1:8765/v2/index.html',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.ready,null,{timeout:120000});
  let state=await qa();assert.equal(state.step,0);assert.equal(state.avatarKind,'hanna-r15-free-glb');
  for(let step=0;step<3;step++){
   await page.locator('#goBtn').tap();
   await page.waitForFunction(step=>window.__hannaKitchenQA?.step===step&&window.__hannaKitchenQA?.distance<.73,step,{timeout:90000});
   await page.locator('#actionBtn').tap();
   await page.waitForFunction(()=>window.__hannaKitchenQA?.action!==null,null,{timeout:10000});
   await page.waitForFunction(()=>window.__hannaKitchenQA?.action&&!window.__hannaKitchenQA?.interaction.approaching,null,{timeout:24000});
   await page.screenshot({path:path.join(DIR,'step-'+step+'-reaching.png')});
   await page.waitForFunction(step=>window.__hannaKitchenQA?.step===step+1,step,{timeout:26000});
   state=await qa();
   assert.equal(state.interactionsCompleted,step+1);
   assert.ok(state.interaction.stageDistance<.10,'Hanna did not reach the object staging point: '+JSON.stringify(state.interaction));
   assert.ok(state.interaction.contactError!==null&&state.interaction.contactError<.85,'hand contact target was not tracked: '+JSON.stringify(state.interaction));
   console.log('R15_CONTACT',step,JSON.stringify({gesture:state.lastActionId,contact:state.interaction,held:state.held,parent:state.carryParent}));
   if(step===1){assert.equal(state.held,'milk');assert.equal(state.carryParent,'HandRightGrip');
    await page.screenshot({path:path.join(DIR,'leite-segurado-pelo-pulso.png')});}
   if(step===2)assert.equal(state.held,'');
  }
  await page.screenshot({path:path.join(DIR,'leite-colocado-na-mesa.png')});
  assert.deepEqual(errors,[]);
 }finally{await ctx.close();await browser.close()}
});