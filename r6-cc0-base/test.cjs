const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const path=require('node:path'),{chromium}=require('playwright');
const evidence=path.join(__dirname,'evidence');fs.mkdirSync(evidence,{recursive:true});
test('open independent CC0 rigged character in desktop and Android viewport', {timeout:220000},async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader-webgl']});
 try{
  for(const [label,viewport,mobile] of [['desktop',{width:1120,height:740},false],['portrait',{width:393,height:852},true]]){
   const ctx=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,serviceWorkers:'block'});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/r6-cc0-base/index.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>{const q=window.__hannaR6QA?.();return q&&(q.ready||q.error)},null,{timeout:95000});
   const q=await page.evaluate(()=>window.__hannaR6QA());
   assert.equal(q.error,'','GLB did not render: '+q.error);assert.equal(q.ready,true);
   assert.ok(q.meshes>=5,'insufficient meshes '+q.meshes);
   await page.screenshot({path:path.join(evidence,label+'-cc0-vroid.png')});
   await page.locator('#rotate').click();
   await page.waitForFunction(()=>window.__hannaR6QA().spinning);
   assert.deepEqual(errors,[]);
   console.log('R6_BASE_LOAD_OK '+JSON.stringify(q));
   await ctx.close();
  }
 }finally{await browser.close()}
});