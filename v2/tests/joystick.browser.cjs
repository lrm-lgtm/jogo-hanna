'use strict';
/* Real mobile touch gestures, actual Babylon world motion: don't equate clickable
 * joystick artwork with working controls. Requires Chrome CDP pointer dispatch.
 */
const test=require('node:test'),a=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const DIR=path.resolve('artifacts/hanna-v2-joystick');
fs.mkdirSync(DIR,{recursive:true});
const URL='http://127.0.0.1:8765/v2/index.html';
const movement=(p,q)=>({x:q.avatar.x-p.avatar.x,z:q.avatar.z-p.avatar.z});
const length=v=>Math.hypot(v.x,v.z);
const dot=(a,b)=>a.x*b.x+a.z*b.z;
test('Android 360° touch: deadzone, right/left, up/down, release and pause',{timeout:270000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 const ctx=await browser.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:'block'});
 await ctx.addInitScript(()=>localStorage.setItem('hanna_kitchen_v2_quality','baixo'));
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const qa=()=>page.evaluate(()=>window.__hannaKitchenQA);
 try{
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__hannaKitchenQA?.ready||document.getElementById('loadDetail')?.dataset.error==='1',null,{timeout:115000});
  a.notEqual(await page.locator('#loadDetail').getAttribute('data-error'),'1',await page.locator('#loadDetail').innerText());
  const joy=await page.locator('#joystick').boundingBox();
  a.ok(joy?.width>=84,'joystick must have >=84px hit target on landscape');
  const x=joy.x+joy.width/2,y=joy.y+joy.height/2,range=joy.width*.40;
  const cdp=await ctx.newCDPSession(page);
  async function touch(dx,dy,hold=700){
   const t=(px,py)=>[{x:px,y:py,id:42,radiusX:6,radiusY:6,force:.8}];
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:t(x,y)});
   await page.waitForTimeout(90);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:t(x+dx,y+dy)});
   await page.waitForTimeout(hold);
   const inside=await qa();
   if(Math.hypot(dx,dy)>8)await page.screenshot({path:path.join(DIR,'em-movimento-'+(dx>8?'direita':dx< -8?'esquerda':dy<0?'frente':'tras')+'.png')});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await page.waitForTimeout(190);
   const after=await qa();
   a.equal(after.joystick.active,false,'touch release must reset active pointer');
   a.equal(after.joystick.x,0);
   a.equal(after.joystick.y,0);
   return {inside,after};
  }
  let start=await qa();
  a.equal(start.joystick.active,false);
  a.ok(start.cutawayHidden?.includes('leftWall'),'foreground side wall must not obscure Hanna');
  a.ok(start.cameraFrame?.visible,'Hanna head must initially be within the camera safe area: '+JSON.stringify(start.cameraFrame));
  await touch(2,2,450);
  let now=await qa();
  a.ok(length(movement(start,now))<.08,'jitter in the dead zone must not run at full speed');
  a.ok(now.manualMeters-start.manualMeters<.08,'center tap must not move the avatar');
  // Test opposing screen directions from the same contiguous safe room.
  const directions=[];
  for(const [name,dx,dy] of [['right',range,0],['left',-range,0],['up',0,-range],['down',0,range]]){
   const prev=await qa();
   const gesture=await touch(dx,dy,770);
   const next=gesture.after;
   const held=gesture.inside;
   a.ok(held.frontAxis?.confidence>.09,'front axis must be measured from GLB eyes');
   a.ok(held.faceDot>.8,name+' must look where Hanna travels: '+JSON.stringify({front:held.frontAxis,world:held.worldFace,dot:held.faceDot}));
   a.ok(held.gait?.peakHip>.20,name+' actual hip animation must be visible');
   a.ok(held.gait?.peakKnee>.20,name+' knees must flex via GLB joints');
   a.ok(held.gait?.realKneeDeg>10,name+' Babylon joint quaternion must visibly bend the knees');
   a.ok(held.gait?.realHipDeg>12,name+' Babylon joint quaternion must visibly swing the hips');
   a.ok(held.gait?.blend>.3,name+' gait must be active while finger is held');
   a.ok(held.gait?.distance>.15,name+' gait phase must follow traveled meters');
   a.ok(next.cameraFrame?.visible,name+' moved Hanna outside frame: '+JSON.stringify(next.cameraFrame));
   const v=movement(prev,next);
   a.ok(length(v)>.11,name+' must move Hanna in the world, not only animate the knob: '+JSON.stringify(v));
   directions.push(v);
   console.log('REAL_JOYSTICK',name,JSON.stringify({before:prev.avatar,after:next.avatar,vector:v,meters:next.manualMeters-prev.manualMeters,heldAxis:gesture.inside.joystick}));
   await page.screenshot({path:path.join(DIR,name+'.png')});
  }
  a.ok(dot(directions[0],directions[1])<-.007,'right/left should oppose, not rotate in place');
  a.ok(dot(directions[2],directions[3])<-.007,'up/down should oppose, not rotate in place');
  // Lost touches must not leave the avatar running after UI is paused.
  await page.locator('#pauseBtn').tap();
  a.equal((await qa()).joystick.active,false);
  a.equal(await page.locator('#settings').isVisible(),true);
  await page.locator('#resumeBtn').tap();
  await page.screenshot({path:path.join(DIR,'final-android.png')});
  a.deepEqual(errors,[]);
 }finally{await ctx.close();await browser.close()}
});