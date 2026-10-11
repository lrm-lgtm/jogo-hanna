/* Real browser first-action smoke for every mission; avoids false confidence from static IDs. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {mkdirSync}=require('node:fs');
const {join}=require('node:path');
const artifacts=join(__dirname,'../artifacts/p1-browser');
mkdirSync(artifacts,{recursive:true});
const mainTargets=['fridgeDoor','foodBag','babyBottle','toyBall','canBody','dirtyPlate','looseCush1','toyBall','cleaningCloth','curtainTarget'];
const extraTargets=['v14_toothbrush','v14_soap','v14_shirt','v14_yardCan','v14_yardBall','v14_shampoo'];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
test('all 16 missions: real page, real target, real USAR, first step progresses', {timeout:540000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 const ctx=await browser.newContext({viewport:{width:1280,height:720},serviceWorkers:'block'});
 await ctx.addInitScript(()=>{try{localStorage.setItem('hanna_audio','0');localStorage.setItem('hanna_quality','eco')}catch{}});
 const page=await ctx.newPage();
 const results=[];
 async function ready(){
  await page.waitForFunction(()=>{
   const sc=window.BABYLON?.EngineStore?.LastCreatedScene;
   return !!sc?.getTransformNodeByName('player')&&
          document.getElementById('loading')?.style.display==='none';
  },null,{timeout:80000});
 }
 async function openMission(index,extra){
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:60000});
  await ready();
  await page.evaluate(({i,e})=>{
   localStorage.setItem('jogo_hanna_v11_save',JSON.stringify({
     schema:2,missionIndex:e?0:i,step:0,coins:0,stars:0,completed:[],achievements:[],gameHour:8
   }));
   localStorage.setItem('hanna_mission',String(e?0:i));
   localStorage.setItem('hanna_step','0');
   localStorage.setItem('hanna_v14_extra',JSON.stringify({m:e?i:0,s:0,c:0,d:[]}));
  },{i:index,e:extra});
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await ready();
  await page.locator(extra?'#extrasBtn':'#playBtn').click({timeout:10000});
  if(extra)await page.waitForFunction(()=>document.getElementById('missionTitle')?.textContent?.startsWith('EXTRA:'),null,{timeout:10000});
 }
 async function useTarget(name){
  const target=await page.evaluate(name=>{
   const sc=BABYLON.EngineStore.LastCreatedScene;
   const mesh=sc.getMeshByName(name);
   if(!mesh)return null;
   const p=mesh.getAbsolutePosition();
   const player=sc.getTransformNodeByName('player');
   const collider=sc.getMeshByName('playerCollider');
   player.position.x=collider.position.x=p.x;
   player.position.z=collider.position.z=p.z-.45;
   return {x:p.x,z:p.z,name:mesh.name,enabled:mesh.isEnabled(),visible:mesh.isVisible};
  },name);
  assert.ok(target,`mesh target ${name} missing`);
  await page.waitForTimeout(160);
  await page.locator('#useBtn').click({timeout:10000});
  return target;
 }
 try{
  for(const [kind,names] of [['main',mainTargets],['extra',extraTargets]]){
   for(let i=0;i<names.length;i++){
    await openMission(i,kind==='extra');
    const title=await page.locator('#missionTitle').innerText();
    const target=await useTarget(names[i]);
    let passed=false,detail='';
    try{
      await page.waitForFunction(({isExtra})=>{
       if(isExtra){
        const state=JSON.parse(localStorage.getItem('hanna_v14_extra')||'{}');
        return state.s===1;
       }
       const state=JSON.parse(localStorage.getItem('jogo_hanna_v11_save')||'{}');
       return state.step===1;
      },{isExtra:kind==='extra'},{timeout:5500});
      passed=true;
    }catch(e){
      detail=(await page.locator('#near').innerText().catch(()=>''))+' | '+(await page.locator('#instruction').innerText().catch(()=>'')); 
    }
    results.push({kind,index:i+1,title,target:target.name,passed,detail});
    console.log(`MISSION FIRST ACTION ${kind} ${i+1}/${names.length}: ${passed?'PASS':'FAIL'} ${title} ${target.name} ${detail}`);
    if(!passed){
      await page.screenshot({path:join(artifacts,`FAIL-${kind}-${i+1}.png`),timeout:12000}).catch(()=>{});
    }
    if(i===0)await page.screenshot({path:join(artifacts,`FIRST-${kind}.png`),timeout:12000}).catch(()=>{});
   }
  }
  const failures=results.filter(x=>!x.passed);
  assert.equal(failures.length,0,'first steps unable to advance: '+JSON.stringify(failures));
 }finally{
  await page.close().catch(()=>{});
  await ctx.close().catch(()=>{});
  await browser.close().catch(()=>{});
 }
});
