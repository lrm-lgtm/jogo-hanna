'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const p=path.resolve('artifacts/hanna-v2-art');fs.mkdirSync(p,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 try{
  for(const [label,width,height,mobile] of [['desktop',1280,720,false],['android-paisagem',852,393,true]]){
   const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1,serviceWorkers:'block'});
   const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/v2/index.html',{waitUntil:'domcontentloaded',timeout:60000});
   try{await page.waitForFunction(()=>window.__hannaKitchenQA?.ready||document.getElementById('loadDetail')?.dataset.error==='1',null,{timeout:100000})}
   catch(err){await page.screenshot({path:path.join(p,label+'-loader-falha.png')});throw err}
   if(await page.locator('#loadDetail').getAttribute('data-error')==='1'){
    await page.screenshot({path:path.join(p,label+'-erro.png')});
    throw Error('3D failed: '+await page.locator('#loadDetail').innerText());
   }
   const qa=await page.evaluate(()=>window.__hannaKitchenQA);
   console.log('SNAPSHOT',label,JSON.stringify(qa));
   if(mobile){
    if(qa.dpr!==3)throw Error('Pixel ratio emulation absent: '+qa.dpr);
    if(qa.bufferWidth/qa.cssWidth<1.7)throw Error('Low resolution Android framebuffer: '+JSON.stringify(qa));
   }
   if(qa.artPass!=='r2-blender'||qa.gltfMeshCount<45)throw Error('R2 Blender GLB not loaded: '+JSON.stringify(qa));
   await page.waitForTimeout(1300);
   await page.screenshot({path:path.join(p,label+'.png')});
   if(errors.length)throw Error('JS errors: '+errors.join(';'));
   await ctx.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
