'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A=require('../gait.js');
test('face points in the actual travel direction irrespective of imported model forward axis',()=>{
 for(const face of [{x:0,z:1},{x:0,z:-1},{x:.9,z:.43},{x:-.7,z:-.7}]){
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[.6,.8],[-.6,-.8]]){
   const heading=A.headingForDirection(face,dx,dz);
   const dot=A.facingDot(face,heading,dx,dz);
   assert.ok(dot>.999999,{face,dx,dz,heading,dot});
  }
 }
 assert.ok(Math.abs(A.headingForDirection({x:0,z:1},1,0)-Math.PI/2)<.001);
 assert.ok(Math.abs(A.headingForDirection({x:0,z:-1},1,0)+Math.PI/2)<.001);
});
test('inverse-kinematic gait advances with distance, alternates feet and settles to idle',()=>{
 let s={phase:0,blend:0,totalDistance:0},all=[];
 for(let i=0;i<180;i++){s=A.sample(s,.031,1/60,i/60);all.push(s)}
 a.ok(s.totalDistance>5.4);
 a.ok(s.blend>.7);
 a.ok(all.some(v=>v.leftKnee>.25));
 a.ok(all.some(v=>v.rightKnee>.25));
 a.ok(all.some(v=>Math.abs(v.leftHip-v.rightHip)>.15));
 a.ok(all.some(v=>Math.abs(v.arms.left-v.arms.right)>.15));
 const stopped=A.sample(s,0,1/60,10);
 a.equal(stopped.phase,s.phase);
 a.equal(stopped.totalDistance,s.totalDistance);
 for(let i=0;i<60;i++)s=A.sample(s,0,1/60,10+i/60);
 a.ok(s.blend<.01);
 a.ok(Math.abs(s.leftKnee)<.01);
});

test('grounded gait stance remains planted and swing lifts alternating feet',()=>{
 let samples=[];
 for(let i=0;i<240;i++){const ph=2*Math.PI*i/240;samples.push([A.leg(ph,2),A.leg(ph+Math.PI,2)])}
 const stance=samples.map(s=>s[0]).filter(s=>s.planted);
 a.ok(stance.length>125);
 a.ok(stance.every(s=>s.lift===0));
 a.ok(samples.some(([l,r])=>l.lift>.045&&r.planted));
 a.ok(samples.some(([l,r])=>r.lift>.045&&l.planted));
 a.ok(samples.every(([l,r])=>[l,r].every(v=>Number.isFinite(v.hip)&&Number.isFinite(v.knee)&&Number.isFinite(v.ankle))));
});
