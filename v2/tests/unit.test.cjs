'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {BreakfastMission,STEPS,KEY,createMemoryStore}=require('../mission.js');
const Q=require('../quality.js');
test('eight sequential, validated actions',()=>{
 const storage=createMemoryStore(),m=new BreakfastMission({storage,now:()=>123});
 assert.equal(STEPS.length,8);
 for(let i=0;i<8;i++){
  assert.equal(m.canInteract('wrong',0).reason,'wrong-target');
  assert.equal(m.canInteract(STEPS[i].target,9).reason,'too-far');
  assert.equal(m.step,i);
  assert.equal(m.advance(STEPS[i].target,.3).ok,true);
  assert.equal(m.flags[STEPS[i].effect],true);
 }
 assert.equal(m.completed,true);
 assert.equal(m.advance('table',0).reason,'completed');
 assert.deepEqual(JSON.parse(storage.getItem(KEY)),{schema:2,step:8,updated:123});
});
test('saved state restored without altering v1.9 or pilot',()=>{
 const storage=createMemoryStore();
 storage.setItem('hanna_kitchen_pilot_v1','{"schema":1,"step":3}');
 const m=new BreakfastMission({storage});
 m.advance('fridge',.2);m.advance('milk',.2);
 const resumed=new BreakfastMission({storage});
 assert.equal(resumed.step,2);assert.equal(resumed.flags.milkHeld,true);
 assert.equal(storage.getItem('hanna_kitchen_pilot_v1'),'{"schema":1,"step":3}');
 resumed.reset();assert.equal(new BreakfastMission({storage}).step,0);
});
test('corrupt save or blocked localStorage does not block play',()=>{
 const storage=createMemoryStore();
 storage.setItem(KEY,'{"schema":999,"step":8}');
 assert.equal(new BreakfastMission({storage}).step,0);
 storage.setItem(KEY,'{"schema":2,"step":99}');
 assert.equal(new BreakfastMission({storage}).step,0);
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};
 const m=new BreakfastMission({storage:blocked});
 assert.equal(m.advance('fridge',.2).ok,true);assert.equal(m.step,1);
});
test('quality profiles and storage',()=>{
 assert.equal(Q.select('auto',{mobile:true,memory:2}).resolved,'baixo');
 assert.equal(Q.select('auto',{mobile:false,width:1440,cores:8}).resolved,'alto');
 assert.equal(Q.select('medio').shadow,768);
 assert.equal(Q.select('nitido').pixels,3);
 assert.equal(Q.select('nitido').samples,4);
 assert.equal(Q.select('auto',{mobile:true,memory:8,cores:8}).resolved,'alto');
 assert.ok(Math.abs(Q.hardwareScale(Q.select('medio'),3,{width:850,height:390})-1/1.85)<.0001);
 assert.ok(Math.abs(Q.hardwareScale(Q.select('nitido'),3,{width:850,height:390})-1/3)<.0001);
 assert.equal(Q.hardwareScale(Q.select('alto'),1,{width:1280,height:720}),1);
 assert.ok(Q.hardwareScale(Q.select('nitido'),3,{width:2000,height:900})>=.625);
 const s=createMemoryStore();assert.equal(Q.save(s,'alto'),true);assert.equal(Q.load(s),'alto');
 assert.equal(Q.save(s,'wrong'),false);
});
test('unique IDs, all required animation and direction data',()=>{
 assert.equal(new Set(STEPS.map(s=>s.id)).size,8);
 for(const s of STEPS){assert.ok(s.text&&s.voice&&s.target&&s.verb&&s.animation&&s.feedback);assert.equal(s.nav.length,2)}
});