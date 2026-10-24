'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../camera-follow.js');
test('cutaway hides only the room side wall; keeps back wall, furniture and collision',()=>{
 assert.ok(C.CUTAWAY.includes('leftWall'));
 assert.ok(C.CUTAWAY.includes('leftBaseboardNew'));
 assert.ok(!C.CUTAWAY.includes('backWall'));
 assert.ok(!C.CUTAWAY.some(s=>/floor|fridge|counter|cabinet|hit_|rug/i.test(s)));
});
test('camera follows actual time with gentle movement across 30fps and 1fps browser',()=>{
 const values=[1/60,1/30,.05,.3].map(dt=>C.alpha(dt));
 assert.ok(values.every(x=>x>0&&x<1));
 for(let i=1;i<values.length;i++)assert.ok(values[i]>values[i-1]);
 assert.ok(values[3]>.8);
});
test('near fridge and dining table focus keeps Hanna dominant instead of distant walls',()=>{
 const fridge=C.focus(-2.95,.38,-2.95,1.9);
 const table=C.focus(-.4,-1.72,-.4,-.6);
 for(const a of [fridge,table]){
  assert.ok(a.x>=-3.05&&a.x<=3);
  assert.ok(a.z>=-2.65&&a.z<=1);
  assert.ok(a.y>1.1&&a.y<1.4);
 }
 assert.ok(fridge.x< -2.3);
 assert.ok(table.z< -1.2);
 assert.ok(C.framedHead(.4,.52));
 assert.ok(!C.framedHead(-.02,.54));
});
