'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const M=require('../object-motion.js');
test('fridge opens only once and remains open across many UI refreshes and seconds',()=>{
 const d=M.create('door');assert.equal(d.value,0);
 assert.equal(M.start(d),true);
 assert.equal(M.start(d),false);
 let history=[];
 for(let i=0;i<120;i++){history.push(M.tick(d,1/60));}
 assert.equal(d.plays,1);
 assert.equal(d.playing,false);assert.equal(d.value,1.44);
 assert.ok(history.every((x,i)=>i===0||x>=history[i-1]-1e-8));
 for(let i=0;i<500;i++){assert.equal(M.tick(d,.06),1.44);assert.equal(M.start(d),false)}
});
test('toast emerges once from below opening and table receives it once',()=>{
 const toast=M.create('toast'),plate=M.create('serve');
 assert.equal(toast.value,1.195);
 assert.ok(toast.value+.15<1.367,'initial toast must remain under slot lid');
 M.start(toast);
 for(let i=0;i<100;i++)M.tick(toast,.016);
 assert.equal(toast.value,1.39);
 assert.equal(toast.plays,1);
 assert.equal(M.start(toast),false);
 assert.equal(plate.value,.18);
 M.start(plate);
 for(let i=0;i<100;i++)M.tick(plate,.016);
 assert.equal(plate.value,0);assert.equal(plate.plays,1);
 M.settle(toast,true);assert.equal(toast.value,1.39);
 M.settle(plate,true);assert.equal(plate.value,0);
});

test('milk pickup closes the refrigerator once and stays closed',()=>{
 const open=M.create('door'),close=M.create('doorClose');M.start(open);
 for(let i=0;i<80;i++)M.tick(open,.02);
 assert.equal(open.value,1.44);assert.equal(M.start(close),true);
 let prev=1.44;for(let i=0;i<80;i++){const now=M.tick(close,.02);assert.ok(now<=prev+1e-8);prev=now}
 assert.equal(close.value,0);assert.equal(close.plays,1);assert.equal(M.start(close),false);
});
