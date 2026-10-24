const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const path=require('node:path'),{chromium}=require('playwright');
const evidence=path.join(__dirname,'evidence');fs.mkdirSync(evidence,{recursive:true});
test('real rigged modified CC0 model with stylized Hanna clothes loads in Babylon', {timeout:210000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 try{
  for(const [label,viewport,mobile] of [['desktop',{width:1120,height:740},false],['portrait',{width:393,height:852},true]]){
   const ctx=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,serviceWorkers:'block'});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/r6-cc0-base/index.html?candidate=r8',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>{const q=window.__hannaR6QA?.();return q&&(q.ready||q.error)},null,{timeout:100000});
   const q=await page.evaluate(()=>window.__hannaR6QA());
   assert.equal(q.error,'','R8 visual model import failed: '+q.error);
   assert.equal(q.candidate,'hanna-r8.glb');
   assert.ok(q.meshes>=8,'Missing skinned geometry/customized accessories');
   assert.ok(q.bones>=100,'Real skinned rig must be kept after Blender customization');
   await page.screenshot({path:path.join(evidence,label+'-r8-customized.png')});
   await page.locator('#rotate').click();
   await page.waitForFunction(()=>window.__hannaR6QA().spinning);
   assert.deepEqual(errors,[]);
   console.log('R8_STYLED_GLTF_READY '+JSON.stringify(q));
   await ctx.close();
  }
 }finally{await browser.close()}
});