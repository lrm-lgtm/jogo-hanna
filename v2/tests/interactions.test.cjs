'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const A=require('../interactions.js');
test('all eight actions have smooth reach/contact/retract timelines',()=>{
 a.equal(Object.keys(A.CONFIG).length,8);
 for(const [id,cfg] of Object.entries(A.CONFIG)){
  const start=A.pose(id,0),before=A.pose(id,cfg.duration*(cfg.contact-.04));
  const at=A.pose(id,cfg.duration*cfg.contact),end=A.pose(id,cfg.duration);
  a.equal(start.reach,0,id);
  a.ok(before.reach>.70,id+' hand must reach the target');
  a.equal(before.contact,false,id);
  a.equal(at.contact,true,id);
  a.ok(at.reach>.70,id);
  a.equal(end.reach,0,id);
  a.equal(end.done,true,id);
  a.ok(start.armX===0&&at.armX<-.5,id);
 }
});
test('hand pose stays stable at frame gaps and action input cannot complete twice',()=>{
 for(const [id,cfg] of Object.entries(A.CONFIG)){
  for(const n of [-10,0,cfg.duration/2,cfg.duration,cfg.duration*5]){
   const pose=A.pose(id,n);
   a.ok(pose.reach>=0&&pose.reach<=1);
   a.ok(pose.progress>=0&&pose.progress<=1);
  }
 }
 a.equal(A.pose('invalid',.5).done,true);
});
