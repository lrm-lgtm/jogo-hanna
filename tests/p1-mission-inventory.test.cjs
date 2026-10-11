/* Audit both mission catalogs without changing gameplay or player saves. */
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const core=fs.readFileSync(path.join(root,'src/core-game.js'),'utf8');
const extra=fs.readFileSync(path.join(root,'v14-world.js'),'utf8');
function literalArray(src) {
 const marker='const missions=[';
 const start=src.indexOf(marker);
 assert.ok(start>=0,'mission array not found');
 const begin=start+marker.length-1;
 let quote='',escape=false,depth=0,end=-1;
 for(let i=begin;i<src.length;i++){
  const c=src[i];
  if(quote){
    if(escape){escape=false;continue}
    if(c==='\\'){escape=true;continue}
    if(c===quote)quote='';
    continue;
  }
  if(c==="'"||c==='"'||c==='`'){quote=c;continue}
  if(c==='[')depth++;
  if(c===']'){depth--;if(depth===0){end=i;break}}
 }
 assert.ok(end>begin,'mission array unbalanced');
 return vm.runInNewContext(src.slice(begin,end+1),Object.create(null),{timeout:5000});
}
const main=literalArray(core),extras=literalArray(extra);
const report={generatedBy:'tests/p1-mission-inventory.test.cjs',main:[],extras:[],totalMissions:0,totalSteps:0};
const special=/[.*+?^${}()|[\]\\]/g;
const esc=s=>s.replace(special,'\\$&');
function validateCatalog(catalog,kind){
 const titles=new Set(),out=[];
 for(const mission of catalog){
  assert.ok(typeof mission.title==='string'&&mission.title.length>3);
  assert.ok(!titles.has(mission.title),'duplicate mission title: '+mission.title);titles.add(mission.title);
  assert.ok(Number(mission.reward)>0,'missing reward '+mission.title);
  assert.ok(mission.steps.length>=3,'not enough steps '+mission.title);
  const ids=new Set();
  const steps=mission.steps.map((step,index)=>{
   const text=kind==='main'?step.text:step[0], id=kind==='main'?step.need:step[1];
   assert.ok(typeof text==='string'&&text.length>5,'invalid text: '+mission.title+'#'+index);
   assert.ok(typeof id==='string'&&id.length>=3,'invalid id: '+mission.title+'#'+index);
   assert.ok(!ids.has(id),'repeated step id in mission '+mission.title+': '+id);
   ids.add(id);
   if(kind==='main'){
    assert.equal(typeof step.target,'function','missing target getter for '+id);
    assert.match(core,new RegExp('advance\\([^\\n]{0,240}[\\x27\\x22]'+esc(id)+'[\\x27\\x22]'),'no advance call for '+id);
   } else{
    assert.match(extra,new RegExp('\\b'+esc(id)+':'),'missing targetFor() mapping for '+id);
    assert.match(extra,new RegExp('code===\\x27'+esc(id)+'\\x27'),'missing extraInteract() branch for '+id);
   }
   return {index:index+1,text,id};
  });
  out.push({title:mission.title,stepCount:steps.length,reward:mission.reward,steps});
 }
 return out;
}
test('all 10 main missions have typed progression and selectable mission targets',()=>{
 assert.equal(main.length,10);
 report.main=validateCatalog(main,'main');
});
test('all 6 extra missions have targets and dedicated interaction branches',()=>{
 assert.equal(extras.length,6);
 report.extras=validateCatalog(extras,'extra');
});
test('main and extra save keys are isolated and mission advancement persists',()=>{
 assert.match(core,/SAVE_KEY='jogo_hanna_v11_save'/);
 assert.match(extra,/SAVE='hanna_v14_extra'/);
 assert.match(core,/function advance\(code,atMesh=null\)/);
 assert.match(core,/step\+\+;/);
 assert.match(core,/save\(\);hud\(false\)/);
 assert.match(extra,/function advance\(code\)/);
 assert.match(extra,/save\(\);updateHUD\(false\)/);
});
test('persist complete mission catalog as CI audit artifact',()=>{
 report.totalMissions=main.length+extras.length;
 report.totalSteps=main.reduce((n,m)=>n+m.steps.length,0)+extras.reduce((n,m)=>n+m.steps.length,0);
 assert.equal(report.totalMissions,16);
 const output=path.join(root,'artifacts/p1-audit');
 fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'mission-catalog.json'),JSON.stringify(report,null,2)+'\n');
 console.log('MISSION AUDIT: '+report.totalMissions+' missions, '+report.totalSteps+' steps');
});
