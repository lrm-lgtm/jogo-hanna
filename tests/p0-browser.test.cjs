/* End-to-end: execute real Babylon.js browser code, not a mocked interaction function. */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const ROOT='http://127.0.0.1:8765/';
const ARTIFACTS=path.join(__dirname,'../artifacts/p0-browser');
fs.mkdirSync(ARTIFACTS,{recursive:true});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function saveStart(mission=9,step=0) {
 return {schema:2,missionIndex:mission,step,coins:0,stars:0,completed:[],achievements:[],gameHour:19.5};
}
async function openGame(browser,{mobile=false,mission=9}={}) {
 const context=await browser.newContext(mobile
   ? { viewport:{width:844,height:390},isMobile:true,hasTouch:true,
       userAgent:'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36',
       serviceWorkers:'block'}
   : {viewport:{width:1280,height:720},serviceWorkers:'block'});
 await context.addInitScript(({state})=>{
   try{
    if(location.hostname!=='127.0.0.1')return;
    localStorage.setItem('jogo_hanna_v11_save',JSON.stringify(state));
    localStorage.setItem('hanna_mission',String(state.missionIndex));
    localStorage.setItem('hanna_step',String(state.step));
    localStorage.setItem('hanna_audio','0');
    localStorage.setItem('hanna_quality','eco');
   }catch(e){}
 },{state:saveStart(mission)});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(ROOT,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>{
   const scene=window.BABYLON?.EngineStore?.LastCreatedScene;
   return !!scene?.getMeshByName('curtainTarget') &&
          document.getElementById('loading')?.style.display==='none';
 },null,{timeout:90000});
 await page.locator('#playBtn').click();
 await page.waitForFunction(()=>getComputedStyle(document.getElementById('start')).display==='none');
 return {context,page,errors};
}
async function placePlayer(page,x,z) {
 await page.evaluate(([x,z])=>{
   const scene=BABYLON.EngineStore.LastCreatedScene;
   const player=scene.getTransformNodeByName('player');
   const collider=scene.getMeshByName('playerCollider');
   if(!player||!collider)throw new Error('Player/collider unavailable');
   player.position.x=collider.position.x=x;
   player.position.z=collider.position.z=z;
 },[x,z]);
 await page.waitForTimeout(120);
}
async function saved(page) {
 return page.evaluate(()=>JSON.parse(localStorage.getItem('jogo_hanna_v11_save')||'null'));
}
async function use(page) {
 await page.locator('#useBtn').click({timeout:7000});
}
async function stepReached(page,expected) {
 await page.waitForFunction(n=>{
   const s=JSON.parse(localStorage.getItem('jogo_hanna_v11_save')||'{}');
   return s.missionIndex===9&&s.step===n;
 },expected,{timeout:13000});
}
async function sceneState(page) {
 return page.evaluate(()=>{
  const sc=BABYLON.EngineStore.LastCreatedScene;
  return {
    curtainL:sc.meshes.filter(m=>m.name==='curtainL').at(-1)?.position.x,
    curtainR:sc.meshes.filter(m=>m.name==='curtainR').at(-1)?.position.x,
    lampMaterial:sc.getMeshByName('nightLamp')?.material?.name,
    lampIntensity:sc.getLightByName('nightLight')?.intensity,
    blanketY:sc.getMeshByName('sleepBlanket')?.position.y
  };
 });
}
async function snapshot(page,name) {
 await page.screenshot({path:path.join(ARTIFACTS,name+'.png'),timeout:15000,animations:'disabled'});
}
test('desktop browser completes Hora de Dormir using real USAR actions', {timeout:180000}, async()=>{
 const browser=await chromium.launch({headless:true,args:[
   '--no-sandbox','--enable-webgl','--ignore-gpu-blocklist',
   '--use-gl=angle','--use-angle=swiftshader-webgl'
 ]});
 let ctx;
 try{
   const session=await openGame(browser);
   ctx=session.context;
   const {page,errors}=session;
   assert.match(await page.locator('#missionTitle').innerText(),/HORA DE DORMIR/);
   await snapshot(page,'01-before-curtain');
   await placePlayer(page,-5.2,3.45);
   await use(page);
   await stepReached(page,1);
   let state=await sceneState(page);
   assert.ok(Math.abs(state.curtainL+5.55)<0.05,'left curtain should close');
   assert.ok(Math.abs(state.curtainR+4.85)<0.05,'right curtain should close');
   await snapshot(page,'02-curtain-closed');
   await placePlayer(page,-4.35,2.9);
   await use(page);
   await stepReached(page,2);
   state=await sceneState(page);
   assert.ok(state.lampIntensity>0.5,'lamp should visibly light');
   await placePlayer(page,-5.2,0.83);
   await use(page);
   await stepReached(page,3);
   state=await sceneState(page);
   assert.ok(state.blanketY>.80,'blanket should visually move');
   await placePlayer(page,-5.2,0.92);
   await use(page);
   await stepReached(page,4);
   await use(page);
   await stepReached(page,5);
   await page.waitForFunction(()=>getComputedStyle(document.getElementById('celebrate')).display==='flex',null,{timeout:8000});
   const save=await saved(page);
   assert.equal(save.coins,45);
   assert.equal(save.stars,1);
   assert.ok(save.completed.includes('HORA DE DORMIR'));
   await snapshot(page,'03-goodnight-complete');
   assert.deepEqual(errors,[],'uncaught JS errors');
 }finally{await ctx?.close();await browser.close()}
});
test('desktop arrows/WASD follow current camera view at four headings', {timeout:180000}, async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 let ctx;
 try{
  const session=await openGame(browser,{mission:0});
  ctx=session.context;
  const {page}=session;
  for(const alpha of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
    for(const [key,component,sign] of [
      ['ArrowRight','x',1],['ArrowLeft','x',-1],
      ['ArrowUp','y',1],['ArrowDown','y',-1],
      ['KeyD','x',1],['KeyA','x',-1],['KeyW','y',1],['KeyS','y',-1]
    ]){
      await placePlayer(page,0,-2.6);
      const before=await page.evaluate(alpha=>{
        const scene=BABYLON.EngineStore.LastCreatedScene;
        const camera=scene.activeCamera;
        camera.alpha=alpha;camera.inertialAlphaOffset=0;
        camera.getViewMatrix(true);
        const player=scene.getTransformNodeByName('player');
        return {x:player.position.x,z:player.position.z};
      },alpha);
      const name=key.startsWith('Key')?key.slice(3).toLowerCase():key;
      await page.keyboard.down(name);
      await page.waitForTimeout(160);
      await page.keyboard.up(name);
      const screen=await page.evaluate(before=>{
        const sc=BABYLON.EngineStore.LastCreatedScene;
        const p=sc.getTransformNodeByName('player').position;
        const view=sc.activeCamera.getViewMatrix();
        const d=BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(p.x-before.x,0,p.z-before.z),view);
        return {x:d.x,y:d.y,length:Math.hypot(d.x,d.y,d.z)};
      },before);
      assert.ok(screen.length>0.045,`${key} should move at camera ${alpha}: ${JSON.stringify(screen)}`);
      assert.ok(screen[component]*sign>0.022,`${key} wrong on-screen ${component} at camera ${alpha}: ${JSON.stringify(screen)}`);
    }
  }
 }finally{await ctx?.close();await browser.close()}
});
test('Android touch joystick right moves right on-screen', {timeout:140000}, async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 let ctx;
 try{
  const session=await openGame(browser,{mobile:true,mission:0});
  ctx=session.context;
  const {page}=session;
  await placePlayer(page,0,-2.6);
  const before=await page.evaluate(()=>{
   const s=BABYLON.EngineStore.LastCreatedScene;
   const p=s.getTransformNodeByName('player').position;
   return {x:p.x,z:p.z};
  });
  const rect=await page.locator('#joystick').boundingBox();
  assert.ok(rect?.width>0,'touch joystick should be visible');
  const x=rect.x+rect.width/2+Math.min(28,rect.width/3),y=rect.y+rect.height/2;
  const cdps=await ctx.newCDPSession(page);
  await cdps.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
  await page.waitForTimeout(280);
  await cdps.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const screen=await page.evaluate(before=>{
   const sc=BABYLON.EngineStore.LastCreatedScene;
   const p=sc.getTransformNodeByName('player').position;
   const v=BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(p.x-before.x,0,p.z-before.z),sc.activeCamera.getViewMatrix());
   return {x:v.x,y:v.y,length:Math.hypot(v.x,v.y,v.z)};
  },before);
  assert.ok(screen.length>0.04 && screen.x>0.025,`touch joystick should move screen-right: ${JSON.stringify(screen)}`);
  await snapshot(page,'04-android-joystick');
 }finally{await ctx?.close();await browser.close()}
});
